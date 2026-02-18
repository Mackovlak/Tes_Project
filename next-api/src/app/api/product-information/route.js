import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    // const page = parseInt(searchParams.get("page") || "1", 10);
    // const limit = parseInt(searchParams.get("limit") || "100", 10);

    const line = (searchParams.get("line") || "").trim();
    const type = (searchParams.get("type") || "").trim();
    const group = (searchParams.get("group") || "").trim();
    const tower = (searchParams.get("tower") || "").trim();

    // const skip = (page - 1) * limit;

    // Filter spesifik (line, type, group, tower)
    const andFilters = [];

    if (line) {
      andFilters.push({ ProductLine: line });
    }

    if (type || group || tower) {
      andFilters.push({
        product_type: {
          ...(type && { ProductType: type }),
          ...(group && { ProductGroup: group }),
          ...(tower && { ProductTower: tower }),
        },
      });
    }

    // Global search (number, name, line, hwpc, relasi)
    const searchFilter =
      search !== ""
        ? {
            OR: [
              { ProductNumber: { contains: search } },
              { ProductName: { contains: search } },
              { ProductLine: { contains: search } },
              { HWPC: { contains: search } },
              {
                product_type: {
                  OR: [
                    { ProductType: { contains: search } },
                    /**
                     * TODO FOR FERDI
                     * BIKIN ALTERNATIF DARI INI TANPA MENGGUNAKAN  MODE INSENSITIVE
                     * KARENA TIDAK SUPPORT DI MYSQL
                     */
                    // { ProductGroup: { contains: search } },
                    // { ProductTower: { contains: search } },
                  ],
                },
              },
            ],
          }
        : null;

    let whereClause = undefined;

    if (andFilters.length || searchFilter) {
      whereClause = {
        AND: [
          ...(andFilters.length ? andFilters : []),
          ...(searchFilter ? [searchFilter] : []),
        ],
      };
    }

    // Hitung total data
    const totalCount = await prisma.product_information.count({
      where: whereClause,
    });

    // Ambil data per page
    const product_information = await prisma.product_information.findMany({
      where: whereClause,
      // skip,
      // take: limit,
      orderBy: { ProductName: "asc" },
      include: { product_type: true },
    });

    // const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return NextResponse.json(
      {
        success: true,
        message: "List Data Product",
        data: product_information,
        // totalPages,
        // currentPage: page,
        totalCount,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("🔥 ERROR in GET /api/product-information:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/product-information
 * Body:
 * - ProductNumber (string, required)
 * - ProductName (string, required)
 * - ProductLine (string, required)
 * - ProductTypeID (number, required)
 * - HWPC (string, required)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    let { ProductNumber, ProductName, ProductLine, ProductTypeID, HWPC } = body;

    const missingFields = [];

    ProductNumber = ProductNumber?.trim?.();
    ProductName = ProductName?.trim?.();
    ProductLine = ProductLine?.trim?.();
    HWPC = HWPC?.trim?.();

    if (!ProductNumber) missingFields.push("ProductNumber");
    if (!ProductName) missingFields.push("ProductName");
    if (!ProductLine) missingFields.push("ProductLine");
    // if (!HWPC) missingFields.push("HWPC");

    const parsedTypeId = Number(ProductTypeID);
    if (!parsedTypeId || Number.isNaN(parsedTypeId)) {
      missingFields.push("Product Tower / Product Group / Product Type");
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Cek duplikat
    const existingProduct = await prisma.product_information.findUnique({
      where: { ProductNumber },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: `Product with ProductNumber ${ProductNumber} already exists.`,
        },
        { status: 409 }
      );
    }

    const product_information = await prisma.product_information.create({
      data: {
        ProductNumber,
        ProductName,
        ProductLine,
        ProductTypeID: parsedTypeId,
        HWPC,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product Information Created Successfully!",
        data: product_information,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔥 ERROR in POST /api/product-information:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "ProductNumber must be unique.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
