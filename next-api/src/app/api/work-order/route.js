import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
    try{
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const caseID = searchParams.get("CaseID") || "";
        
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });
         let whereCondition = {};
         
        if (search) {
            whereCondition.OR = [
                {
                WOID: { contains: search },
                },
                {
                CaseID: { contains: search },
                },
                {
                owner: { Name: {contains: search}}
                }
            ];
        }
        if (caseID) {
            whereCondition.CaseID = caseID;
        }

        const workorder = await prisma.workorder.findMany({
            where: whereCondition,
            include: {
                owner: true,
                caseinformation: {
                    include: {
                        site_account: true,
                        contact_information: true,
                    },
                },
                owner: true,
            },
        });
          

        return NextResponse.json({
            success: true,
            message: "List Data Work Order",
            data: workorder
        });
    }catch(err){
        console.error("🔥 ERROR in GET API:", err);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch data",
            error: err.message
        }, { status: 500 });
    }
}