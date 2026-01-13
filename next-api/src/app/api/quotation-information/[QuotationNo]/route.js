import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";
import {
  calculateTotals,
  mapQuotationResponse,
  normalizeLineItemPayload,
  parseDate,
} from "../helpers";

export async function GET(_request, { params }) {
  const { QuotationNo } = params;

  try {
    const quotation = await prisma.quotationtable.findUnique({
      where: { QuotationNo },
      include: {
        quotation_lineitem: {
          include: { lineItem: true },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          message: "Quotation tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: mapQuotationResponse(quotation),
    });
  } catch (error) {
    console.error("Error fetching quotation detail:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data quotation.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  const { QuotationNo } = params;

  try {
    const body = await request.json();
    const {
      status,
      quotationType,
      vatValue,
      quotationNote,
      laborFee,
      quotationDate,
      quoteApproveDate,
      quoteDecision,
      sendWa,
      sendEmail,
      userAssign,
      currency,
      lineItems = [],
      caseId,
      createdBy
    } = body;
    // return console.log(body);

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Line item wajib disertakan.",
        },
        { status: 400 },
      );
    }

    const requireApproval = status === "Pending_Quote";
    let normalizedLineItems;
    try {
      normalizedLineItems = lineItems.map((item) =>
        normalizeLineItemPayload(item, requireApproval),
      );
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError.message,
        },
        { status: 400 },
      );
    }

    const lineItemIds = normalizedLineItems.map((item) => item.lineItemId);
    const uniqueLineItemIds = [...new Set(lineItemIds)];

    if (uniqueLineItemIds.length !== lineItemIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Terdapat line item duplikat pada permintaan.",
        },
        { status: 400 },
      );
    }

    const relatedLineItems = await prisma.materialorderlineitems.findMany({
      where: { LineItemID: { in: uniqueLineItemIds } },
      select: {
        LineItemID: true,
        Quantity: true,
        materialorder: {
          select: {
            MOID: true,
            workorder: {
              select: {
                CaseID: true,
                WOID: true,
                owner: {
                  select: {
                    IDUser: true,
                    Name: true,
                    Role: true,
                    Username: true
                  }
                }
              }
            }
          },
        },
      },
    });


    if (relatedLineItems.length !== uniqueLineItemIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Beberapa line item tidak ditemukan di material order.",
        },
        { status: 404 },
      );
    }

    

    const quantityMap = new Map(
      relatedLineItems.map((item) => [item.LineItemID, item.Quantity ?? 1]),
    );

    const totals = calculateTotals(
      normalizedLineItems,
      quantityMap,
      laborFee,
      vatValue,
    );

    const normalizeDecisionValue = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const lowered = String(value).toLowerCase();
      if (lowered === "approved" || lowered === "approve") return "Approved";
      if (lowered === "rejected" || lowered === "reject") return "Rejected";
      throw new Error("Nilai quoteDecision tidak valid. Gunakan approve atau reject.");
    };

    const hasDecisionInput = quoteDecision !== undefined;
    let decisionValue = null;
    if (hasDecisionInput) {
      try {
        decisionValue = normalizeDecisionValue(quoteDecision);
      } catch (validationError) {
        return NextResponse.json(
          {
            success: false,
            message: validationError.message,
          },
          { status: 400 },
        );
      }
    }

    if (requireApproval && !decisionValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Quote decision wajib dipilih ketika status Pending Quote.",
        },
        { status: 400 },
      );
    }

    let targetStatusCase = ''
    if (requireApproval) {
      const statusMap = {
        Approved: 'Quote_Approved',
        Rejected: 'Quote_Rejected',
      };
      targetStatusCase = statusMap[decisionValue] || 'Quote_Approved';

    } else {
      targetStatusCase = 'Pending_Quote';
    }

    const includeChangedBy = {
      changedByUser: {
          select: {
              IDUser: true,
              Name: true,
              Email: true,
          },
      },
    };
    
    // return console.log("Apa ini:",normalizedLineItems)
    const quotation = await prisma.$transaction(async (tx) => {
      const existingLineItems = await tx.quotation_lineitem.findMany({
        where: { QuotationNo },
        select: { id: true, LineItemID: true },
      });

      const caseInfo = await prisma.caseinformation.findUnique({
        where: { CaseID: caseId },
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

      const newOwnerUser = userAssign !== null
        ? await prisma.user.findUnique({
            where: { IDUser: userAssign },
            select: {
                IDUser: true,
                Name: true,
            },
        })
        : null;

      const oldOwnerName = caseInfo.ownerUser?.Name ?? (caseInfo.Owner != null ? String(caseInfo.Owner) : "-");
      const newOwnerName = newOwnerUser?.Name ?? (userAssign != null ? String(userAssign) : "-");

    
      const updated = await tx.quotationtable.update({
        where: { QuotationNo },
        data: {
          ...(quotationType && { QuotationType: quotationType }),
          ...(currency && { Currency: currency }),
          LaborFee: Number.parseInt(laborFee ?? 0, 10) || 0,
          VatValue: vatValue !== undefined && vatValue !== null && vatValue !== ""
            ? Number.parseInt(vatValue, 10)
            : null,
          Subtotal: totals.subtotal,
          VATAmount: totals.vatAmount,
          GrandTotal: totals.grandTotal,
          QuotationDate: parseDate(quotationDate) ?? new Date(),
          QuotationApprovedDate: parseDate(quoteApproveDate),
          // ...(userAssign !== undefined && {
          //   UserAssign: Number.parseInt(userAssign, 10),
          // }),
          QuotationNote: quotationNote ?? null,
          ...(sendWa !== undefined && { SendWa: Boolean(sendWa) }),
          ...(sendEmail !== undefined && { SendEmail: Boolean(sendEmail) }),
          ...(hasDecisionInput && { QuoteDecision: decisionValue }),
        },
      });

      const incomingIds = new Set(uniqueLineItemIds);

      await Promise.all(
        normalizedLineItems.map((item) =>
          tx.quotation_lineitem.upsert({
            where: {
              QuotationNo_LineItemID: {
                QuotationNo,
                LineItemID: item.lineItemId,
              },
            },
            update: {
              Price: item.price,
              Approved: item.approved,
            },
            create: {
              QuotationNo,
              LineItemID: item.lineItemId,
              Price: item.price,
              Approved: item.approved,
            },
          }),
        ),
      );
      const rejectedLineItemIds = normalizedLineItems
        .filter((item) => !item.approved)
        .map((item) => item.lineItemId);
      

      if (decisionValue === 'Rejected') {        
        await tx.materialorderlineitems.updateMany({
          where: {
            LineItemID: {
              in: normalizedLineItems.map((item) => item.lineItemId),
            },
          },
          data: {
            Status: 'Cancelled',
          },
        });

        await tx.materialorder.updateMany({
          where: {
            MOID: {
              in: relatedLineItems.map((item) => item.materialorder?.MOID),
            }
          },
          data:{
            OrderStatus: 'Cancelled'
          }
        })
      } else if(rejectedLineItemIds.length > 0){
        await tx.materialorderlineitems.updateMany({
          where: {
            LineItemID: { in: rejectedLineItemIds },
          },
          data:{
            Status: 'Cancelled',
          }
        })

        await tx.materialorder.updateMany({
          where:{
            MOID: {
              in: relatedLineItems
                .filter((item) => rejectedLineItemIds.includes(item.LineItemID))
                .map((item) => item.materialorder?.MOID)
                .filter((moid) => moid != null),
            }
          },
          data: {
            OrderStatus: 'Cancelled'
          }
        })
      }

      const obsoleteIds = existingLineItems
        .filter((item) => !incomingIds.has(item.LineItemID))
        .map((item) => item.id);

      if (obsoleteIds.length > 0) {
        await tx.quotation_lineitem.deleteMany({
          where: { id: { in: obsoleteIds } },
        });
      }

      /**
       * NOTE : THIS TEMPORARY ADAPTABLE TABLE FUNCTION NOT WORKING
       * FIND OUT WHY
       * THE PRICE WAS NOT UPDATED
       */
      await Promise.all(
        normalizedLineItems.map(async (item) => {
          const existing = await tx.materialorderlineitems.findUnique({
            where: { LineItemID: item.lineItemId },
          });

          if (!existing || !existing.MOID) {
            throw new Error(`MOID not found for LineItemID ${item.lineItemId}`);
          }

          await tx.materialorderlineitems.update({
            where: { LineItemID: item.lineItemId },
            data: { 
              Price: item.price,
            },
          })

          const moid = await tx.materialorder.update({
            where: {MOID: existing.MOID },
            data:{OwnerID: userAssign}
          })
        }),
      );

      const caseUpdateData = { CaseStatus: targetStatusCase };
      if(targetStatusCase !== "Pending_Quote"){
        caseUpdateData.Owner = userAssign

        await tx.ActionLog.create({
          data: {
            CaseID_toActionLog: {
              connect: { CaseID: caseId },
            },
            ReferenceId: caseId,
            model: "CaseOwner",
            dataOld: oldOwnerName,
            dataNew: newOwnerName,
            changedByUser: createdBy
              ? {
                  connect: { IDUser: createdBy },
                }
              : undefined,
            logDescription: `Edit: change owner from ${oldOwnerName} to ${newOwnerName}`,
          },
          include: includeChangedBy,
        });
      }
      await tx.caseinformation.update({
        where: { CaseID: caseId },
        data: caseUpdateData,
      })

      await tx.casenotes.create({
        data: {
          CaseID: caseId,
          LogType: "NotesLog",
          ActionType: "Action Plan",
          Template: "",
          VisibleExternally: true,
          MinutesSpent: 0,
          Note: `[QUOTATION] ${quotationType} Quotation ${QuotationNo} ${decisionValue}`,
          CreatedBy: createdBy ?? Number.parseInt(userAssign, 10) ?? null,
        },
      });

      if(quotationNote !== null) {
        await tx.casenotes.create({
          data: {
            CaseID: caseId,
            LogType: "System Info",
            ActionType: "Quotation Request",
            Template: "",
            VisibleExternally: true,
            MinutesSpent: 0,
            Note: quotationNote,
            CreatedBy: createdBy ?? Number.parseInt(userAssign, 10) ?? null,
          },
        });
      }
      await tx.ActionLog.create({
        data: {
          CaseID_toActionLog: {
            connect: { CaseID: caseId },
          },
          ReferenceId: QuotationNo,
          model: "Quotation Log",
          dataOld: status,
          dataNew: targetStatusCase,
          changedByUser: createdBy
            ? {
                connect: { IDUser: createdBy },
              }
            : undefined,
          logDescription: `Edit: change status from ${status} to ${targetStatusCase}`,
        },
        include: includeChangedBy,
      });

      return tx.quotationtable.findUnique({
        where: { QuotationNo: updated.QuotationNo },
        include: {
          quotation_lineitem: {
            include: { lineItem: true },
          },
        },
      });
    },{timeout: 60000});

    return NextResponse.json({
      success: true,
      message: "Quotation berhasil diperbarui.",
      data: mapQuotationResponse(quotation),
    });
  } catch (error) {
    console.error("Error updating quotation:", error);
    const status = error.message?.includes("LineItemID")
      ? 400
      : 500;
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui quotation.",
        error: error.message,
      },
      { status },
    );
  }
}
