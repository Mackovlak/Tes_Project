import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/client";
import { CaseStatus } from "@prisma/client";

function parseExcelDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const excelEpoch = new Date(1900, 0, 1);
    return new Date(excelEpoch.getTime() + (value - 2) * 86400000);
  }
  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
}

const normalize = (v) =>
  v === null || v === undefined ? null : v?.toString().trim() || null;

const toIntOrNull = (v) => {
  const n = Number.parseInt(`${v ?? ""}`.trim(), 10);
  return Number.isFinite(n) ? n : null;
};

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}



/**
 * Preview import payload without mutating data.
 * Returns:
 * - normalized inputs
 * - match results for company/contact/asset/resource
 * - planned actions based on createMissing flag
 * - blocked rows + reasons
 */

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const createMissing = (formData.get("createMissing") ?? "true") === "true";
    const userId = formData.get("IDUser");
    const userResource = formData.get("resource");

    const warrantyMapping = {
      "In Warranty": "02N", // Normal Warranty
      "Out Warranty": "01T", // Trade (Out Of Warranty)
    };

    const codeWarrantyMapping = {
      "02N" : "IW", // Normal Warranty
      "01T" : "OOW", // Trade (Out Of Warranty)
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheet.length) {
      return NextResponse.json(
        { success: false, message: "Uploaded file has no data rows." },
        { status: 400 }
      );
    }

    const successes = [];
    const errors = [];

    // 1) normalize rows first
    const rows = sheet.map((row, idx) => {
      const CustomerName = normalize(row.CustomerName);
      const { firstName, lastName } = splitName(CustomerName || "");
      const WarrantyText = normalize(row.Warranty_Status);
      const Warranty_Status =
        warrantyMapping[WarrantyText] || normalize(row.Warranty_Status);

      return {
        index: idx + 2,
        inputs: {
          // required-ish
          CreatedBy: normalize(row.CreatedBy),
          CaseType: normalize(row.CaseType),
          
          //opt reference
          ISDReferenceCase: normalize(row.ISDCaseReference),

          // asset keys
          SerialNumber: normalize(row.SerialNumber),
          ProductNumber: normalize(row.ProductNumber),

          // contact keys
          CustomerName,
          FirstName: firstName,
          LastName: lastName,
          CustomerEmail: normalize(row.CustomerEmail),
          CustomerMobile: normalize(row.CustomerMobile),
          CustomerWA: normalize(row.CustomerWA),

          // company keys
          Company: normalize(row.Company),
          CompanyEmail: normalize(row.CompanyEmail),
          CompanyPrimaryPhone: normalize(row.CompanyPrimaryPhone),
          CompanyMobileNo: normalize(row.CompanyMobileNo),

          // extras
          IncomingChannel: normalize(row.IncomingChannel),
          CaseStatus: normalize(row.CaseStatus),
          CasePriority: normalize(row.CasePriority),
          CustomerSeverity: normalize(row.CustomerSeverity ?? Normal),
          KCI_Flag: Boolean(row.KCI_Flag ?? false),
          ProblemDescription: normalize(row.ProblemDescription),
          ReferenceCase: normalize(row.ReferenceCase),

          ReceivedDate: parseExcelDate(row.ReceivedDate),
          Warranty_Status,

          PICName: normalize(row.PICName),
          PICPhone: normalize(row.PICPhone),
          PICEmail: normalize(row.PICEmail),

          Address: normalize(row.Address),
          Country: normalize(row.Country),
          Province: normalize(row.Province),
          City: normalize(row.City),
          ZipCode: normalize(row.ZipCode),

          Owner: normalize(row.CreatedBy),
        },
      };
    });
    
    // 2) gather lookup keys
    const UserID = Array.from(
      new Set(rows.map((r) => r.inputs.CreatedBy).filter(Boolean))
    );

    const companyPrimaryPhones = Array.from(
      new Set(rows.map((r) => r.inputs.CompanyPrimaryPhone).filter(Boolean))
    )
    const companyEmails = Array.from(
      new Set(rows.map((r) => r.inputs.CompanyEmail).filter(Boolean))
    );

    const companyNames = Array.from(
      new Set(rows.map((r) => r.inputs.Company).filter(Boolean))
    );

    
    const contactPhone = Array.from(
      new Set(rows.map((r)=> r.inputs.CustomerMobile).filter(Boolean))
    )

    const contactEmails = Array.from(
      new Set(rows.map((r) => r.inputs.CustomerEmail).filter(Boolean))
    );
    
    const contactNames = Array.from(
      new Set(rows.map((r) => r.inputs.CustomerName).filter(Boolean))
    )

    const contactFirstNames = Array.from(
      new Set(rows.map((r)=> r.inputs.FirstName).filter(Boolean))
    )
    const contactLastNames = Array.from(
      new Set(rows.map((r)=> r.inputs.LastName).filter(Boolean))
    )

    const serialNumbers = Array.from(
      new Set(rows.map((r) => r.inputs.SerialNumber).filter(Boolean))
    );

    const productNumbers = Array.from(
      new Set(rows.map((r) => r.inputs.ProductNumber).filter(Boolean))
    )

    // GET PRIMARY DATA FIRST :
    // 1. resource 
    const resource = await prisma.Resource.findFirst({
      where: {ResourceId : normalize(userResource)}
    })
    // 2. User Imported
    const userImported = await prisma.user.findFirst({
      where: {IDUser: toIntOrNull(userId)},
      select: {Name: true, Username: true, Email: true, Role: true}
    })
    const [userLookups, companyByPrimaryPhone, companyByEmail, companyByName, contactByMobile, contactByEmail, contactByNames, assetBySerial, assetByProduct, isCaseRerepair, resourceByName] =
      await Promise.all([
        UserID.length 
          ? prisma.user.findMany({
            where: {Name: { in: UserID }},
            select: {Name: true, Username: true, Email: true, ResourceId: true}
          })
          : Promise.resolve([]),
        companyPrimaryPhones.length
          ? prisma.site_account.findMany({
            where:{PrimaryPhone: {in: companyPrimaryPhones}},
            select: { SiteAccountID: true, PrimaryPhone: true, Email: true, Company: true },
          })
          : Promise.resolve([]),
        companyEmails.length 
          ? prisma.site_account.findMany({
              where: { Email: { in: companyEmails } },
              select: { SiteAccountID: true, PrimaryPhone: true, Email: true, Company: true },
            })
          : Promise.resolve([]),
        // name-based fallback is risky; still useful in preview to show potential match
        companyNames.length
          ? prisma.site_account.findMany({
              where: { Company: { in: companyNames } },
              select: { SiteAccountID: true, Company: true, PrimaryPhone: true, Email: true },
            })
          : Promise.resolve([]),

        contactPhone.length
          ? prisma.contact_information.findMany({
              where: { Phone: { in: contactPhone } },
              select: {
                ContactID: true,
                Phone: true,
                Email: true,
                FirstName: true,
                LastName: true,
                SiteAccountID: true,
              },
            })
          : Promise.resolve([]),
        contactEmails.length
          ? prisma.contact_information.findMany({
              where: { Email: { in: contactEmails } },
              select: {
                ContactID: true,
                Phone: true,
                Email: true,
                FirstName: true,
                LastName: true,
                SiteAccountID: true,
              },
            })
          : Promise.resolve([]),
        contactNames.length
          ? prisma.contact_information.findMany({
              where: { OR: [
                {FirstName: { in: contactFirstNames }},
                {LastName: { in: contactLastNames }}
              ]},
              select: {
                ContactID: true,
                Phone: true,
                Email: true,
                FirstName: true,
                LastName: true,
                SiteAccountID: true,
              },
            })
          : Promise.resolve([]),
        serialNumbers.length
          ? prisma.asset_information.findMany({
              where: { SerialNumber: { in: serialNumbers } },
              select: {
                AssetID: true,
                SerialNumber: true,
                ProductNumber: true,
                product_information: {
                  select:{
                    ProductName: true
                  }
                },
                ContactID: true,
                SiteAccountID: true,
              },
            })
          : Promise.resolve([]),
        productNumbers.length
          ? prisma.product_information.findMany({
            where: { ProductNumber: { in: productNumbers }}
          })
          : Promise.resolve([]),
          //Is Rerepair
        serialNumbers.length
          ? prisma.caseinformation.findMany({
            where:{
              asset_information : {
                SerialNumber: { in: serialNumbers }
              },
              CaseStatus: { notIn: ['Close', 'FinishRepair'] }
            },
            include: {
              asset_information: {
                select: { SerialNumber: true }
              }
            },
            orderBy : [
              {
                CreatedOn: 'desc'
              }
            ]
          })
          : Promise.resolve([]),
        UserID.length 
          ? prisma.user.findMany({
            where: {Name: { in: UserID }},
            include:{resource: {
              select: {
                ResourceId: true,
                ResourceCode: true,
                ServiceCenterName: true,
                Name: true,
              }
            }}
            
          })
          : Promise.resolve([]),
      ])
    

    // 4) make maps
    const userMap = new Map(userLookups.map((x) => [x.Name, x]));
    const companyPhoneMap = new Map(companyByPrimaryPhone.map((x)=> [x.PrimaryPhone, x]))
    const companyEmailMap = new Map(companyByEmail.map((x) => [x.Email, x]));
    const companyNameMap = new Map(companyByName.map((x) => [x.Company, x]));

    const contactPhoneMap = new Map(contactByMobile.map((x)=> [x.Phone, x]));
    const contactEmailMap = new Map(contactByEmail.map((x) => [x.Email, x]));
    const contactNameMap = new Map(contactByNames.map((x) => [x.FirstName + " "+x.LastName, x]));
    const assetSerialMap = new Map(assetBySerial.map((x) => [x.SerialNumber, x]));
    const assetProductMap = new Map(assetByProduct.map((x) => [x.ProductNumber, x]));

    const resourceMap = new Map(resourceByName.map((x)=> [x.ResourceId, x]))
    console.log("Re source",resourceMap);

    
    const caseRerepairMap = new Map();

    for (const c of isCaseRerepair) {
      const sn = c.asset_information?.SerialNumber;
      if (!sn) continue;

      if (!caseRerepairMap.has(sn)) {
        caseRerepairMap.set(sn, []);
      }

      caseRerepairMap.get(sn).push(c);
    }
    
    // console.log("REREPAIR ", caseRerepairMap)



    // console.log("kontak eamil ",assetProductMap,assetSerialMap);
    // 5) build preview
    const previewRows = rows.map((r) => {
      const inp = r.inputs;
      const reasons = [];
      const actions = [];
      const warnings = [];

       // required check
      const missingRequired = [];
      if (!inp.CreatedBy) missingRequired.push("CreatedBy");
      if (!inp.CaseType) missingRequired.push("CaseType");
      if (!inp.SerialNumber) missingRequired.push("SerialNumber");
      if (!inp.ProductNumber) missingRequired.push("ProductNumber");
      if (!inp.CustomerName) missingRequired.push("FirstName/CustomerName");

      if (missingRequired.length) {
        reasons.push(`Missing required fields: ${missingRequired.join(", ")}`);
      }

      const userMatch = inp.CreatedBy ? userMap.get(inp.CreatedBy) : null;
      if(userMatch) actions.push("MATCH_USER");
      else actions.push("MISSING_USER");
       // company match (email > name)
      let companyMatch = null;
      let companyMatchBy = null;
      if (inp.CompanyPrimaryPhone && companyPhoneMap.has(inp.CompanyPrimaryPhone)) {
        companyMatch = companyPhoneMap.get(inp.CompanyPrimaryPhone);
        companyMatchBy = "Primary Phone";
      } else if (inp.CompanyEmail && companyEmailMap.has(inp.CompanyEmail)) {
        companyMatch = companyEmailMap.get(inp.CompanyEmail);
        companyMatchBy = "Email";
      } else if (inp.Company && companyNameMap.has(inp.Company)) {
        companyMatch = companyNameMap.get(inp.Company);
        companyMatchBy = "Name";
        warnings.push("COMPANY_MATCH_BY_NAME_RISK");
      }

      if (companyMatch) actions.push("MATCH_COMPANY");
      else if (!inp.Company) actions.push("NO_COMPANY");
      else actions.push(createMissing ? "CREATE_COMPANY" : "MISSING_COMPANY");

      // contact match (email only in preview; name-search is too fuzzy in batch)
      let contactMatch = null
      let contactMatchBy = null
      // console.log("DATA Company", inp, companyByEmail, companyEmailMap)
      // console.log("DATA", 
      //   "Customer Input Name",inp.CustomerName, 
      //   "Customer Input Email",inp.CustomerEmail, 
      //   "Customer by Email",contactByEmail, 
      //   "Customer Email Map",contactEmailMap, 
      //   "Customer by Name",contactByNames, 
      //   "Customer Name Map",contactNameMap, 
      //   inp.CustomerEmail && contactEmailMap.has(inp.CustomerEmail), 
      //   inp.CustomerName && contactNameMap.has(inp.CustomerName)
      // )

      if (inp.CustomerMobile && contactPhoneMap.has(inp.CustomerMobile)) {
        contactMatch = contactPhoneMap.get(inp.CustomerMobile);
        contactMatchBy = "Phone Number";
      }
      else if (inp.CustomerEmail && contactEmailMap.has(inp.CustomerEmail)) {
        contactMatch = contactEmailMap.get(inp.CustomerEmail);
        contactMatchBy = "Email";
      } 
      else if (inp.CustomerName && contactNameMap.has(inp.CustomerName)) {
        contactMatch = contactNameMap.get(inp.CustomerName);
        contactMatchBy = "Name";
        warnings.push("CONTACT_MATCH_BY_NAME_RISK");
      }
      if (contactMatch) actions.push("MATCH_CONTACT");
      else actions.push(createMissing ? "CREATE_CONTACT" : "MISSING_CONTACT");

      // asset match
      let assetMatch = null;
      let productMatch = null;
      let assetMatchBy = null
      let createAsset = null;
      if(inp.SerialNumber && assetSerialMap.has(inp.SerialNumber)){
        assetMatch = assetSerialMap.get(inp.SerialNumber)
        assetMatchBy = "Serial Number"
      } else if(inp.ProductNumber && assetProductMap.has(inp.ProductNumber)){
        productMatch = assetProductMap.get(inp.ProductNumber)
        assetMatchBy = "Product Number"
        createAsset = true;
      }
      // console.log("DATA ASSET",
      //   inp.ProductNumber,
      //   assetProductMap,
      //   assetByProduct,
      // )

      let isRerepair = null;
      let rerepairCases = [];

      if (inp.SerialNumber && caseRerepairMap.has(inp.SerialNumber)) {
        rerepairCases = caseRerepairMap.get(inp.SerialNumber);
        isRerepair = true;
      }
      const latestCases = rerepairCases.slice(0, 1);
      const latestCaseIDs = latestCases.map((c) => c.CaseID);

      if (assetMatch) actions.push("MATCH_ASSET");
      else if(productMatch) {actions.push("MATCH_PRODUCT"); actions.push("CREATE_ASSET")}
      else actions.push((createAsset && createMissing) ? "CREATE_ASSET" : "MISSING_PRODUCT");

      // relationship warnings
      if (contactMatch && companyMatch) {
        if (contactMatch.SiteAccountID == null) warnings.push("CONTACT_NOT_RELATED_TO_COMPANY");
      }
      if (assetMatch && contactMatch) {
        if (assetMatch.ContactID == null) warnings.push("ASSET_NOT_RELATED_TO_CONTACT");
      }
      if (assetMatch && companyMatch) {
        if (assetMatch.SiteAccountID == null) warnings.push("ASSET_NOT_RELATED_TO_COMPANY");
      }

      // blocked logic
      let blocked = false;

      if (reasons.length) blocked = true;

      // if createMissing=false, missing any required relation blocks
      if(!userMatch){
        blocked = true;
        reasons.push("User not found.");
      }
      if (!assetMatch && !productMatch) {
          blocked = true;
          reasons.push("Product not found (createMissing=false).");
        }
      if (!createMissing) {
        if (!companyMatch && inp.CompanyEmail) {
          blocked = true;
          reasons.push("Company not found by email (createMissing=false).");
        }
        if (!companyMatch && inp.Company) {
          blocked = true;
          reasons.push("Company not found (createMissing=false).");
        }
        if (!contactMatch) {
          blocked = true;
          reasons.push("Contact not found (createMissing=false).");
        }
      }

      //case handler
      
      const caseRegion = "ID"

      const caseTypeMapping = {
        "Bench": "BNC",
        "Onsite": "ONS",
        "Express Repair": "EXP",
      }
      const caseType = caseTypeMapping[inp.CaseType]
      if(!caseType) {
        blocked = true;
        reasons.push("Case Type not valid")
      }
      
      const caseWarrantyStatus = codeWarrantyMapping[inp.Warranty_Status]
      
      const companyCodeMapping = {
        "IDY_SB Kokas" : "KKS",
        "IDY_SB Mangga Dua" : "M2",
        "IDY_21 Salatiga" : "STG",
        "IDY_SB Gubeng": "SBY"
      }

      const companyCode = companyCodeMapping[userMatch.ResourceId]
      if(!companyCode){
        blocked = true;
        reasons.push("Resource not found")
      }

      const initialFD = getInitials(inp.CreatedBy);
      const caseProductName = assetMatch 
        ? assetMatch.product_information?.ProductName 
        : productMatch 
          ? productMatch.ProductName 
          : "-"
      const caseProblemDescription = inp.ProblemDescription ?? "-"

      if (isRerepair) {
        warnings.push("REREPAIR_CASE")
      }
      if (!blocked) actions.push("CREATE_CASE");

      
      const CaseSubject = `${caseRegion}/${caseType}/${caseWarrantyStatus}/${companyCode}/${initialFD}/${caseProductName}/${caseProblemDescription}`

      const resourceTarget = resourceMap.get(userMatch.ResourceId);

      return {
        index: r.index,
        inputs: inp,
        user: userImported,
        resource: resourceTarget.resource,
        caseSubject: CaseSubject,
        ISDReferenceCase: inp.ISDReferenceCase,
        matches: {
          // resource: res
          //   ? {
          //       found: true,
          //       ResourceId: res.ResourceId,
          //       ResourceCode: res.ResourceCode,
          //       Name: res.Name,
          //     }
          //   : null,
          company: companyMatch
            ? {
                found: true,
                matchBy: companyMatchBy,
                SiteAccountID: companyMatch.SiteAccountID,
                Company: companyMatch.Company,
                Email: companyMatch.Email,
                PrimaryPhone: companyMatch.PrimaryPhone,
              }
            : null,
          contact: contactMatch
            ? {
                found: true,
                matchBy: contactMatchBy,
                ContactID: contactMatch.ContactID,
                name: `${contactMatch.FirstName} ${contactMatch.LastName}`.trim(),
                Email: contactMatch.Email,
                Phone: contactMatch.Phone,
                SiteAccountID: contactMatch.SiteAccountID,
              }
            : null,
          asset: assetMatch
            ? {
                found: true,
                matchBy: assetMatchBy,
                AssetID: assetMatch.AssetID,
                SerialNumber: assetMatch.SerialNumber,
                ProductNumber: assetMatch.ProductNumber,
                ProductName: assetMatch.product_information?.ProductName,
                ContactID: assetMatch.ContactID,
                SiteAccountID: assetMatch.SiteAccountID,
              }
            : null,
          product: productMatch 
            ? {
                found: true,
                matchBy: assetMatchBy,
                ProductNumber: productMatch.ProductNumber,
                ProductName: productMatch.ProductName,
              }
            : null,
          rerepair: isRerepair ? {
            count: rerepairCases.length,
            latestCaseIDs,
            latestCases: latestCases.map(c => ({
              CaseID: c.CaseID,
              CaseStatus: c.CaseStatus,
              CreatedOn: c.CreatedOn,
              CaseSubject: c.CaseSubject,
            }))
          } : null,
        },
        plan: { actions, warnings },
        blocked,
        reasons,
      };
    })
    const blockedRows = previewRows.filter((r) => r.blocked).length;
    return NextResponse.json({
      success: true,
      createMissing,
      totalRows: previewRows.length,
      readyRows: previewRows.length - blockedRows,
      blockedRows,
      rows: previewRows,
    });
  } catch (error) {
    console.error("Preview Import Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to preview import." },
      { status: 500 }
    );
  }
}
