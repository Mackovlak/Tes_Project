import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const siteAccountID = searchParams.get("SiteAccountID") ? parseInt(searchParams.get("SiteAccountID")) : null;
        const contactID = searchParams.get("ContactID") ? parseInt(searchParams.get("ContactID")) : null;

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });

        let whereCondition = {}
        if (siteAccountID !== null) {
            whereCondition.SiteAccountID = siteAccountID;
        }
        if (contactID !== null) {
            whereCondition.ContactID = contactID;
        }
          // If `search` is provided, add OR conditions but ensure SiteAccountID/ContactID are required if present
          if (search) {
            whereCondition.AND = [
                whereCondition, // Keep SiteAccountID & ContactID constraints
                {
                    OR: [
                        { SerialNumber: { contains: search } },
                        { ProductNumber: { contains: search } },
                        { product_information: { ProductName: { contains: search } } }
                    ]
                }
            ];
        }

        console.log("Final WHERE Condition:", JSON.stringify(whereCondition));

        // Hitung jumlah data total
        const totalCount = await prisma.asset_information.count({
            where: whereCondition
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
                product_information:true
            }
        });

        return NextResponse.json({
            success: true,
            message: "List Data Assets Information",
            data: asset_information,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        },
    {
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
        SiteAccountID,
        ProductTypeID,
        ContactID
    } = await request.json();

    console.log()
    //create data 
    const asset_information = await prisma.asset_information.create({
        data:{
            SerialNumber: SerialNumber,
            ProductNumber: ProductNumber,
            ProductTypeID: ProductTypeID,
            SiteAccountID: SiteAccountID,
            ContactID: ContactID
        },
    });

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