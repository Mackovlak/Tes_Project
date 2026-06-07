import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import redis, { deleteByPattern, redisKey } from "../../../../lib/redis";

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//
//     const search = (searchParams.get("search") || "").trim();
//     // const page = parseInt(searchParams.get("page") || "1", 10);
//     // const limit = parseInt(searchParams.get("limit") || "100", 10);
//
//     const mode = searchParams.get("mode") ?? "paginated";
//     const line = (searchParams.get("line") || "").trim();
//     const type = (searchParams.get("type") || "").trim();
//     const group = (searchParams.get("group") || "").trim();
//     const tower = (searchParams.get("tower") || "").trim();
//
//
//     if (mode === "distinct") {
//       const field = searchParams.get("field");
//       const q = searchParams.get("q")?.trim() || "";
//       const limit = Math.min(
//         50,
//         parseInt(searchParams.get("limit") || "30", 10),
//       );
//
//       // Define which fields are allowed for distinct search to prevent errors
//       const DISTINCT_FIELDS = {
//         ProductNumber: () =>
//           prisma.product_information
//             .findMany({
//               where: q ? { ProductNumber: { contains: q } } : {},
//               select: { ProductNumber: true },
//               distinct: ["ProductNumber"],
//               orderBy: { ProductNumber: "asc" },
//               take: limit,
//             })
//             .then((r) => r.map((x) => x.ProductNumber).filter(Boolean)),
//
//         ProductName: () =>
//           prisma.product_information
//             .findMany({
//               where: q ? { ProductName: { contains: q } } : {},
//               select: { ProductName: true },
//               distinct: ["ProductName"],
//               orderBy: { ProductName: "asc" },
//               take: limit,
//             })
//             .then((r) => r.map((x) => x.ProductName).filter(Boolean)),
//
//         HWPC: () =>
//           prisma.product_information
//             .findMany({
//               where: q ? { HWPC: { contains: q } } : {},
//               select: { HWPC: true },
//               distinct: ["HWPC"],
//               orderBy: { HWPC: "asc" },
//               take: limit,
//             })
//             .then((r) => r.map((x) => x.HWPC).filter(Boolean)),
//       };
//
//       if (!DISTINCT_FIELDS[field]) {
//         return NextResponse.json(
//           { success: false, message: `Unknown field: ${field}` },
//           { status: 400 },
//         );
//       }
//
//       const values = await DISTINCT_FIELDS[field]();
//       return NextResponse.json({ success: true, values }, { status: 200 });
//     }
//
//     // const skip = (page - 1) * limit;
//
//     // Filter spesifik (line, type, group, tower)
//     const andFilters = [];
//
//     if (line) {
//       andFilters.push({ ProductLine: line });
//     }
//
//     if (type || group || tower) {
//       andFilters.push({
//         product_type: {
//           ...(type && { ProductType: type }),
//           ...(group && { ProductGroup: group }),
//           ...(tower && { ProductTower: tower }),
//         },
//       });
//     }
//
//     // Global search (number, name, line, hwpc, relasi)
//     const searchFilter =
//       search !== ""
//         ? {
//             OR: [
//               { ProductNumber: { contains: search } },
//               { ProductName: { contains: search } },
//               { ProductLine: { contains: search } },
//               { HWPC: { contains: search } },
//               {
//                 product_type: {
//                   OR: [
//                     { ProductType: { contains: search } },
//                     /**
//                      * TODO FOR FERDI
//                      * BIKIN ALTERNATIF DARI INI TANPA MENGGUNAKAN  MODE INSENSITIVE
//                      * KARENA TIDAK SUPPORT DI MYSQL
//                      */
//                     // { ProductGroup: { contains: search } },
//                     // { ProductTower: { contains: search } },
//                   ],
//                 },
//               },
//             ],
//           }
//         : null;
//
//     let whereClause = undefined;
//
//     if (andFilters.length || searchFilter) {
//       whereClause = {
//         AND: [
//           ...(andFilters.length ? andFilters : []),
//           ...(searchFilter ? [searchFilter] : []),
//         ],
//       };
//     }
//
//     // Hitung total data
//     const totalCount = await prisma.product_information.count({
//       where: whereClause,
//     });
//
//     // Ambil data per page
//     const product_information = await prisma.product_information.findMany({
//       where: whereClause,
//       // skip,
//       // take: limit,
//       orderBy: { ProductName: "asc" },
//       include: { product_type: true },
//     });
//
//     // const totalPages = Math.max(1, Math.ceil(totalCount / limit));
//
//     return NextResponse.json(
//       {
//         success: true,
//         message: "List Data Product",
//         data: product_information,
//         // totalPages,
//         // currentPage: page,
//         totalCount,
//       },
//       {
//         status: 200,
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//           "Access-Control-Allow-Headers": "Content-Type, Authorization",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("🔥 ERROR in GET /api/product-information:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch data",
//         error: error?.message ?? "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Setup Modes & Params
        const mode = searchParams.get("mode") ?? "paginated";
        const search = searchParams.get("search")?.trim() || "";
        
        // ── Handle "Distinct" Mode for Dropdown Autocomplete ──
        if (mode === "distinct") {
            const field = searchParams.get("field");
            const q = searchParams.get("q")?.trim() || "";
            const limit = Math.min(50, parseInt(searchParams.get("limit") || "30", 10));

            // Define which fields are allowed for autocomplete to prevent abuse
            const DISTINCT_FIELDS = {
                ProductNumber: () => prisma.product_information.findMany({
                    where: q ? { ProductNumber: { contains: q } } : {},
                    select: { ProductNumber: true },
                    distinct: ["ProductNumber"],
                    orderBy: { ProductNumber: "asc" },
                    take: limit,
                }).then(r => r.map(x => x.ProductNumber).filter(Boolean)),


                ProductName: () =>
                  prisma.product_information
                    .findMany({
                      where: q ? { ProductName: { contains: q } } : {},
                      select: { ProductName: true },
                      distinct: ["ProductName"],
                      orderBy: { ProductName: "asc" },
                      take: limit,
                    })
                    .then((r) => r.map((x) => x.ProductName).filter(Boolean)),
       
                HWPC: () =>
                  prisma.product_information
                    .findMany({
                      where: q ? { HWPC: { contains: q } } : {},
                      select: { HWPC: true },
                      distinct: ["HWPC"],
                      orderBy: { HWPC: "asc" },
                      take: limit,
                    })
                    .then((r) => r.map((x) => x.HWPC).filter(Boolean)),
                   };

            if (!DISTINCT_FIELDS[field]) {
                return NextResponse.json({ success: false, message: `Unknown in this field field: ${field}` }, { status: 400 });
            }

            const values = await DISTINCT_FIELDS[field]();
            return NextResponse.json({ success: true, values }, { status: 200 });
        }

        // ── Handle "Paginated" Mode for the Data Table ──
        const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
        const take = Math.min(200, Math.max(1, parseInt(searchParams.get("take") ?? "20", 10)));

        // Sort parsing
        const sortBy = searchParams.get("sortBy") ?? "ProductName";
        const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
        const orderBy = { [sortBy]: sortDir };

        // Filters mapping
        const baseConditions = [];
        // 1. Global search (number, name, line, hwpc, relasi)
        if (search) {
            baseConditions.push({
                OR: [
                    { ProductNumber: { contains: search } },
                    { ProductName: { contains: search } },
                    { ProductLine: { contains: search } },
                    { HWPC: { contains: search } },
                    {
                        product_type: {
                            OR: [
                                { ProductType: { contains: search } },
                                // { ProductGroup: { contains: search } },
                                // { ProductTower: { contains: search } },
                            ],
                        },
                    },
                ],
            });
        }

        // 2. Exact column filters passed from the table
        const line = searchParams.get("line")?.trim();
        const type = searchParams.get("type")?.trim();
        const group = searchParams.get("group")?.trim();
        const tower = searchParams.get("tower")?.trim();

        const productNumber = searchParams.get("ProductNumber");
        if (productNumber) baseConditions.push({ ProductNumber: productNumber });

        const productName = searchParams.get("ProductName");
        if (productName) baseConditions.push({ ProductName: productName });

        const hwpc = searchParams.get("HWPC");
        if (hwpc) baseConditions.push({ HWPC: hwpc });
        if (line) baseConditions.push({ ProductLine: line });

        if (type || group || tower) {
            baseConditions.push({
                product_type: {
                    ...(type && { ProductType: type }),
                    ...(group && { ProductGroup: group }),
                    ...(tower && { ProductTower: tower }),
                },
            });
        }

        const whereCondition = baseConditions.length > 0 ? { AND: baseConditions } : {};

        // Redis Caching
        const sortedParams = new URLSearchParams([...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
        const cacheKey = redisKey(`product:list:${sortedParams.toString()}`);
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return NextResponse.json(JSON.parse(cached), { status: 200 });
        }

        // Fetch Data (Running Count and Fetch in Parallel)
        const [totalCount, product_information] = await Promise.all([
            prisma.product_information.count({ where: whereCondition }),
            prisma.product_information.findMany({
                where: whereCondition,
                skip: skip,
                take: take,
                orderBy: orderBy,
                include: { product_type: true },
            })
        ]);

        const response = {
            success: true,
            message: "List Data Product",
            data: product_information,
            total: totalCount,
            skip,
            take,
            mode
        };

        // Cache the response for 120 seconds
        await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("🔥 ERROR in GET /api/product-information:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to fetch data", 
                error: error?.message ?? "Unknown error" 
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
