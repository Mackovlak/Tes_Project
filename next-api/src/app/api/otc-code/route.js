import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 50;

        console.log("Query Params:", { search, page, limit });

        let whereCondition = {}
        
            if (search) {
                whereCondition = {
                    AND: [
                    {
                        OR: [
                        { OTCCode: { contains: search } },
                        { Description: { contains: search } },
                        ]
                    }
                    ]
                }
            }


        console.log("Final WHERE Condition:", JSON.stringify(whereCondition));

        // Hitung jumlah data total
        const totalCount = await prisma.OTCCodeTable.count({
            where: whereCondition
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const OTCCodeData = await prisma.OTCCodeTable.findMany({
            where: whereCondition,
            // skip: skip,
              // take: limit,
            orderBy: { OTCCode: "asc" },
            select: {
            OTCCode: true,
            Description: true,
            WarrantyCondition: true,   // ✅ Tambahkan ini
            CreatedOn: true,
         },
        });

        return NextResponse.json({
            success: true,
            message: "List Data OTC CODE",
            data: OTCCodeData,
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
        OTCCode,
        Description,
        WarrantyCondition,
    } = await request.json();

    console.log()
    //create data 
    const otcCodeData = await prisma.OTCCodeTable.create({
        data:{
            OTCCode: OTCCode,
            Description: Description,
            WarrantyCondition: WarrantyCondition,
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "OTC Code Data Created Successfully!",
            data: otcCodeData,
        },
        { 
            status: 201
        }
    )
}