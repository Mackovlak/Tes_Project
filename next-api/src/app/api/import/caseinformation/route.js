import * as XLSX from "xlsx";
import fs from "fs";
import prisma from "../../../../../prisma/client";
import { NextResponse } from "next/server";
import { success } from "zod";
import { create } from "domain";
import { generateID } from "@/utils/generateID";
import { deleteByPattern } from "../../../../../lib/redis";

export const config = {
  api: {
    bodyParser: false,
  },
};
function parseExcelDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value; // sudah Date
  if (typeof value === "number") {
    // Excel date serial (days since 1900-01-01)
    const excelEpoch = new Date(1900, 0, 1);
    return new Date(excelEpoch.getTime() + (value - 2) * 86400000);
  }
  // fallback: coba parse string
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const normalize = (v) =>
  v === null || v === undefined ? null : v?.toString().trim() || null;

const toIntOrNull = (v) => {
  const n = Number.parseInt(`${v ?? ""}`.trim(), 10);
  return Number.isFinite(n) ? n : null;
};

function toDecimal(value) {
  if (value == null || value === "") return 0;
  const num = parseFloat(value.toString().replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function getInitials(name) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}


export async function GET() {
  try {
    const headers = [
      // --- required ---
      // "ResourceId",
      "CreatedBy",
      "ISDCaseReference",
      "CaseType",
      "SerialNumber",
      "ProductNumber",
      "CustomerName",
      // "FirstName",
      // "LastName",

      // --- matching / recommended ---
      "Company",
      "CompanyEmail",
      "CompanyPrimaryPhone",
      "CompanyMobilePhone",
      "CustomerEmail",
      "CustomerMobile",
      "CustomerWA",
      "Address",
      "Country",
      "Province",
      "City",
      "ZipCode",
      "PICName",
      "PICPhone",
      "PICEmail",

      // --- case fields ---
      "IncomingChannel",
      "CaseStatus",
      "CasePriority",
      "CustomerSeverity",
      // "Owner",
      "KCI_Flag",
      // "SymptomCode",
      "ProblemDescription",
      "ReferenceCase",
      // "CaseResolution",
      // "CaseClosedDate",
      "ReceivedDate",

      // --- warranty / asset ---
      "Warranty_Status",
    ];
    const worksheetData = [headers];

    worksheetData.push([
      "Frontdesk 1",
      "5040199924304",
      "Bench",
      "CND1234ABC",
      "8AA12PA",
      "John Doe",
      "PT Example Company",
      "it@example.co.id",
      "021-123456",
      "021-123456",
      "john.doe@example.co.id",
      "08123456789",
      "08123456789",
      "Jl. Example",
      "Indonesia",
      "DKI Jakarta",
      "JAKARTA BARAT",
      "12345",
      "John Doe",
      "john.doe@example.co.id",
      "Email",
      "New",
      "3 Businnes Days (3BD)",
      "Normal",
      false,
      "User reports BSOD after update",
      "",
      new Date(2026, 7, 24),
      "In Warranty",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Case Import Template");
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Case_Import_Template.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate template" },
      { status: 500 },
    );
  }
}
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // Optional switches (string "true"/"false")
    const createMissing = (formData.get("createMissing") ?? "true") === "true";
    const importerUserId = formData.get("IDUser")
    const userResource = formData.get("resource");

    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheet.length)
      return NextResponse.json(
        { success: false, message: "Uploaded file has no data rows." },
        { status: 400 },
      );

    const warrantyMapping = {
      "In Warranty": "02N", // Normal Warranty
      "Out Warranty": "01T", // Trade (Out Of Warranty)
    };
    const codeWarrantyMapping = {
      "02N": "IW",
      "01T": "OOW",
    };
    const caseTypeMapping = {
      Bench: "BNC",
      Onsite: "ONS",
      "Express Repair": "EXP",
    };
    const companyCodeMapping = {
      "IDY_SB Kokas" : "KKS",
      "IDY_SB Mangga Dua" : "M2",
      "IDY_21 Salatiga" : "STG",
    }

    const resource = await prisma.resource.findFirst({
      where: { ResourceId: normalize(userResource) },
      select: {
        ResourceId: true,
        ResourceCode: true,
        ServiceCenterName: true,
        Name: true,
      },
    });

    if (!resource?.ResourceCode) {
      return NextResponse.json(
        { success: false, message: "Resource not found or missing ResourceCode." },
        { status: 400 }
      );
    }

    // --- preload user map by Name (CreatedBy in Excel = Name) ---
    const createdByNames = Array.from(
      new Set(sheet.map((r) => normalize(r.CreatedBy)).filter(Boolean))
    );
    
    const users = createdByNames.length
      ? await prisma.user.findMany({
        where: { Name: { in: createdByNames}},
        select: {IDUser: true, Name: true}
      })
    : [];
    
    const userByName = new Map(users.map((u) => [u.Name, u]));

    const successes = [];
    const errors = [];

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i];
      const rowIndex = i + 2; // assuming row1 is header

      try {
        // ---------- normalize inputs ----------
        const CreatedByName = normalize(row.CreatedBy);
        const CaseTypeText = normalize(row.CaseType);
        const SerialNumber = normalize(row.SerialNumber);
        const ProductNumber = normalize(row.ProductNumber);
        const CustomerName = normalize(row.CustomerName);

        const missingRequired = [];
        if (!CreatedByName) missingRequired.push("CreatedBy");
        if (!CaseTypeText) missingRequired.push("CaseType");
        if (!SerialNumber) missingRequired.push("SerialNumber");
        if (!ProductNumber) missingRequired.push("ProductNumber");
        if (!CustomerName) missingRequired.push("CustomerName");

        if (missingRequired.length) {
          errors.push({
            row: rowIndex,
            message: `Missing required fields: ${missingRequired.join(", ")}`,
          });
          continue;
        }

        const createdByUser = userByName.get(CreatedByName);
        if (!createdByUser?.IDUser) {
          errors.push({
            row: rowIndex,
            message: `CreatedBy user not found by Name: "${CreatedByName}"`,
          });
          continue;
        }

        const { firstName, lastName } = splitName(CustomerName);

        console.log("row :",row)
        const Company = normalize(row.Company);
        const CompanyEmail = normalize(row.CompanyEmail);
        const CompanyPrimaryPhone = normalize(row.CompanyPrimaryPhone);
        const CompanyMobilePhone = normalize(row.CompanyMobilePhone);

        const CustomerEmail = normalize(row.CustomerEmail);
        const CustomerMobile = normalize(row.CustomerMobile);
        const CustomerWA = normalize(row.CustomerWA);

        const Address = normalize(row.Address);
        const Country = normalize(row.Country);
        const Province = normalize(row.Province);
        const City = normalize(row.City);
        const ZipCode = normalize(row.ZipCode);

        const PICName = normalize(row.PICName);
        const PICPhone = normalize(row.PICPhone);
        const PICEmail = normalize(row.PICEmail);

        const IncomingChannel = normalize(row.IncomingChannel) ?? "Email";
        const CaseStatus = normalize(row.CaseStatus) ?? "New";
        const CasePriority = normalize(row.CasePriority) ?? "Medium";
        const CustomerSeverity = normalize(row.CustomerSeverity) ?? "Normal";
        const KCI_Flag = Boolean(row.KCI_Flag ?? false);
        const ProblemDescription = normalize(row.ProblemDescription) ?? "";
        const ReferenceCase = normalize(row.ReferenceCase);
        const ISDReferenceCase = normalize(row.ISDCaseReference);

        const ReceivedDate = parseExcelDate(row.ReceivedDate);

        const WarrantyText = normalize(row.Warranty_Status);
        const Warranty_Status =
          warrantyMapping[WarrantyText] || normalize(row.Warranty_Status);

        const warrantyShort = codeWarrantyMapping[Warranty_Status] || "UNK";
        const caseTypeShort = caseTypeMapping[CaseTypeText];
        if (!caseTypeShort) {
          errors.push({
            row: rowIndex,
            message: `CaseType not valid: "${CaseTypeText}" (allowed: Bench/Onsite/Express Repair)`,
          });
          continue;
        }


        const txResult = await prisma.$transaction(
          async (tx) => {
            // 1) product must exist (we do NOT create product in import)
            const product = await tx.product_information.findUnique({
              where: {ProductNumber},
              select: {ProductNumber: true, ProductName: true}
            })

            if(!product) throw new Error(`Product not found for ProductNumber: ${ProductNumber}`);

            // 2) company lookup/create
            let SiteAccountID = null;

            if(CompanyPrimaryPhone){
              const found = await tx.site_account.findFirst({
                where: { PrimaryPhone: CompanyPrimaryPhone},
                select: {SiteAccountID: true},
              });
              if(found) SiteAccountID = found.SiteAccountID;
            }

            if (!SiteAccountID && CompanyEmail) {
              const found = await tx.site_account.findFirst({
                where: { Email: CompanyEmail },
                select: { SiteAccountID: true },
              });
              if (found) SiteAccountID = found.SiteAccountID;
            }

            if (!SiteAccountID && Company) {
              const found = await tx.site_account.findFirst({
                where: { Company },
                select: { SiteAccountID: true },
              });
              if (found) SiteAccountID = found.SiteAccountID;
            }

            if (!SiteAccountID && createMissing && Company) {
               // allow case without company
              const created = await tx.site_account.create({
                data: {
                  Company,
                  Email: CompanyEmail ?? "",
                  PrimaryPhone: CompanyPrimaryPhone ?? "",
                  WhatsappNo: CompanyMobilePhone ?? "",
                  AddressLine1: Address ?? "",
                  AddressLine2: "",
                  City: City ?? "",
                  StateProvince: Province ?? "",
                  Country: Country ?? "",
                  ZipPostalCode: ZipCode ?? "",
                  NPWP: "-",
                },
                select: { SiteAccountID: true },
              });
              SiteAccountID = created.SiteAccountID;
            }

            if (!SiteAccountID && !createMissing && Company) {
              // throw new Error("Company not found (createMissing=false).");
            }

            // 3) contact lookup/create
            let ContactID = null;
            let contactSiteAccount = null;

            if (CustomerMobile) {
              const found = await tx.contact_information.findFirst({
                where: { Phone: CustomerMobile },
                select: { ContactID: true, SiteAccountID: true },
              });
              if (found) {
                ContactID = found.ContactID;
                contactSiteAccount = found.SiteAccountID;
              }
            }

            if (!ContactID && CustomerEmail) {
              const found = await tx.contact_information.findFirst({
                where: { Email: CustomerEmail },
                select: { ContactID: true, SiteAccountID: true },
              });
              if (found) {
                ContactID = found.ContactID;
                contactSiteAccount = found.SiteAccountID;
              }
            }

            // fallback: name search (risky but consistent with your old code)
            if (!ContactID && CustomerName) {
              const parts = CustomerName.trim().split(/\s+/).filter(Boolean);
              const found = await tx.contact_information.findFirst({
                where: {
                  AND: parts.map((term) => ({
                    OR: [
                      { FirstName: { contains: term } },
                      { LastName: { contains: term } },
                    ],
                  })),
                },
                select: { ContactID: true, SiteAccountID: true },
              });

              if (found) {
                ContactID = found.ContactID;
                contactSiteAccount = found.SiteAccountID;
              }
            }

            if (ContactID && SiteAccountID && contactSiteAccount == null) {
              await tx.contact_information.update({
                where: { ContactID },
                data: { SiteAccountID },
              });
            }

            if (!ContactID && createMissing) {
              const created = await tx.contact_information.create({
                data: {
                  SiteAccountID: SiteAccountID ?? null,
                  Salutation: "",
                  FirstName: firstName ?? "",
                  LastName: lastName ?? "",
                  Email: CustomerEmail ?? "",
                  Phone: CustomerMobile ?? "",
                  Mobile: CustomerWA ?? "",
                  AddressLine1: Address ?? "",
                  AddressLine2: "",
                  City: City ?? "",
                  StateProvince: Province ?? "",
                  Country: Country ?? "",
                  ZipPostalCode: ZipCode ?? "",

                  PIC_Name: PICName ?? "",
                  PIC_Email: PICEmail ?? "",
                  PIC_Phone: PICPhone ?? "",
                },
                select: { ContactID: true },
              });
              ContactID = created.ContactID;
            }

            if (!ContactID) {
              throw new Error("Contact not found and createMissing=false.");
            }

            // 4) asset lookup/create by serial
            let AssetID = null;

            const existingAsset = await tx.asset_information.findFirst({
              where: { SerialNumber },
              select: { AssetID: true, SerialNumber: true, ContactID: true, SiteAccountID: true },
            });

            if (existingAsset) {
              AssetID = existingAsset.AssetID;

              // attach if empty only (same philosophy you wrote)
              const upd = {};
              if (existingAsset.ContactID == null) upd.ContactID = ContactID;
              if (SiteAccountID && existingAsset.SiteAccountID == null) upd.SiteAccountID = SiteAccountID;

              if (Object.keys(upd).length) {
                await tx.asset_information.update({
                  where: { AssetID },
                  data: upd,
                });
              }
            } else if (createMissing) {
              const createdAsset = await tx.asset_information.create({
                data: {
                  SerialNumber,
                  ProductNumber,
                  SiteAccountID: SiteAccountID ?? null,
                  ContactID,
                  Warranty_Status: Warranty_Status ?? null,
                  EOW_Date: null, // not in template; add if you later include EOW_Date column
                },
                select: { AssetID: true },
              });
              AssetID = createdAsset.AssetID;
            }

            if (!AssetID) {
              throw new Error("Asset not found and createMissing=false.");
            }

            //case rerepair
            let isRerepair = null;
            let caseRerepair = null;
            let countRerepair = null;
            if(existingAsset){
              const since = new Date();
              since.setDate(since.getDate() - 90);

              const caseRerepairData = await tx.caseinformation.findMany({
                where: {
                  AssetID: existingAsset.AssetID,
                  CaseStatus: { notIn: ['Close', 'FinishRepair'] },
                  CreatedOn: { gte: since },
                },
                select: {CaseID : true, CreatedOn: true, CaseStatus: true },
                orderBy: {CreatedOn: 'desc'}
              })
              if(caseRerepairData.length > 0){
                isRerepair = true;
                caseRerepair = {
                  type: "OPEN_CASE_EXISTS",
                  count: caseRerepairData.length,
                  lastCaseId: caseRerepairData[0].CaseID,
                  lastCreatedOn: caseRerepairData[0].CreatedOn,
                  lastStatus: caseRerepairData[0].CaseStatus,
                };
              }
            }
            // 5) build CaseSubject (same spirit as preview)
            const caseRegion = "ID";
            const initialFD = getInitials(CreatedByName);
            const companyCode = companyCodeMapping[resource.ResourceId]; // safer than hard-mapping ResourceId
            const caseProductName = product?.ProductName ?? "-";
            const caseProblemDescription = ProblemDescription || "-";

            const CaseSubject = `${caseRegion}/${caseTypeShort}/${warrantyShort}/${companyCode}/${initialFD}/${caseProductName}/${caseProblemDescription}`;

            // 6) create Case
            const CaseID = await generateID(
              resource.ResourceCode,
              "caseinformation",
              "CaseID",
              tx
            );

            const createdCase = await tx.caseinformation.create({
              data: {
                CaseID,
                SiteAccountID: SiteAccountID ?? null,
                ContactID,
                AssetID,

                CaseSubject,
                CaseType: CaseTypeText,
                IncomingChannel,
                CaseStatus,
                CasePriority,
                CustomerSeverity,

                KCI_Flag,
                ProblemDescription,

                // choose best available reference
                ReferenceCase: ReferenceCase ?? null,

                // created/owner are INT in schema
                CreatedBy: toIntOrNull(createdByUser.IDUser),
                Owner: toIntOrNull(createdByUser.IDUser),

                // if you want: set CreatedOn from ReceivedDate
                ...(ReceivedDate ? { CreatedOn: ReceivedDate } : {}),
              },
              select: { CaseID: true },
            });

            const CaseId = createdCase.CaseID;

            await tx.ActionLog.create({
              data: {
                CaseId: CaseId,
                ReferenceId: CaseId,
                model: "Case",
                dataOld: "New",
                dataNew: "New",
                changedBy: toIntOrNull(createdByUser.IDUser),
                ChangeAt: ReceivedDate ?? new Date(),
                logDescription: `New Case : ${CaseId}`
              }
            })

            if(ISDReferenceCase){
              await tx.casenotes.create({
                data:{
                  CaseID: CaseId,
                  LogType: "System Info",
                  ActionType: "Imported Case",
                  Template: "",
                  VisibleExternally: true,
                  MinutesSpent: 0,
                  Note: `Imported Case Reference From ISD : ${ISDReferenceCase}`,
                  CreatedBy: toIntOrNull(importerUserId),
                  CreatedOn: ReceivedDate ?? new Date()
                }
              })
            }
            await tx.casenotes.create({
              data:{
                CaseID: CaseId,
                LogType: "NotesLog",
                ActionType: "Initial",
                Template: "",
                VisibleExternally: false,
                MinutesSpent: 0,
                Note: ProblemDescription,
                CreatedBy: toIntOrNull(createdByUser.IDUser),
                CreatedOn: ReceivedDate ?? new Date()
              }
            })
            if(isRerepair){
              await tx.casenotes.create({
                data:{
                  CaseID: CaseId,
                  LogType: "NotesLog",
                  ActionType: "Initial",
                  Template: "",
                  VisibleExternally: false,
                  MinutesSpent: 0,
                  Note: `[WARNING]! SN# ${existingAsset?.SerialNumber} has been rerepair ${caseRerepair.count} times in the last 90 day. Last case ID : ${caseRerepair.lastCaseId} received on ${formatDate(caseRerepair.lastCreatedOn)}, closed on .`,
                  CreatedBy: toIntOrNull(createdByUser.IDUser),
                  CreatedOn: ReceivedDate ?? new Date()
                }
              })
            }
            

            return {
              CaseID: createdCase.CaseID,
              SiteAccountID,
              ContactID,
              AssetID,
              CaseSubject,
            };
          }, { timeout: 50000 } )

          console.log(txResult);
        successes.push({
          row: rowIndex,
          ...txResult,
        });
      } catch (err) {
        errors.push({
          row: rowIndex,
          message: err?.message || "Unknown error",
        });
      }

      
    }
    await deleteByPattern("case:list:*");
    await deleteByPattern("case:detail:*");
    return NextResponse.json({
      success: errors.length === 0,
      message: `Processed ${sheet.length} rows. Success: ${successes.length}, Errors: ${errors.length}`,
      created: successes,
      errors,
    }, { status: errors.length ? 207 : 200 } );
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
