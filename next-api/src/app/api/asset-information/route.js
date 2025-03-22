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

        // Hitung jumlah data total
        const totalCount = await prisma.asset_information.count({
            where: search
                ? {
                    OR: [
                        { SerialNumber: { contains: search } },
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
        const asset_information = await prisma.asset_information.findMany({
            where: search
                ? {
                    OR: [
                        { SerialNumber: { contains: search } },
                        { ProductNumber: { contains: search } },
                        { product_information: { ProductName: { contains: search } } }
                    ]
                }
                : undefined,
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