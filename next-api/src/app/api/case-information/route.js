import { NextResponse } from "next/server";

import prisma, { setUserIdProvider }  from "../../../../prisma/client";


import { generateID } from "@/utils/generateID";
import { notifySocket } from "../../../../lib/SocketClient";
import { getTokenUserId } from "@/app/middleware/auth";
import redis, { deleteByPattern } from "../../../../lib/redis";
// import * as XLSX from 'xlsx';

export async function GET(request) {
  //get search parameter

  const { searchParams } = new URL(request.url);

  const cacheKey = `case:list:${searchParams.toString() || "all"}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), { status: 200 });
  }



  const exportExcel = searchParams.get("export") === "excel";

  //extract query parameter
  const CaseStatus = searchParams.get("CaseStatus");
  const excludeStatusesRaw = searchParams.get("excludeStatuses");
  const excludeStatuses = excludeStatusesRaw ? excludeStatusesRaw.split(',') : null;
  const Owner = searchParams.get("IDUser");
  const resourceTarget = searchParams.get("resource");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  // return console.log("ID ",resource)


  // const resourceTarget = searchParams.get("resource");
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const oneYearMs = 365 * 24 * 60 * 60 * 1000;

    if (end - start > oneYearMs) {
      return NextResponse.json(
        {
          success: false,
          message: "Date range maksimal adalah satu tahun"
        },
        { status: 400 }
      );
    }
  }

  //prisma query filter
  const filters = {};
  if (CaseStatus) {
    filters.CaseStatus = CaseStatus;
  }else if (excludeStatuses){
    filters.CaseStatus = {
      notIn: excludeStatuses,
    };
  }
  // const openCount = await prisma.caseinformation.count({
  //   where: {
  //     CaseStatus: "Open",
  //   },
  // });
  // const closedCount = await prisma.caseinformation.count({
  //   where: {
  //     CaseStatus: "Close",
  //   },
  // });
  // const inActiveCount = await prisma.caseinformation.count({
  //   where: {
  //     CaseStatus: "InActive",
  //   },
  // });

  const tenantFilters = {};
  if (resourceTarget) {
    tenantFilters.OR = [
      {
        createdByUser: {
          ResourceId: resourceTarget,
        },
      },
      {
        ownerUser: {
          ResourceId: resourceTarget,
        },
      },
    ];
  }
  if (startDate || endDate) {
    filters.CreatedOn = {};

    if (startDate) {
      filters.CreatedOn.gte = new Date(startDate);
    }

    if (endDate) {
      filters.CreatedOn.lte = new Date (endDate + "T23:59:59");
    }
  }

  const finalWhere = {
    ...filters,
    ...(Object.keys(tenantFilters).length > 0 ? tenantFilters : {}),
  }
  //get all data
  const [openCount, closedCount, inActiveCount, case_information] = await prisma.$transaction([
    prisma.caseinformation.count({where: { CaseStatus: "Open"}}),
    prisma.caseinformation.count({where: {CaseStatus: "Close"}}),
    prisma.caseinformation.count({where: {CaseStatus: "InActive"}}),
    prisma.caseinformation.findMany({
      where: Object.keys(finalWhere).length ? finalWhere : undefined,
      include : {
        asset_information:{
          include: {
            product_information: { include: { product_type: true}},
          },
        },
        contact_information: {
          include: { site_account: true },
        },
        createdByUser: true,
        ownerUser: true,
        ActionLog: {
          orderBy: { ChangeAt: "desc" },
          take: 5,
        },
        workorder:{
          include:{
            materialorder:{
              include:{
                materialorderlineitems:{
                  include:{
                    quotation_lineitem:{
                      include:{ quotation: true},
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  ]);

  const response = {
    success: true,
    message: "List Data Case",
    data: case_information.map((caseData) => ({
      CaseID: caseData.CaseID,
      // CreatedOn: caseData.CreatedOn,
      CreatedOn: caseData.CreatedOn.toLocaleString("id-ID"),
      UpdateOn: caseData.ActionLog[0]?.ChangeAt ,
      // Actionlog: caseData.ActionLog[0]?.ChangeAt,
      CaseSubject: caseData.CaseSubject,
      CustomerAccount:
        caseData.contact_information?.site_account?.Company || "No Company",
      Primary: `${caseData.contact_information?.FirstName || ""} ${
        caseData.contact_information?.LastName || ""
      }`.trim(),
      HW: "N/A", //wtf is this
      SerialNumber: caseData.asset_information?.SerialNumber || "No Serial",
      ProductNumber:
        caseData.asset_information?.ProductNumber || "No Product Number",
      ProductName:
        caseData.asset_information?.product_information?.ProductName ||
        "No Product Name",
      CreatedName: caseData.createdByUser?.Name, // Replace with the database owned
      Owner: caseData.ownerUser?.Name, // Replace with the database owned
      WorkGroup: caseData.ownerUser?.Name, // Replace with the database owned
      CaseStatus: caseData.CaseStatus,
      caseinformation: {
        ...caseData,
        ActionLog: undefined,
      },
      UpdatedActionLogs: caseData?.ActionLog.filter((log) => log.dataOld !== log.dataNew && log.model !== "CaseOwner" ).map((log) => ({
        ChangeAt: log.ChangeAt,
        ChangedBy: log.ChangedBy,
        dataOld: log.dataOld,
        dataNew: log.dataNew,
        logDescription: log.logDescription,
        model: log.model,
      })) || [],
    })),
    value: {
      open: openCount,
      closed: closedCount,
      inActive: inActiveCount,
    },
  }
  // const case_information1 = await prisma.caseinformation.findMany({
  //   where: Object.keys(finalWhere).length > 0 ? finalWhere : undefined,
  //   include: {
  //     asset_information: {
  //       select: {
  //         AssetID: true,
  //         SerialNumber: true,
  //         ProductNumber: true,
  //         WarrantyOTCCode: true,
  //         product_information: {
  //           include: {
  //             product_type: true
  //           }
  //         },
  //       },
  //     },
  //     contact_information: {
  //       select: {
  //         ContactID: true,
  //         FirstName: true,
  //         LastName: true,
  //         Email: true,
  //         Phone: true,
  //         City: true,
  //         site_account: {
  //           select: { Company: true, Email: true },
  //         },
  //       },
  //     },
  //     servicecatalog: {
  //       select: {
  //         ServiceCatalogID: true,
  //         Service_offerID: true,
  //         PartNumber: true,
  //         WarrantyStatus: true,
  //         Price: true,
  //         Tax: true,
  //         Total: true,
  //         warranty_services: {
  //           select: {
  //             Service_offerID: true,
  //             Service_description: true,
  //             CTat_RTime: true,
  //             Price: true,
  //             Total: true,
  //             Tax: true,
  //           },
  //         },
  //       },
  //     },
  //     createdByUser: true,
  //     ownerUser: true,
  //     global_trade_check: true,
  //     caseresolution: true,
  //     otcCodeTable: true,
  //     casenotes_caseinformation_CaseNoteTocasenotes: true,
  //     workorder: {
  //       include: {
  //         materialorder: {
  //           include: {
  //             materialorderlineitems: {
  //               include :{
  //                 quotation_lineitem :{
  //                   include: {
  //                     quotation: true
  //                   }
  //                 }
  //               }
  //             },
  //             owner: true
  //           }
  //         },
  //         owner: true
  //       }
        
  //     },
  //     accessory: true,
  //     ActionLog: {
  //       orderBy: {
  //         ChangeAt: 'desc'
  //       },
  //     }
  //   },
  // });

  await redis.set(cacheKey, JSON.stringify(response), "EX", 60);




  return NextResponse.json(response, {status: 200});
}

export async function POST(request) {
    //get all request
    const { 
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
        CaseResolution,
        CreatedBy,
        ProblemDescription,
        // CaseID_Manual,
        // CaseID_Manual_Date,
        CaseNoteProduct,
        accessories,
    } = await request.json();

    try {
      const CaseID = await generateID("C-", "caseinformation", "CaseID")
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

      // Conflict rule: only one open case per Asset
      if (AssetID) {
        const openExisting = await prisma.caseinformation.findFirst({
          where: { AssetID: AssetID, CaseStatus: 'Open' },
          select: { CaseID: true }
        });
        if (openExisting) {
          // return NextResponse.json({
          //   success: false,
          //   message: `An OPEN case for this asset already exists (${openExisting.CaseID}).`,
          // }, { status: 409 });
        }
      }

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
            CaseResolution: CaseResolution,
            Owner: parseInt(CreatedBy),
            CreatedBy: parseInt(CreatedBy),
            ProblemDescription: ProblemDescription,
            // CaseID_Manual: CaseID_Manual,
            // CaseID_Manual_Date: new Date (CaseID_Manual_Date),
            CaseProductNote : CaseNoteProduct,
            ...(Array.isArray(accessories) && accessories.length > 0 && {
              accessory: {
                create: accessories.map((acc) => ({
                  Accessories: acc.name,
                  Note: acc.note,
                  CT_SNCode: acc.code,
                })),
              },
            }),
          },
      });
      await deleteByPattern("case:list:*");
      await deleteByPattern("case:detail:*");


  await notifySocket("case:created", {
    message: `Case ${case_information.CaseID} created`,
    caseId: case_information.CaseID,
  }, {
    createdById: case_information.CreatedBy,  // your schema column
    ownerId: case_information.Owner           // your schema column
  });



      return NextResponse.json({
          success: true,
          message: "Case Created Successfully!",
          data: case_information,
      }, { status: 201 })
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Failed to create case",
        error: error.message
      }, { status: 500 });
    }
}
