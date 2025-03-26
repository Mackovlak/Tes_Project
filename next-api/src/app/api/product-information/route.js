import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });
        
        //  Check if table exists
        // console.log("Prisma Model Names:", Object.keys(prisma)); // Debug log

        // Hitung jumlah data total
        const totalCount = await prisma.product_information.count({
            where: search
                ? {
                    OR: [
                        { ProductNumber: { contains: search } },
                        { ProductName: { contains: search } }
                    ]
                }
                : undefined // Jika search kosong, tidak pakai filter
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const product_information = await prisma.product_information.findMany({
            where: search
                ? {
                    OR: [
                        { ProductNumber: { contains: search } },
                        { ProductName: { contains: search } }
                    ]
                }
                : undefined,
            skip: skip,
            take: limit,
            orderBy: { ProductName: "asc" }
        });

        return NextResponse.json({
            success: true,
            message: "List Data Assets Information",
            data: product_information,
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
    try {
        const { ProductNumber, ProductLine, ProductName } = await request.json();

        if (!ProductNumber || !ProductName || !ProductLine) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const product_information = await prisma.product_information.create({
            data: {
                ProductNumber,
                ProductLine,
                ProductName,
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
        console.error("Database error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}