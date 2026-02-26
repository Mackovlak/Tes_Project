/**
 * TODO LIST
 * Change the Part Catalog to Main Feature for MO
 * Now is being used for catalog Only.
 */
import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

// Helper to parse boolean value
const parseBool = (val) => val === "true" || val === true;
const clampInt = (value, { min = 1, max = 200, defaultVal = 50 } = {}) => {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) return defaultVal;
  return Math.min(Math.max(num, min), max);
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const partNumber = searchParams.get("partNumber")?.trim() || "";
    const keyword = searchParams.get("keyword")?.trim() || "";
    const description = searchParams.get("description")?.trim() || "";
    const orderableParam = searchParams.get("orderable");

    const limit = clampInt(searchParams.get("limit"), { min: 1, max: 200, defaultVal: 50 });
    const page = clampInt(searchParams.get("page"), { min: 1, max: 100000, defaultVal: 1 });
    const skip = (page - 1) * limit;

    const where = {};

    if (q) {
      where.OR = [
        { PartNumber: { contains: q } },
        { Keyword: { contains: q } },
        { PartDescription: { contains: q } },
      ];
    }

    if (partNumber) {
      where.PartNumber = { contains: partNumber };
    }
    if (keyword) {
      where.Keyword = { contains: keyword };
    }
    if (description) {
      where.PartDescription = { contains: description };
    }
    if (orderableParam !== null) {
      where.Orderability = parseBool(orderableParam);
    }

    const [servicecatalog_parts, total] = await Promise.all([
      prisma.servicecatalog_parts.findMany({
        where,
        orderBy: { PartNumber: "asc" },
        take: limit,
        skip,
      }),
      prisma.servicecatalog_parts.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      status: 200,
      message: "List Data Parts Catalog",
      data: servicecatalog_parts,
      meta: {
        page,
        limit,
        total,
        hasMore: skip + servicecatalog_parts.length < total,
      },
    });
  } catch (e) {
    console.error("🔥 ERROR in GET API:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: e.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      PartNumber,
      Keyword,
      PartDescription,
      Orderability,
      RestrictionReason,
      CSR_Flag,
      ROHS_Flag,
      Returnable_Flag,
      HardRoll_Flag,
      DangerousGoods_Flag,
      LithiumBattery_Flag,
      Oversize_Flag,
      Heavy_Flag,
      Price,
      FreightPrice,
      Shipping_Fee,
      Tax,
      Total,
    } = body;

    // Validasi dasar
    if (!PartNumber || !Keyword || !PartDescription) {
      return NextResponse.json(
        {
          success: false,
          message: "PartNumber, Keyword, and PartDescription are required",
        },
        { status: 400 }
      );
    }

    // Cek apakah PartNumber sudah ada
    const existing = await prisma.servicecatalog_parts.findUnique({
      where: { PartNumber },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "PartNumber already exists",
        },
        { status: 409 }
      );
    }

    const newPart = await prisma.servicecatalog_parts.create({
      data: {
        PartNumber,
        Keyword,
        PartDescription,
        Orderability: parseBool(Orderability),
        RestrictionReason,
        CSR_Flag: parseBool(CSR_Flag),
        ROHS_Flag: parseBool(ROHS_Flag),
        Returnable_Flag: parseBool(Returnable_Flag),
        HardRoll_Flag: parseBool(HardRoll_Flag),
        DangerousGoods_Flag: parseBool(DangerousGoods_Flag),
        LithiumBattery_Flag: parseBool(LithiumBattery_Flag),
        Oversize_Flag: parseBool(Oversize_Flag),
        Heavy_Flag: parseBool(Heavy_Flag),
        Price: isNaN(Number(Price)) ? 0 : Number(Price),
        FreightPrice: isNaN(Number(FreightPrice)) ? 0 : Number(FreightPrice),
        Shipping_Fee: isNaN(Number(Shipping_Fee)) ? 0 : Number(Shipping_Fee),
        Tax: isNaN(Number(Tax)) ? 0 : Number(Tax),
        Total: isNaN(Number(Total)) ? 0 : Number(Total),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Part created successfully",
        data: newPart,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("🔥 ERROR in POST API:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create part",
        error: e.message,
      },
      { status: 500 }
    );
  }
}
