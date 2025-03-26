import { NextResponse } from "next/server";

import prisma from "../../../../../../prisma/client";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });

        // Hanya ambil aset yang tidak memiliki ContactID
        let whereCondition = { ContactID: null };

        if (search) {
            whereCondition.OR = [
                { SerialNumber: { contains: search } },
                { ProductName: { contains: search } },
                { product_information: { ProductName: { contains: search } } },
            ];
        }

        // Hitung jumlah total data
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
            include: {
                product_information: true,
            }
        });

        return NextResponse.json({
            success: true,
            message: "List of Assets Without Owner",
            data: asset_information,
            totalData: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        }, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });

    } catch (error) {
        console.error("🔥 ERROR in GET API (Unowned Assets):", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch unowned assets",
            error: error.message
        }, { status: 500 });
    }
}
