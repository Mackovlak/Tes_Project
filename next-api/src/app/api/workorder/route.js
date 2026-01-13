import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);

        const caseID = searchParams.get("caseID");

        console.log("Query Params:", { caseID });

        let whereCondition = {}        
          // If `search` is provided, add OR conditions but ensure SiteAccountID/ContactID are required if present
          if (search) {
            whereCondition.AND = [
                whereCondition, // Keep SiteAccountID & ContactID constraints
                {
                    OR: [
                        { CaseID: { contains: caseID } }
                    ]
                }
            ];
        }

        console.log("Final WHERE Condition:", JSON.stringify(whereCondition));

        // Hitung jumlah data total
        const totalCount = await prisma.caseinformation.count({
            where: whereCondition
        });

        console.log("Total Data:", totalCount);

        // Ambil data dengan filter & pagination
        const caseinformation = await prisma.caseinformation.findMany({
            where: whereCondition,
            take: 1,
            orderBy: { SerialNumber: "asc" }
        });

        return NextResponse.json({
            success: true,
            message: "List Data",
            data: caseinformation
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
        ContactID
    } = await request.json();

    //create data 
    const asset_information = await prisma.asset_information.create({
        data:{
            SerialNumber: SerialNumber,
            ProductNumber: ProductNumber,
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