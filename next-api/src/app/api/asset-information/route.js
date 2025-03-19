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
                        { serialNumber: { contains: search } },
                        { productName: { contains: search } }
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
            data: asset_information,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
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
        SerialNumber,
        ProductName,
        ProductNumber,
        ProductLine,
        SiteAccountID,
        ContactID
    } = await request.json();

    //create data 
    const asset_information = await prisma.asset_information.create({
        data:{
            SerialNumber: SerialNumber,
            ProductName: ProductName,
            ProductNumber: ProductNumber,
            ProductLine: ProductLine,
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