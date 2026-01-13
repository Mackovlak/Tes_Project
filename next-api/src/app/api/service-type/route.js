import { NextResponse } from "next/server";
import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const problemCategory = searchParams.get("ProblemCategory") || null;
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 50;

        console.log("Query Params:", { search, page, limit });

        let whereCondition = {}
        
            if (search) {
                const isSearchNumber = !isNaN(search)
                whereCondition = {
                    AND: [
                    {
                        OR: [
                        isSearchNumber ? { ServiceTypeId: parseInt(search) } : {}, // hanya jika angka
                        { ServiceTypeName: { contains: search } }
                        // { ItemNeeded: { contains: search } },
                        // { VersionNeeded: { contains: search } },
                        ]
                    }
                    ]
                }
            }

            if(problemCategory){
                whereCondition.ProblemCategory = problemCategory
            }


        console.log("Final WHERE Condition:", JSON.stringify(whereCondition));

        // Hitung jumlah data total
        const totalCount = await prisma.ServiceType.count({
            where: whereCondition
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const ServiceTypeData = await prisma.ServiceType.findMany({
            where: whereCondition,
            // skip: skip,
              // take: limit,
            orderBy: { ServiceTypeId: "asc" },
        });

        return NextResponse.json({
            success: true,
            message: "List Data Service Type",
            data: ServiceTypeData,
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
        ServiceTypeName,
        ProblemCategory,
    } = await request.json();

    console.log()
    //create data 
    const ServiceTypeData = await prisma.ServiceType.create({
        data:{
            ServiceTypeName,
            ProblemCategory
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "ServiceType Data Created Successfully!",
            data: ServiceTypeData,
        },
        { 
            status: 201
        }
    )
}