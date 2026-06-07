import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { generateID } from "@/utils/generateID";
import {
  calculateTotals,
  mapQuotationResponse,
  normalizeLineItemPayload,
  parseDate,
} from "./helpers";
import redis, { redisKey } from "../../../../lib/redis";
import { STATUS_ENUM_TO_LABEL } from "@/utils/EnumToLabel";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const quotationNo = searchParams.get("quotationNo");
    const caseId = searchParams.get("caseId");

    if (quotationNo) {
      const quotation = await prisma.quotationtable.findUnique({
        where: { QuotationNo: quotationNo },
        include: {
          quotation_lineitem: {
            include: { lineItem: true },
            orderBy: { id: "asc" },
          },
        },
      });

      if (!quotation) {
        return NextResponse.json(
          {
            success: false,
            message: "Quotation tidak ditemukan.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: mapQuotationResponse(quotation),
      });
    }

    if (caseId) {
      const caseRecord = await prisma.caseinformation.findUnique({
        where: { CaseID: caseId },
        select: {
          CaseID: true,
          workorder: {
            select: {
              materialorder: {
                select: {
                  materialorderlineitems: {
                    select: { LineItemID: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!caseRecord) {
        return NextResponse.json(
          {
            success: false,
            message: "Case tidak ditemukan.",
          },
          { status: 404 }
        );
      }

      const lineItemIds = new Set();
      caseRecord.workorder.forEach((wo) => {
        wo.materialorder.forEach((mo) => {
          mo.materialorderlineitems.forEach((line) => {
            if (line.LineItemID) {
              lineItemIds.add(line.LineItemID);
            }
          });
        });
      });

      if (lineItemIds.size === 0) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      const quotationLines = await prisma.quotation_lineitem.findMany({
        where: { LineItemID: { in: Array.from(lineItemIds) } },
        include: {
          quotation: true,
          lineItem: true,
        },
        orderBy: {
          quotation: { QuotationDate: "desc" },
        },
      });

      if (quotationLines.length === 0) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      const grouped = new Map();
      quotationLines.forEach((line) => {
        const existing = grouped.get(line.QuotationNo);
        if (existing) {
          existing.lines.push(line);
        } else {
          grouped.set(line.QuotationNo, {
            quotation: line.quotation,
            lines: [line],
          });
        }
      });

      const latestEntry = Array.from(grouped.values()).sort((a, b) => {
        const dateA = a.quotation.QuotationDate
          ? new Date(a.quotation.QuotationDate)
          : new Date(0);
        const dateB = b.quotation.QuotationDate
          ? new Date(b.quotation.QuotationDate)
          : new Date(0);
        return dateB - dateA;
      })[0];

      return NextResponse.json({
        success: true,
        data: mapQuotationResponse({
          ...latestEntry.quotation,
          quotation_lineitem: latestEntry.lines.map((line) => ({
            ...line,
            lineItem: line.lineItem,
          })),
        }),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Parameter pencarian tidak valid. Gunakan 'quotationNo' atau 'caseId'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data quotation.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      status,
      quotationType = "Simple",
      vatValue,
      quotationNote,
      laborFee,
      quotationDate,
      quoteApproveDate,
      quoteDecision,
      sendWa = false,
      sendEmail = false,
      userAssign,
      currency = "IDR",
      lineItems = [],
      caseId,
      createdBy
    } = body;

    if (!userAssign) {
      return NextResponse.json(
        {
          success: false,
          message: "UserAssign wajib disertakan.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Line item wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const requireApproval = status === "Pending_Quote";
    let normalizedLineItems;
    try {
      normalizedLineItems = lineItems.map((item) =>
        normalizeLineItemPayload(item, requireApproval)
      );
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError.message,
        },
        { status: 400 }
      );
    }

    const normalizeDecisionValue = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const lowered = String(value).toLowerCase();
      if (lowered === "approved" || lowered === "approve") return "Approved";
      if (lowered === "rejected" || lowered === "reject") return "Rejected";
      throw new Error(
        "Nilai quoteDecision tidak valid. Gunakan approve atau reject."
      );
    };

    let decisionValue = null;
    try {
      decisionValue = normalizeDecisionValue(quoteDecision);
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError.message,
        },
        { status: 400 }
      );
    }

    if (requireApproval && !decisionValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Quote decision wajib dipilih ketika status Pending Quote.",
        },
        { status: 400 }
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

    const lineItemIds = normalizedLineItems.map((item) => item.lineItemId);
    const uniqueLineItemIds = [...new Set(lineItemIds)];

    if (uniqueLineItemIds.length !== lineItemIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Terdapat line item duplikat pada permintaan.",
        },
        { status: 400 }
      );
    }

    const relatedLineItems = await prisma.materialorderlineitems.findMany({
      where: { LineItemID: { in: uniqueLineItemIds } },
      select: { LineItemID: true, Quantity: true },
    });

    if (relatedLineItems.length !== uniqueLineItemIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Beberapa line item tidak ditemukan di material order.",
        },
        { status: 404 }
      );
    }

    const quantityMap = new Map(
      relatedLineItems.map((item) => [item.LineItemID, item.Quantity ?? 1])
    );

    const totals = calculateTotals(
      normalizedLineItems,
      quantityMap,
      laborFee,
      vatValue
    );

    const includeChangedBy = {
      changedByUser: {
          select: {
              IDUser: true,
              Name: true,
              Email: true,
          },
      },
    };
    const quotation = await prisma.$transaction(async (tx) => {
      const quotationNo = await generateID(
        "Q-",
        "quotationtable",
        "QuotationNo",
        tx,
        "Quote_No_Search"
      );

      await tx.quotationtable.create({
        data: {
          QuotationNo: quotationNo,
          QuotationType: quotationType,
          Currency: currency,
          LaborFee: Number.parseInt(laborFee ?? 0, 10) || 0,
          VatValue:
            vatValue !== undefined && vatValue !== null && vatValue !== ""
              ? Number.parseInt(vatValue, 10)
              : null,
          Subtotal: totals.subtotal,
          VATAmount: totals.vatAmount,
          GrandTotal: totals.grandTotal,
          QuotationDate: parseDate(quotationDate) ?? new Date(),
          QuotationApprovedDate: parseDate(quoteApproveDate),
          UserAssign: Number.parseInt(userAssign, 10),
          QuotationNote: quotationNote ?? null,
          SendWa: Boolean(sendWa),
          SendEmail: Boolean(sendEmail),
          QuoteDecision: decisionValue,
        },
      });

      await Promise.all(
        normalizedLineItems.map((item) =>
          tx.materialorderlineitems.update({
            where: { LineItemID: item.lineItemId },
            data: { Price: item.price },
          })
        )
      );

      await tx.quotation_lineitem.createMany({
        data: normalizedLineItems.map((item) => ({
          QuotationNo: quotationNo,
          LineItemID: item.lineItemId,
          Price: item.price,
          Approved: item.approved,
        })),
      });

      const caseUpdateData = { CaseStatus: targetStatusCase };
      if(targetStatusCase !== "Pending_Quote"){
        caseUpdateData.ownerUser = user?.id
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
          Note: `[QUOTATION] New ${quotationType} Quotation : ${quotationNo}`,
          CreatedBy: createdBy ?? Number.parseInt(userAssign, 10) ?? null,
        },
      });
      await tx.casenotes.create({
        data: {
          CaseID: caseId,
          LogType: "NotesLog",
          ActionType: "Action Plan",
          Template: "",
          VisibleExternally: true,
          MinutesSpent: 0,
          Note: quotationNote,
          CreatedBy: createdBy ?? Number.parseInt(userAssign, 10) ?? null,
        },
      });

      await tx.ActionLog.create({
        data: {
          CaseID_toActionLog: {
            connect: { CaseID: caseId },
          },
          ReferenceId: quotationNo,
          model: "Quotation Log",
          dataOld: status,
          dataNew: targetStatusCase,
          changedByUser: createdBy
            ? {
                connect: { IDUser: createdBy },
              }
            : undefined,
          logDescription: `Edit: change status from ${STATUS_ENUM_TO_LABEL[status]} to ${STATUS_ENUM_TO_LABEL[targetStatusCase]}`,
        },
        include: includeChangedBy,
      });

      return tx.quotationtable.findUnique({
        where: { QuotationNo: quotationNo },
        include: {
          quotation_lineitem: {
            include: { lineItem: true },
          },
        },
      });
    });

    await redis.del(redisKey(`case:detail:${caseId}`));

    return NextResponse.json(
      {
        success: true,
        message: "Quotation berhasil dibuat.",
        data: mapQuotationResponse(quotation),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat quotation.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
