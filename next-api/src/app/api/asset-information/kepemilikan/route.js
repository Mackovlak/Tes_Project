import { NextResponse } from "next/server";

import prisma  from "../../../../../prisma/client";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const contactID = searchParams.get("contactID") ? parseInt(searchParams.get("contactID")) : null;
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        let whereCondition = {};
        console.log("search :",search)
        console.log("contactID :",contactID)
        if (search) {
            whereCondition.OR = [
                { SerialNumber: { contains: search } },
                { ProductNumber: { contains: search } },
                { product_information: { ProductName: { contains: search } } },
            ];
        }
        
        if (contactID === null) {
            whereCondition.ContactID = { not: null };
        }else{
            whereCondition.ContactID = Number(contactID);
        }
        console.log("where condition :",whereCondition)
        
        const totalCount = await prisma.asset_information.count({ where: whereCondition });
        const asset_information = await prisma.asset_information.findMany({
            where: whereCondition,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { product_information: { ProductName: "asc" } },
            include: {
                site_account: true,
                contact_information:true,
                product_information:true
            }
        });

        // console.log(asset_information)

        return NextResponse.json({
            success: true,
            data: asset_information,
            totalData: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch data", error: error.message }, { status: 500 });
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