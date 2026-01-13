import { NextResponse } from "next/server";
import prisma  from "../../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const nmuId = searchParams.get("NMUId") || null;
        console.log(nmuId)
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 50;

        console.log("Query Params:", { search, page, limit });

        let whereCondition = {}
        
        if (search) {
            whereCondition.itemName = { contains: search };
        }

        if (nmuId) {
            whereCondition.nmuId = Number(nmuId);
        }



        console.log("Final WHERE Condition:", JSON.stringify(whereCondition));

        // Hitung jumlah data total
        const totalCount = await prisma.NMUItem.count({
            where: whereCondition
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const NMUItemData = await prisma.NMUItem.findMany({
            where: whereCondition,
            // skip: skip,
              // take: limit,
            orderBy: { id: "asc" },
            include : {
                nmu: true
            }
        });

        return NextResponse.json({
            success: true,
            message: "List Data NMU Item",
            data: NMUItemData,
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

export async function POST(request) {
    //get all request
    const { 
        itemName,
        nmuId,
    } = await request.json();

    console.log()
    //create data 
    const NMUItemData = await prisma.NMUItem.create({
        data:{
            itemName,
            nmuId: Number(nmuId),
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "NMU Item Data Created Successfully!",
            data: NMUItemData,
        },
        { 
            status: 201
        }
    )
}