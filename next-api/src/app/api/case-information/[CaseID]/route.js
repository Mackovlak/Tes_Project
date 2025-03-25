import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";

export async function GET(request, { params }) {
    //get params id
    const url = new URL(request.url);
    const caseID = parseInt(url.pathname.split("/").pop()); 

    if (isNaN(caseID)) {
        return NextResponse.json(
            { success: false, message: "Invalid Case ID" },
            { status: 400 }
        );
    }

    //get detail post
    const case_information = await prisma.caseinformation.findUnique({
        where: {
            CaseID: caseID,
        },
        include: { 
            asset_information: true, 
            contact_information: true, 
            site_account: true 
        }
    });

    if(!case_information){
        return NextResponse.json(
            {
                success:true,
                message: "Detail Data Case Not Found!",
                data: null,
            },
            {
                status: 404,
            }
        );
    }

    return NextResponse.json(
        {
            success:true,
            message: "Detail Data Case",
            data: case_information,
        },
        {
            status: 200,
        }
    );
}

// update data
export async function PATCH(request, { params }) {
    const caseID = parseInt(params.CaseID);

    const { 
        CaseID,
        SiteAccountID,
        ContactID,
        AssetID,
        CaseSubject,
        CaseType,
        KCI_Flag,
        IncomingChannel,
        CaseStatus,
        CasePriority,
        CustomerSeverity,
        CaseClosedDate,
        CaseNote,
        SymptomCode,
        CaseResolution
    } = await request.json();

    //update data
    const case_information = await prisma.caseinformation.update({
        where: {
            CaseID: caseID,
        },
        data: {
            SiteAccountID: SiteAccountID,
            ContactID: ContactID,
            AssetID: AssetID,
            CaseSubject: CaseSubject,
            CaseType: CaseType,
            KCI_Flag: KCI_Flag,
            IncomingChannel: IncomingChannel,
            CaseStatus: CaseStatus,
            CasePriority: CasePriority,
            CustomerSeverity: CustomerSeverity,
            CaseClosedDate: CaseClosedDate,
            CaseNote: CaseNote,
            SymptomCode: SymptomCode,
            CaseResolution: CaseResolution
        }
    })

    return NextResponse.json(
        {
            success: true,
            message: "Case Information Updated!",
            data: case_information,
        },
        {
            status: 200,
        }
    )
}


//delete data
export async function DELETE(request, { params }) {
    const caseID = parseInt(params.CaseID);
    
    await prisma.caseinformation.delete(
        {
            where: {
                CaseID: caseID,
            }
        },
        {
            status: 200
        }
    );

    return NextResponse.json({
        success: true,
        message: "Data Case Deleted"
    })
}