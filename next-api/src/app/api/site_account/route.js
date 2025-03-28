import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
    try {
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        
        const email = searchParams.get("email") || "";
        const phone = searchParams.get("phone") || "";
        
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });

         // Initialize search filters
         let whereCondition = {};

         // Search by Email
         if (email) {
             whereCondition.OR = [{ Email: { contains: email } }];
         }
 
         // Search by Phone
         if (phone) {
             whereCondition.OR = [...(whereCondition.OR || []), { PrimaryPhone: { contains: phone } }];
         }
         
         if (search) {
            whereCondition.OR = [...(whereCondition.OR || []), { Company: { contains: search } }];
        }
 
         // If both Email and Phone exist, apply the combined filter
         if (email && phone) {
             whereCondition = {
                 OR: [
                     { Email: { contains: email } },
                     { PrimaryPhone: { contains: phone } },
                     { Company: { contains: search } }
                 ]
             };
         }

        // Hitung jumlah data total
        const totalCount = await prisma.site_account.count({
            where: whereCondition
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const site_accounts = await prisma.site_account.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: { Company: "asc" }
        });

        return NextResponse.json({
            success: true,
            message: "List Data Site Account",
            data: site_accounts,
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
    try {
        // Ambil data dari request
        const data = await request.json();
        
        // Validasi sederhana
        if (!data.Company || !data.Email || !data.PrimaryPhone) {
            return NextResponse.json({
                success: false,
                message: "Company, Email, and PrimaryPhone are required"
            }, { status: 400 });
        }

        // Simpan ke database
        const newAccount = await prisma.site_account.create({
            data: {
                Company: data.Company,
                Email: data.Email,
                PrimaryPhone: data.PrimaryPhone,
                AddressLine1: data.AddressLine1 || "",
                AddressLine2: data.AddressLine2 || "",
                City: data.City || "",
                StateProvince: data.StateProvince || "",
                Country: data.Country || "",
                ZipPostalCode: data.ZipPostalCode || ""
            }
        });

        return NextResponse.json({
            success: true,
            message: "Site Account Created Successfully!",
            data: newAccount
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to create site account",
            error: error.message
        }, { status: 500 });
    }
}
