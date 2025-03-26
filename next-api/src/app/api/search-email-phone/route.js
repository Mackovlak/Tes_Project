import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const siteAccountID = searchParams.get("SiteAccountID") || "";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit, siteAccountID });

        // ✅ Ensure optional filtering
        const filters = {
            ...(siteAccountID ? { SiteAccountID: parseInt(siteAccountID, 10) } : {}),
            ...(search
                ? { OR: [
                    { Email: { contains: search } },
                    { Phone: { contains: search } },
                    { Country: { contains: search } }
                ]}
                : {})
        };


        // Hitung jumlah data total
        const totalCount = await prisma.contact_information.count({
            where: filters
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        

        // Ambil data dengan filter & pagination
        const contact_information = await prisma.contact_information.findMany({
            where: filters,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { FirstName: "asc" },
            include: { site_account: { select: { Company: true } } }
        });
        

        return NextResponse.json({
            success: true,
            message: "List Data Contacts Information",
            data: contact_information.map(contact => ({
                ...contact,
                Company: contact.site_account?.Company || "No Company" // Tambahkan Company di level utama
            })),
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
        SiteAccountID,  
        Salutation,
        FirstName,
        LastName,
        Email,
        PreferredLanguage,
        Phone,
        Mobile,
        WorkPhone,
        WorkExtension,
        OtherPhone,
        OtherExtension,
        Fax,
        AddressLine1,
        AddressLine2,
        City,
        StateProvince,
        Country,
        ZipPostalCode
    } = await request.json();

    //create data 
    const contact_information = await prisma.contact_information.create({
        data:{
            SiteAccountID: SiteAccountID,  
            Salutation: Salutation,
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            PreferredLanguage: PreferredLanguage,
            Phone: Phone,
            Mobile: Mobile,
            WorkPhone: WorkPhone,
            WorkExtension: WorkExtension,
            OtherPhone: OtherPhone,
            OtherExtension: OtherExtension,
            Fax: Fax,
            AddressLine1: AddressLine1,
            AddressLine2: AddressLine2,
            City: City,
            StateProvince: StateProvince,
            Country: Country,
            ZipPostalCode: ZipPostalCode
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "Contact Information Created Successfully!",
            data: contact_information,
        },
    )
}