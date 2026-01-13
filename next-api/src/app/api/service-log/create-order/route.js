import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

import { generateID } from "@/utils/generateID";
import { handleActionLogNotifications } from "../../../../../lib/actionLogDispatcher";
const CASE_INFO_SELECT = {
    CaseID: true,
    CaseSubject: true,
    Owner: true,
    CreatedBy: true,
    ownerUser: {
        select: {
            IDUser: true,
            Name: true,
            Email: true,
        },
    },
    createdByUser: {
        select: {
            IDUser: true,
            Name: true,
            Email: true,
        },
    },
};


export async function POST(request) {
    try{
        const body = await request.json()
        // return console.log("オーダー",body);
        const { AssetID, CaseID, selectedWarrantyServices, selectedPartCatalog, IncidentType, OwnerID, assignApo, notesLog } = body;

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
        const assetIdNumber = toNumberOrNull(AssetID);

        //validate owner
        const materialOrderOwnerID = assignApoId ?? ownerIdNumber;

        // opt : get case info 
        const caseInfo = await prisma.caseinformation.findUnique({
            where: { CaseID: CaseID },
            select: {
                CaseStatus: true,
                Owner: true,
                CreatedBy: true,
                ownerUser: {
                    select: {
                        IDUser: true,
                        Name: true,
                    },
                },
            }
        })

        if(!caseInfo) throw new Error("Case not found");
        
        const assetWarrantyInfo = assetIdNumber !== null
            ? await prisma.asset_information.findUnique({
                where: { AssetID: assetIdNumber },
                select: {
                    AssetID: true,
                    Warranty_Status: true,
                    WarrantyOTCCode: {
                        select: {
                        	WarrantyCondition: true,
                        },
                    },
                },
            })
            : null;

        const warrantyCondition = assetWarrantyInfo?.WarrantyOTCCode?.WarrantyCondition ?? null;
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

        const oldOwnerName = caseInfo.ownerUser?.Name ?? (caseInfo.Owner != null ? String(caseInfo.Owner) : "-");
        const newOwnerName = newOwnerUser?.Name ?? (assignApo != null ? String(assignApo) : "-");

        const previousCaseStatus = caseInfo.CaseStatus;

        // start atomic transaction
        const { WOID, MOIDs, actionLogs } = await prisma.$transaction(async (tx) => {
            //Generate ID
            const WOID = await generateID("WO-", "workorder", "WOID", tx, "WO_Number"); 
            console.log("Generated ID:", WOID, typeof WOID);

            // 1. Create Work Order
            await tx.workorder.create({
                data: {
                    WOID,
                    CaseID,
                    WorkOrderType: IncidentType,
                    WorkOrderNumber: WOID,
                    SystemStatus: "OPEN_UNSCHEDULED",
                    OwnerID: ownerIdNumber
                }
            });

            // 2. Create ServiceCatalog for each selected warranty
            const createdServiceCatalog = await tx.servicecatalog.create({
                data: {
                    AssetID,
                    Service_offerID: selectedWarrantyServices.Service_offerID,
                    Price: selectedWarrantyServices.Price,
                    Tax: selectedWarrantyServices.Tax,
                    Total: selectedWarrantyServices.Total
                },
                select: { ServiceCatalogID: true }
            });

            // Link the chosen warranty service to this Work Order
            await tx.workorder.update({
                where: { WOID },
                data: { ServiceCatalogID: createdServiceCatalog.ServiceCatalogID }
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

                 const workOrderLog = await tx.ActionLog.create({
                    data: {
                        CaseID_toActionLog: {
                            connect: { CaseID },
                        },
                        ReferenceId: WOID,
                        model: "Work",
                        dataOld: "OPEN_UNSCHEDULED",
                        dataNew: "OPEN_UNSCHEDULED",
                        changedByUser: ownerIdNumber
                            ? {
                                connect: { IDUser: ownerIdNumber },
                            }
                            : undefined,
                        logDescription: `New Work Order : ${WOID}`,
                    },
                    include: includeChangedBy,
                });
                createdLogs.push(workOrderLog);

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
                    logDescription: `Edit: change status from ${previousCaseStatus} to ${caseUpdateData.CaseStatus}`,
                },
                include: includeChangedBy,
            });
            createdLogs.push(statusLog);

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

            return { WOID, MOIDs: createdMOIDs, actionLogs: createdLogs };
        }, { timeout: 50000 })

        const latestCaseInfo = await prisma.caseinformation.findUnique({
            where: { CaseID },
            select: CASE_INFO_SELECT,
        });

        let caseInfoForNotifications = latestCaseInfo;

        for (const log of actionLogs) {
            const { caseInfo: updatedCaseInfo } = await handleActionLogNotifications({
                actionLog: log,
                caseInfo: caseInfoForNotifications,
            });

            if (updatedCaseInfo) {
                caseInfoForNotifications = updatedCaseInfo;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Order created successfully", 
            WOID,
            MOID: (MOIDs && MOIDs.length > 0) ? MOIDs[MOIDs.length - 1] : undefined,
            MOIDs,
            many: Array.isArray(MOIDs) && MOIDs.length > 1
        });



    }catch(err){
        console.error("🔥 ERROR Create Order:", err);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to create order", 
            error: err.message 
        }, { 
            status: 500 
        });
    }
}
