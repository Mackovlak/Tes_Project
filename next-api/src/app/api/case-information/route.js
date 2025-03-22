import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

export async function GET(request) {
    //get search parameter
    const { searchParams } = new URL(request.url);

    //extract query parameter
    const CaseStatus = searchParams.get("CaseStatus")

    //prisma query filter
    const filters = {};
    if(CaseStatus){
        filters.CaseStatus = { contains: CaseStatus }
    }
    //get all data
    const case_information = await prisma.caseinformation.findMany({
        where: Object.keys(filters).length > 0 ? filters : undefined,
        include: {
            asset_information: { 
                select: { 
                    AssetID: true,
                    SerialNumber: true,
                    ProductNumber: true,
                    product_information: { 
                        select: { 
                            ProductName: true,
                            ProductLine: true
                        }
                    }
                } 
            },
            contact_information: { 
                select: { 
                    ContactID: true,
                    FirstName: true,
                    LastName: true,
                    site_account: { 
                        select: { Company: true }
                    }
                } 
            }
        }
    });


    return NextResponse.json(
        {
            success: true,
            message: "List Data Case",
            data: case_information.map(caseData => ({
                    CaseID: caseData.CaseID,
                    CreatedOn: caseData.CreatedOn,
                    CaseSubject: caseData.CaseSubject,
                    CustomerAccount: caseData.contact_information?.site_account?.Company || "No Company",
                    Primary: `${caseData.contact_information?.FirstName || ""} ${caseData.contact_information?.LastName || ""}`.trim(),
                    HW: "N/A", //wtf is this
                    SerialNumber: caseData.asset_information?.SerialNumber || "No Serial",
                    ProductNumber: caseData.asset_information?.ProductNumber || "No Product Number",
                    ProductName: caseData.asset_information?.product_information?.ProductName || "No Product Name",
                    CreatedName: "Miku21", // Replace with the database owned
                    Owner: "Miku21", // Replace with the database owned
                    WorkGroup: "Miku21" // Replace with the database owned
                })),
        },
        {
            status:200,
        }
    );
}

export async function POST(request) {
    //get all request
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

    //validation
    if (!AssetID && !ContactID ) {
        return NextResponse.json(
            {
                success: false,
                message: "Asset/Contact selection is required to create a case.",
            },
            { status: 400 }
        );
    }
    
    //create data 
    const case_information = await prisma.caseinformation.create({
        data:{
            CaseID: CaseID,
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
        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "Case Created Successfully!",
            data: case_information,
        },
        { 
            status: 201
        }
    )
}