import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";
import redis, { deleteByPattern, redisKey } from "../../../../lib/redis";

const toDateOrNull = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

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

            const DISTINCT_FIELDS = {
                SerialNumber: () => prisma.asset_information.findMany({
                    where: q ? { SerialNumber: { contains: q } } : {},
                    select: { SerialNumber: true },
                    distinct: ["SerialNumber"],
                    orderBy: { SerialNumber: "asc" },
                    take: limit,
                }).then(r => r.map(x => x.SerialNumber).filter(Boolean)),

                ProductNumber: () => prisma.asset_information.findMany({
                    where: q ? { ProductNumber: { contains: q } } : {},
                    select: { ProductNumber: true },
                    distinct: ["ProductNumber"],
                    orderBy: { ProductNumber: "asc" },
                    take: limit,
                }).then(r => r.map(x => x.ProductNumber).filter(Boolean)),
            };

            if (!DISTINCT_FIELDS[field]) {
                return NextResponse.json({ success: false, message: `Unknown field: ${field}` }, { status: 400 });
            }

            const values = await DISTINCT_FIELDS[field]();
            return NextResponse.json({ success: true, values }, { status: 200 });
        }

        // ── Handle "Paginated" Mode for the Data Table ──
        const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
        const take = Math.min(200, Math.max(1, parseInt(searchParams.get("take") ?? "20", 10)));

        // Sort parsing
        const sortBy = searchParams.get("sortBy") ?? "SerialNumber";
        const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
        const orderBy = { [sortBy]: sortDir };

        // Filters mapping
        const baseConditions = [];
        
        if (search) {
            baseConditions.push({
                OR: [
                    { SerialNumber: { contains: search } },
                    { ProductNumber: { contains: search } },
                    { product_information: { ProductName: { contains: search } } },
                ],
            });
        }

        // Exact column filters passed from the table
        const serialNumber = searchParams.get("SerialNumber");
        if (serialNumber) baseConditions.push({ SerialNumber: serialNumber });
        
        const productNumber = searchParams.get("ProductNumber");
        if (productNumber) baseConditions.push({ ProductNumber: productNumber });

        const whereCondition = baseConditions.length > 0 ? { AND: baseConditions } : {};

        // Redis Caching
        const sortedParams = new URLSearchParams([...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
        const cacheKey = redisKey(`asset:list:${sortedParams.toString()}`);
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return NextResponse.json(JSON.parse(cached), { status: 200 });
        }

        // Fetch Data
        const [totalCount, asset_information] = await Promise.all([
            prisma.asset_information.count({ where: whereCondition }),
            prisma.asset_information.findMany({
                where: whereCondition,
                skip: skip,
                take: take,
                orderBy: orderBy,
                include: {
                    site_account: true,
                    contact_information: true,
                    product_information: {
                        include: { product_type: true }
                    },
                    WarrantyOTCCode: true
                }
            })
        ]);

        const response = {
            success: true,
            message: "List Data Assets Information",
            data: asset_information,
            total: totalCount, // Replaces totalPages calculation
            skip,
            take,
            mode
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("🔥 ERROR in GET API:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch data", error: error.message }, { status: 500 });
    }
}

/**
 * TODO 
 * MAKE CREATE ASSET AND CREATE PRODUCT SEPARATELY
 */
export async function POST(request) {
    //get all request
    const { 
        SerialNumber,
        ProductNumber,
        ProductLine,
        ProductName,
        SiteAccountID,
        ProductTypeID,
        ContactID,
        Warranty_Status,
        EOW_Date,
        needWarrantyApproval,
    } = await request.json();

    if (!ContactID) {
        return NextResponse.json({
            success: false,
            message: "Asset must be linked to a Contact."
        }, { status: 400 });
    }

    let productInfo = await prisma.product_information.findUnique({
        where: { ProductNumber }
    });

    if (!productInfo) {
        productInfo = await prisma.product_information.create({
            data: {
                ProductNumber,
                ProductLine,
                ProductName,
                ProductTypeID,
            }
        });
    }
    
    //create data 
       const asset_information = await prisma.asset_information.create({
        data: {
            SerialNumber,
            ProductNumber: productInfo.ProductNumber,
            ProductTypeID,
            SiteAccountID,
            ContactID,
            Warranty_Status,
            EOW_Date: toDateOrNull(EOW_Date)
        },
        include: {
            product_information: true,
            contact_information: true,
            site_account: true
        }
    });

    //create asset_warranty
    if (asset_information && needWarrantyApproval && Warranty_Status === "01T") {
        await prisma.asset_warranty.create({
            data: {
                AssetID: asset_information.AssetID,
                WarrantyApprovalStatus : "New",
                WarrantyCardDate: null,
                POPDocument: "",
                WarrantyCard: "",
                PhotoUnit: "",
                EndUserName: "",
                EndUserPhone: "",
                EndUserAddress: "",
            }
        });
    }

    await deleteByPattern("asset:list:*");

    return NextResponse.json(
        {
            success: true,
            message: "Asset Information Created Successfully!",
            data: asset_information,
        },
        { 
            status: 201
        }
    )
}
