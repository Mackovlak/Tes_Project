import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        
        const email = searchParams.get("email") || "";
        const phone = searchParams.get("phone") || "";
        const country = searchParams.get("country") || "";

        const contactID = searchParams.get("ContactID") || 0;
        const siteAccountID = searchParams.get("SiteAccountID") || "";
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit, siteAccountID });

         // Initialize filters
        const andConditions = [];

        // If searching within a company
        if (siteAccountID) {
            andConditions.push({SiteAccountID: parseInt(siteAccountID)})
        }

         // Search by Email (must be in the selected country)
         if (email) {
            const emailCond = { Email: { contains: email }}
            if(country){
                andConditions.push({ AND: [emailCond, {Country: { contains: country}}]})
            } else{
                andConditions.push(emailCond);
            }
         }
 
         // Search by Phone (match phone in any country)
         if (phone) {
             andConditions.push({
                 OR: [
                     { Phone: { contains: phone } },
                     { Mobile: { contains: phone } },
                     { OtherPhone: { contains: phone } }
                 ]
            })
         }

         if(search){
            andConditions.push({
                OR: [
                    { FirstName: { contains: search } },
                    { LastName: { contains: search } },
                    { Email: { contains: search } },
                    { City: { contains: search } }
                ]
            })
         }

         if(contactID) andConditions.push({OR:[{ContactID: parseInt(contactID)}]})
 
         
 
        const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
        console.log("Final Where Condition:", JSON.stringify(whereCondition, null, 2));
 
         // Get total count
         const totalCount = await prisma.contact_information.count({ where: whereCondition });


        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        

        // Ambil data dengan filter & pagination
        const contact_information = await prisma.contact_information.findMany({
            where: whereCondition,
            // skip: (page - 1) * limit,
            // take: limit,
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
        ZipPostalCode,
        PIC_Name,
        PIC_Email,
        PIC_Phone
    } = await request.json();

    try {
        const orConditions = [];

        if (Email) orConditions.push({ Email: { contains: Email } });
        if (Phone) orConditions.push({ Phone: { contains: Phone } });
        if (Mobile) orConditions.push({ Mobile: { contains: Mobile } });

        if (orConditions.length === 0) {
            return NextResponse.json({
                success: false,
                message: "At least one of Email, Phone, or Mobile must be provided."
            }, { status: 400 });
        }

        const dupCount = await prisma.contact_information.count({ where: { OR: orConditions } });
        if (dupCount !== 0) {
            return NextResponse.json({
                success: false,
                message: "A Contact with this email or phone already exists."
            }, { status: 409 });
        }

        const contact_information = await prisma.contact_information.create({
            data: {
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
                ZipPostalCode,
                PIC_Name,
                PIC_Email,
                PIC_Phone
            },
        });

        return NextResponse.json({
            success: true,
            message: "Contact Information Created Successfully!",
            data: contact_information,
        }, { status: 201 });
    } catch (error) {
        if (error?.code === 'P2002') {
            return NextResponse.json({
                success: false,
                message: "A Contact with this email or phone already exists."
            }, { status: 409 });
        }
        return NextResponse.json({
            success: false,
            message: "Failed to create contact",
            error: error.message
        }, { status: 500 });
    }
}
