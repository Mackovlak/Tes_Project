import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { generateID } from "@/utils/generateID";
import { notifySocket } from "../../../../lib/SocketClient";
import { STATUS_ENUM_TO_LABEL } from "@/utils/EnumToLabel";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const woidParamRaw = searchParams.get("WOID");

    if (!woidParamRaw || woidParamRaw.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: "Parameter 'WOID' tidak valid atau kosong",
        data: [],
      }, { status: 400 });
    }

    const woidList = woidParamRaw.split(",").map((id) => id.trim());

         // Initialize search filters
         const materialOrders = await prisma.materialorder.findMany({
            where: {
              WOID: { in: woidList }
            },
            include: {
                workorder: {
                    include: {
                        caseinformation: {
                            include:{
                                site_account : true,
                                contact_information : true
                            }
                        },
                        bookings: {
                            include: {
                                bookingDetails: true
                            }
                        }
                    }
                },
                owner: true,
                materialorderlineitems: true

            }
          });
          return NextResponse.json({
            success: true,
            message: "List Data Material Order",
            data: materialOrders,
          });

}catch (err) {
  console.error("🔥 ERROR in GET API:", err);

  return NextResponse.json({
    success: false,
    message: "Failed to fetch data",
    error: err.message,
  }, { status: 500 });
}
}

// Create a new Material Order for an existing Work Order (WO)
export async function POST(request) {
  try {
    const body = await request.json();
    const { WOID, selectedPartCatalog = [], OwnerID, assignApo, notesLog} = body;
    
    const normalizeNote = (value) =>
            typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";

    const toNumberOrNull = (value) => {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const numeric = Number(value);
        return Number.isNaN(numeric) ? null : numeric;
    };

    const ownerIdNumber = toNumberOrNull(OwnerID);
    const assignApoId = toNumberOrNull(assignApo);

    if (!WOID || typeof WOID !== "string") {
      return NextResponse.json({
        success: false,
        message: "Invalid or missing WOID",
      }, { status: 400 });
    }
    
    if (!Array.isArray(selectedPartCatalog) || selectedPartCatalog.length === 0) {
      return NextResponse.json({
        success: false,
        message: "selectedPartCatalog must contain at least one item",
      }, { status: 400 });
    }
    
    // Fetch related Work Order and Case for logging/notes context
    const workOrder = await prisma.workorder.findUnique({
      where: { WOID },
      include: {
        caseinformation: {
          select: { 
            CaseStatus: true,
            CaseID: true, 
            Owner: true, 
            CreatedBy: true,
            asset_information: {
              select: {
                AssetID: true,
                Warranty_Status: true,
                WarrantyOTCCode: {
                  select: {
                    WarrantyCondition: true,
                  },
                },
              }
            },
            ownerUser: {
              select: {
                IDUser: true,
                Name: true
              }
            }
          }
        }
      }
    });

    const includeChangedBy = {
      changedByUser: {
          select: {
              IDUser: true,
              Name: true,
              Email: true,
          },
      },
    };
    const createdMOIDs = [];
    const createdLogs = [];
    const generatedNotes = new Set();
    let lineNumber = 1;

    if (!workOrder) {
      return NextResponse.json({
        success: false,
        message: "Work Order not found",
      }, { status: 404 });
    }
    const warrantyCondition = workOrder?.caseinformation?.asset_information?.WarrantyOTCCode?.WarrantyCondition
    const isOutWarranty = warrantyCondition === "OutWarranty";
    
    const newOwnerUser = assignApoId !== null
      ? await prisma.user.findUnique({
          where: { IDUser: assignApoId },
          select: {
              IDUser: true,
              Name: true,
          },
      })
      : null;
    
    const caseInfo = workOrder.caseinformation;
    const CaseID = caseInfo.CaseID;

    const oldOwnerName = caseInfo.ownerUser?.Name ?? (caseInfo.Owner != null ? String(caseInfo.Owner) : "-");
    const newOwnerName = newOwnerUser?.Name ?? (assignApo != null ? String(assignApo) : "-");

    const previousCaseStatus = caseInfo.CaseStatus;
    const materialOrderOwnerID = assignApoId ?? OwnerID ?? caseInfo?.Owner ?? workOrder.OwnerID ?? null;

    if (!materialOrderOwnerID) {
      return NextResponse.json({
        success: false,
        message: "OwnerID or assignApo is required",
      }, { status: 400 });
    }

    const { MOIDs, actionLog } = await prisma.$transaction(async (tx) => {


      for (const part of selectedPartCatalog) {
        const MOID = await generateID("MO-", "materialorder", "MOID", tx, "MO_Number");
        await tx.materialorder.create({
            data: {
                MOID,
                WOID,
                OrderStatus: "New",
                OrderType: "Repair",
                OwnerID: materialOrderOwnerID,
            },
        });

        await tx.materialorderlineitems.create({
            data: {
                LineNumber: lineNumber++,
                Description: part.PartDescription,
                Price: part.Price != null ? parseFloat(part.Price) : 0,
                Quantity: part.qty || 1,
                Status: "New",
                RemovedPartNumber: part.RemovedPartNumber ?? null,
                UEFICode: part.UEFICode ?? null,    
                UEFI_NO: part.UEFI_NO ?? null,         
                materialorder: { connect: { MOID } },
                servicecatalog_parts: part.PartNumber
                    ? { connect: { PartNumber: part.PartNumber } }
                    : undefined,
            },
        });

        const noteWarranty = isOutWarranty ? 'Request Quotation' : "Order"

        const noteLines = [
            "[NOTICE] "+noteWarranty+" Part",
            `${noteWarranty} Part : ${part.PartNumber ?? "-"} - ${part.PartDescription ?? "-"}`
        ];

        if (isOutWarranty && part.Price !== undefined && part.Price !== null && part.Price !== "") {
            noteLines.push(`Harga : Rp. ${part.Price}`);
        }

        if (part.RemovedPartNumber) {
            noteLines.push(`Return CT Key : ${part.RemovedPartNumber}`);
        }
        if (part.UEFICode) {
            noteLines.push(`UEFI Code : ${part.UEFICode}`);
        }
        if (part.UEFI_NO) {
            noteLines.push(`UEFI No : ${part.UEFI_NO}`);
        }


        const requestedRecipient =
            assignApo != null
                ? (newOwnerName && newOwnerName !== "-" ? newOwnerName : String(assignApo))
                : materialOrderOwnerID != null
                ? String(materialOrderOwnerID)
                : "-";

        const targetQuotation = isOutWarranty ? "CM" : "APO"
        noteLines.push(`Requested to ${targetQuotation} : ${requestedRecipient}`);

        const noteText = noteLines.join("\n");

        await tx.casenotes.create({
            data: {
                CaseID,
                LogType: "NoticeOrderNote",
                ActionType: "Action Plan",
                Template: "",
                VisibleExternally: true,
                MinutesSpent: 0,
                Note: noteText,
                CreatedBy: ownerIdNumber,
            },
        });

        generatedNotes.add(normalizeNote(noteText));

        const perMoLog = await tx.ActionLog.create({
            data: {
                CaseID_toActionLog: {
                    connect: { CaseID },
                },
                ReferenceId: MOID,
                model: "Material Order",
                dataOld: "New",
                dataNew: "New",
                changedByUser: ownerIdNumber
                    ? {
                          connect: { IDUser: ownerIdNumber },
                      }
                    : undefined,
                logDescription: `New Material Order : ${MOID}`,
            },
            include: includeChangedBy,
        });

        createdLogs.push(perMoLog);
        createdMOIDs.push(MOID);
      }

      const trimmedNotesLog = normalizeNote(notesLog);
      if (trimmedNotesLog && !generatedNotes.has(trimmedNotesLog)) {
          await tx.casenotes.create({
              data: {
                  CaseID,
                  LogType: "NotesLog",
                  ActionType: "Action Plan",
                  Template: "",
                  VisibleExternally: true,
                  MinutesSpent: 0,
                  Note: notesLog,
                  CreatedBy: ownerIdNumber,
              },
          });
      }

    
      const caseUpdateData = { CaseStatus: "PartRequest" };
      if(isOutWarranty) caseUpdateData.CaseStatus = "Quote_Requested"

      if (assignApoId !== null) {
          caseUpdateData.Owner = assignApoId;
      }   

      await tx.caseinformation.update({
          where: { CaseID },
          data: caseUpdateData,
      });

      if (assignApoId !== null && assignApoId !== caseInfo.Owner) {
          const ownerLog = await tx.ActionLog.create({
              data: {
                  CaseID_toActionLog: {
                      connect: { CaseID },
                  },
                  model: "CaseOwner",
                  dataOld: oldOwnerName,
                  dataNew: newOwnerName,
                  changedByUser: ownerIdNumber
                      ? {
                            connect: { IDUser: ownerIdNumber },
                        }
                      : undefined,
                  logDescription: `Edit: change owner from ${oldOwnerName} to ${newOwnerName}`,
              },
              include: includeChangedBy,
          });

          createdLogs.push(ownerLog);
      }

      const statusLog = await tx.ActionLog.create({
          data: {
              CaseID_toActionLog: {
                  connect: { CaseID },
              },
              model: "Case",
              dataOld: previousCaseStatus,
              dataNew: caseUpdateData.CaseStatus,
              changedByUser: ownerIdNumber
                  ? {
                        connect: { IDUser: ownerIdNumber },
                    }
                  : undefined,
              logDescription: `Edit: change status from ${STATUS_ENUM_TO_LABEL[previousCaseStatus]} to ${STATUS_ENUM_TO_LABEL[caseUpdateData.CaseStatus]}`,
          },
          include: includeChangedBy,
      });
      createdLogs.push(statusLog);
      

      return { MOIDs: createdMOIDs, actionLogs: createdLogs };
    }, { timeout: 20000 });

    // Notify listeners of created log
    if (actionLog && caseInfo) {
      await notifySocket("log:created", actionLog, {
        createdById: caseInfo.CreatedBy || null,
        ownerId: caseInfo.Owner || null,
        CaseId: caseInfo.CaseID,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Material Order created successfully",
      MOID: (MOIDs && MOIDs.length > 0) ? MOIDs[MOIDs.length - 1] : undefined,
      MOIDs,
      many: Array.isArray(MOIDs) && MOIDs.length > 1
    });
  } catch (err) {
    console.error("dY” ERROR Create Material Order:", err);
    return NextResponse.json({
      success: false,
      message: "Failed to create material order",
      error: err.message,
    }, { status: 500 });
  }
}


// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get("search") || "";
//     const woidParam = searchParams.get("WOID");

//     // Validasi dan parsing WOID
//     const woidArray = woidParam
//       ? woidParam
//           .split(",")
//           .map(w => w.trim())
//           .filter(w => w.length > 0 && w.length <= 13) // Validasi maksimal 13 karakter
//       : [];

//     if (woidArray.length === 0) {
//       return NextResponse.json({
//         success: false,
//         message: "Parameter 'WOID' tidak valid atau kosong",
//         data: [],
//       }, { status: 400 });
//     }

//     // Ambil data materialorder yang sesuai
//     const materialOrders = await prisma.materialorder.findMany({
//       where: {
//         WOID: { in: woidArray },
//       },
//       orderBy: {
//         CreatedOn: "desc",
//       },
//       include: {
//         owner: true,
//         workorder: true,
//         materialorderlineitems: true,
//         childMOs: true,
//         parentMO: true,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "List Data Material Order",
//       data: materialOrders,
//     });

//   } catch (err) {
//     console.error("🔥 ERROR in GET API:", err);

//     return NextResponse.json({
//       success: false,
//       message: "Failed to fetch data",
//       error: err.message,
//     }, { status: 500 });
//   }
// }
