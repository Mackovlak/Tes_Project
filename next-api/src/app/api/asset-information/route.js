import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";
import redis, { deleteByPattern } from "../../../../lib/redis";

const toDateOrNull = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const siteAccountID = searchParams.get("SiteAccountID") ? parseInt(searchParams.get("SiteAccountID")) : null;
        const contactID = searchParams.get("ContactID") ? parseInt(searchParams.get("ContactID")) : null;

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 100;

        console.log("Query Params:", { search, page, limit });

        const cacheKey = `asset:list:${searchParams.toString() || "all"}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json(JSON.parse(cached), {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Allow all origins
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        }

        const baseConditions = [];
        if (siteAccountID !== null) {
            baseConditions.push({ SiteAccountID: siteAccountID });
        }
        if (contactID !== null) {
            baseConditions.push({ ContactID: contactID });
        }
          // If `search` is provided, add OR conditions but ensure SiteAccountID/ContactID are required if present
         // Add search filters if present
        if (search) {
            baseConditions.push({
                OR: [
                    { SerialNumber: { contains: search } },
                    { ProductNumber: { contains: search } },
                    { product_information: { ProductName: { contains: search } } },
                ],
            });
        }

        const whereCondition = baseConditions.length > 0 ? { AND: baseConditions } : {};

        console.log("Final WHERE Condition:", whereCondition);
        // console.log("Final WHERE Condition:", whereCondition);

        // Hitung jumlah data total
        const totalCount = await prisma.asset_information.count({
            where: whereCondition,
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const asset_information = await prisma.asset_information.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: { product_information: { ProductName: "asc" } },
            include:
            {
                site_account: true,
                contact_information:true,
                product_information:{
                    include: {
                        product_type: true
                    }
                },
                WarrantyOTCCode: true
            }
        });

        const response = {
            success: true,
            message: "List Data Assets Information",
            data: asset_information,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

        return NextResponse.json(response, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow all origins
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    } catch (error) {
        console.error("🔥 ERROR in GET API:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch data",
            error: error.message
        }, { status: 500 });
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
