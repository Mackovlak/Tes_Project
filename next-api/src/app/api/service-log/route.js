import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
    try {
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });

         // Initialize search filters
         let whereCondition = {};
         
         if (search) {
            whereCondition.OR = [...(whereCondition.OR || []), { ServiceCatalogID: { contains: search } }];
        }
 
        //  // If both Email and Phone exist, apply the combined filter
        //  if (email && phone) {
        //      whereCondition = {
        //          OR: [
        //              { Email: { contains: email } },
        //              { PrimaryPhone: { contains: phone } },
        //              { Company: { contains: search } }
        //          ]
        //      };
        //  }

        // Hitung jumlah data total
        // const totalCount = await prisma.servicecatalog.count({
        //     where: whereCondition
        // });

        // console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        // const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const servicecatalog = await prisma.servicecatalog.findMany({
            where: whereCondition,
            include: {
                asset_information: true,
                warranty_services: true,
                servicecatalog_parts: true
            },
        });

        return NextResponse.json({
            success: true,
            message: "List Data Service Catalog",
            data: servicecatalog
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

    const {
      AssetID,
      Service_offerID,
      PartNumber,
      WarrantyStatus,
      Currency,
      Price,
      Tax,
      Total
    } = data;
        
        // Validasi sederhana
        if ( !data.AssetID || !data.Service_offerID) {
            return NextResponse.json({
                success: false,
                message: "Data required are missing"
            }, { status: 400 });
        }

        // const availableCompanyEmailPhoneDuplicate = await prisma.site_account.count({
        //     where: whereCondition
        // })
        
        // if(availableCompanyEmailPhoneDuplicate !== 0){
        //     return NextResponse.json({
        //         success: false,
        //         message: "A company wit dis email or phone is alredy eksis",
        //         error: error.message
        //     }, { status: 409 });
        // }
        // Simpan ke database
        const newServiceCatalog = await prisma.servicecatalog.create({
            data: {
                AssetID: AssetID, 
                Service_offerID: Service_offerID,
                PartNumber: PartNumber || "",
                WarrantyStatus: WarrantyStatus || "",
                Currency: Currency || "",
                Price: Price || 0,
                Tax: Tax || 0,
                Total: Total || 0
            }
        });

        return NextResponse.json({
            success: true,
            message: "Service Catalog Created Successfully!",
            data: newServiceCatalog
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to create Service Catalog",
            error: error.message
        }, { status: 500 });
    }
}
