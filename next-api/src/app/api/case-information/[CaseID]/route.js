import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";
import { notifySocket } from "../../../../../lib/SocketClient";
import { Prisma } from "@prisma/client";
import redis, { deleteByPattern, redisKey } from "../../../../../lib/redis";

export async function GET(request, { params }) {
    //get params id
    const url = new URL(request.url);
    const caseID = url.pathname.split("/").pop(); 

    if (!caseID) {
        return NextResponse.json(
            { success: false, message: "Invalid Case ID" },
            { status: 400 }
        );
    }

    const cacheKey = redisKey(`case:detail:${caseID}`);
    const cached = await redis.get(cacheKey);
    if (cached) {
        return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    //get detail post
    const case_information = await prisma.caseinformation.findUnique({
        where: {
            CaseID: caseID,
        },
        include: { 
            asset_information: {
                include:{
                    product_information: {
                        include: {
                            product_type: true
                        }
                    },
                    WarrantyOTCCode: true,
                    asset_warranty: true
                }
            } ,
            contact_information: true, 
            site_account: true,
            servicecatalog: {
                include: {
                    warranty_services: {
                        select: {
                            Service_offerID: true,
                            Service_description: true,
                            CTat_RTime: true,
                            Price: true,
                            Tax: true,
                            Total: true,
                        }
                    }
                }
            }, 
            workorder: {
                include: {
                    bookings:{
                        include: {
                            bookingDetails: true,
                        }
                    },
                    materialorder : {
                        include : {
                            owner: true,
                            materialorderlineitems: {
                                include: {
                                    servicecatalog_parts: true,
                                    quotation_lineitem: {
                                        include:{
                                            quotation: {
                                                include: {
                                                    User: true,
                                                    invoicetable: true
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    },
                    owner: true
                }
            },
            down_payment_table: true,
            casephotos: true,
            global_trade_check: true,
            caseresolution: true,
            accessory: true,
            otcCodeTable: true,
            invoicetable: true,
            createdByUser: {
                include: {
                    resource: true,
                }
            }
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

    const response = {
        success:true,
        message: "Detail Data Case",
        data: case_information,
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

    return NextResponse.json(response, { status: 200 });
}

// update data
export async function PATCH(request, { params }) {
    try {
        
        const { CaseID } = await params;
        const caseID = CaseID;
        const body = await request.json();
    
        // Build data object dynamically
        const updatableFields = [
            'SiteAccountID',
            'ContactID',
            'AssetID',
            'CaseSubject',
            'CaseType',
            'KCI_Flag',
            'IncomingChannel',
            'CaseStatus',
            'Owner',
            'CasePriority',
            'CustomerSeverity',
            'CaseClosedDate',
            'CaseNote',
            'SymptomCode',
            'CaseResolution',
            'OTCCode',
            'id_csr',
            'ProblemDescription',
            'CaseID_Manual',
            'ReferenceCase',
            'CaseID_Manual_Date',
            'CaseProductNote',
            'StorageLocationStore',
            'VoidReason',
        ];
        
        const dataToUpdate = {};
    
        const existing = await prisma.caseinformation.findUnique({ where: { CaseID: caseID } });
        
        for (const field of updatableFields) {
            if (
                body[field] !== undefined &&
                body[field] !== null &&
                body[field] !== '' &&
                body[field] !== existing[field]
            ) {
                dataToUpdate[field] = body[field];
            }
        }
    
        const case_information = await prisma.caseinformation.update({
            where: { CaseID: caseID },
            data: dataToUpdate,
        });

        await deleteByPattern("case:list:*");
        await redis.del(redisKey(`case:detail:${caseID}`));

        await notifySocket("case:updated", case_information);
    
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
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Data yang kamu kirim tidak valid. Ada nilai yang tidak sesuai (OTCCode tidak ditemukan).',
                        errorCode: error.code,
                        meta: error.meta,
                    },
                    { status: 400 }
                );
            }
        }

        // Fallback untuk error lainnya
        console.error('Unexpected Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Terjadi kesalahan pada server.',
            },
            { status: 500 }
        );
    }
}


//delete data
export async function DELETE(request, { params }) {
    const { CaseID } = await params;
    const caseID = CaseID;
    
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

    await deleteByPattern("case:list:*");
    await redis.del(redisKey(`case:detail:${caseID}`));

    return NextResponse.json({
        success: true,
        message: "Data Case Deleted"
    })
}
