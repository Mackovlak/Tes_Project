import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";
import { generateID } from "@/utils/generateID";
import { notifySocket } from "../../../../../lib/SocketClient";
import { sendEmail } from "../../../../../lib/email";

class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Convert input to Date or null.
 * @param {string|null|undefined} value
 * @returns {Date|null}
 */
const toDateOrNull = (value) => {
  if (!value) return null;
  const dt = new Date(value);
  return Number.isNaN(dt.valueOf()) ? null : dt;
};

/**
 * Map accessory payload to DB columns.
 * @param {{name?:string, note?:string, code?:string}} accessory
 */
const normalizeAccessory = (accessory) => ({
  Accessories: accessory?.name ?? "",
  Note: accessory?.note ?? "",
  CT_SNCode: accessory?.code ?? "",
});

/**
 * Create or validate related entities and finally create a case in a single transaction.
 */
export async function POST(request) {
  try {
    const {
      caseData,
      accessories = [],
      product,
      company,
      contact,
      contactPIC,
      asset,
      warranty,
      flags = {},
      references = {},
      resources,
    } = await request.json();

    if (!caseData) {
      throw new HttpError(400, "caseData is required.");
    }

    const {
      isNewProduct = false,
      isNewCompany = false,
      isNewContact = false,
      isNewAsset = false,
      needWarrantyApproval = false,
      usePIC = false,
      assignCompanyToExistingContact = false,
      attachContactToExistingAsset = false,
      attachCompanyToExistingAsset = false,
    } = flags;

    const {
      productNumber: initialProductNumber = null,
      companyId: initialCompanyId = null,
      contactId: initialContactId = null,
      assetId: initialAssetId = null,
    } = references;

    const {
      status: warrantyStatus = null,
      eowDate: warrantyEowDate = null,
    } = warranty || {};

// return console.log(resources)
    const result = await prisma.$transaction(async (tx) => {
      let productNumber = initialProductNumber ?? null;
      let companyId = initialCompanyId ?? null;
      let contactId = initialContactId ?? null;
      let assetId = initialAssetId ?? null;
      let savedResourceId = resources ?? null;

      // --- Product (optional new create) ---
      if (isNewProduct) {
        if (!product?.ProductNumber || !product?.ProductName) {
          throw new HttpError(400, "Product payload is incomplete.");
        }

        console.log("PRODYCT :: ",product)
        const hasTypeId = product?.ProductTypeID != null && `${product.ProductTypeID}`.trim() !== "";
        const hasTypeName = !!product?.ProductTypeName?.trim();
        if (!hasTypeId && !hasTypeName) {
          throw new HttpError(400, "ProductType is required (provide ProductTower / ProductGroup first to select ProductType).");
        }


        const existingProduct = await tx.product_information.findUnique({
          where: { ProductNumber: product.ProductNumber },
        });
        if (existingProduct) {
          throw new HttpError(
            409,
            `Product with ProductNumber ${product.ProductNumber} already exists.`
          );
        }

        const createdProduct = await tx.product_information.create({
          data: {
            ProductNumber: product.ProductNumber,
            ProductName: product.ProductName,
            ProductLine: product.ProductLine ?? "",
            ProductTypeID: product.ProductTypeID
              ? parseInt(product.ProductTypeID, 10)
              : null,
            HWPC: product.HWPC ?? "",
            vendor: product.vendor ?? "",
          },
        });
        productNumber = createdProduct.ProductNumber;
      }

      // --- Company (optional new create) ---
      if (isNewCompany) {
        if (!company?.Company || !company?.Email) {
          throw new HttpError(400, "Company payload is incomplete.");
        }

        const orConditions = [];
        if (company.Email) {
          orConditions.push({ Email: { contains: company.Email } });
        }
        if (company.PrimaryPhone) {
          orConditions.push({ PrimaryPhone: { contains: company.PrimaryPhone } });
        }
        if (company.WhatsappNo) {
          orConditions.push({ WhatsappNo: { contains: company.WhatsappNo } });
        }

        if (orConditions.length > 0) {
          const duplicate = await tx.site_account.count({
            where: { OR: orConditions },
          });
          if (duplicate > 0) {
            throw new HttpError(
              409,
              "A Company with this email or phone already exists."
            );
          }
        }

        const createdCompany = await tx.site_account.create({
          data: {
            Company: company.Company,
            Email: company.Email,
            PrimaryPhone: company.PrimaryPhone ?? "",
            WhatsappNo: company.WhatsappNo ?? "",
            AddressLine1: company.AddressLine1 ?? "",
            AddressLine2: company.AddressLine2 ?? "",
            City: company.City ?? "",
            StateProvince: company.StateProvince ?? "",
            Country: company.Country ?? "",
            ZipPostalCode: company.ZipPostalCode ?? "",
            NPWP: company.NPWP ?? "",
          },
        });
        companyId = createdCompany.SiteAccountID;
      }

      // --- Contact creation or update ---
      if (isNewContact) {
        if (!contact?.FirstName || !contact?.LastName) {
          throw new HttpError(400, "Contact payload is incomplete.");
        }

        const orConditions = [];
        if (contact.Email) {
          orConditions.push({ Email: { contains: contact.Email } });
        }
        if (contact.Phone) {
          orConditions.push({ Phone: { contains: contact.Phone } });
        }
        if (contact.Mobile) {
          orConditions.push({ Mobile: { contains: contact.Mobile } });
        }

        if (orConditions.length > 0) {
          const duplicate = await tx.contact_information.count({
            where: { OR: orConditions },
          });
          if (duplicate > 0) {
            throw new HttpError(
              409,
              "A Contact with this email or phone already exists."
            );
          }
        }

        const createdContact = await tx.contact_information.create({
          data: {
            SiteAccountID: companyId,
            Salutation: contact.Salutation ?? "",
            FirstName: contact.FirstName,
            LastName: contact.LastName,
            Email: contact.Email ?? "",
            Phone: contact.Phone ?? "",
            Mobile: contact.Mobile ?? "",
            AddressLine1: contact.AddressLine1 ?? "",
            AddressLine2: contact.AddressLine2 ?? "",
            City: contact.City ?? "",
            StateProvince: contact.StateProvince ?? "",
            Country: contact.Country ?? "",
            ZipPostalCode: contact.ZipPostalCode ?? "",
            PIC_Name: usePIC ? contact.PIC_Name ?? "" : "",
            PIC_Email: usePIC ? contact.PIC_Email ?? "" : "",
            PIC_Phone: usePIC ? contact.PIC_Phone ?? "" : "",
          },
        });
        contactId = createdContact.ContactID;
      } else if (contactId) {
        const dataToUpdate = {};

        if (usePIC && contactPIC) {
          if (contactPIC.PIC_Name) dataToUpdate.PIC_Name = contactPIC.PIC_Name;
          if (contactPIC.PIC_Email) dataToUpdate.PIC_Email = contactPIC.PIC_Email;
          if (contactPIC.PIC_Phone) dataToUpdate.PIC_Phone = contactPIC.PIC_Phone;
        }

        if (assignCompanyToExistingContact && companyId) {
          const existingContact = await tx.contact_information.findUnique({
            where: { ContactID: contactId },
            select: { SiteAccountID: true },
          });

          if (existingContact && existingContact.SiteAccountID == null) {
            dataToUpdate.SiteAccountID = companyId;
          }
        }

        if (Object.keys(dataToUpdate).length > 0) {
          await tx.contact_information.update({
            where: { ContactID: contactId },
            data: dataToUpdate,
          });
        }
      } else {
        throw new HttpError(400, "Contact information is required.");
      }

      // --- Asset create or update ---
      if (isNewAsset) {
        if (!asset?.SerialNumber) {
          throw new HttpError(400, "Asset payload is incomplete.");
        }
        if (!contactId) {
          throw new HttpError(400, "Asset must be linked to a Contact.");
        }

        const createdAsset = await tx.asset_information.create({
          data: {
            SerialNumber: asset.SerialNumber,
            ProductNumber: productNumber ?? initialProductNumber ?? null,
            SiteAccountID: companyId ?? null,
            ContactID: contactId,
            Warranty_Status: warrantyStatus,
            EOW_Date: toDateOrNull(warrantyEowDate),
          },
        });

        assetId = createdAsset.AssetID;

        if (needWarrantyApproval && warrantyStatus === "01T") {
          await tx.asset_warranty.create({
            data: {
              AssetID: assetId,
              WarrantyApprovalStatus: "New",
              WarrantyCardDate: null,
              POPDocument: "",
              WarrantyCard: "",
              PhotoUnit: "",
              EndUserName: "",
              EndUserPhone: "",
              EndUserAddress: "",
            },
          });
        }
      } else if (assetId) {
        const dataToUpdate = {};

        if (warrantyStatus) {
          dataToUpdate.Warranty_Status = warrantyStatus;
        }
        if (warranty?.hasOwnProperty("eowDate")) {
          dataToUpdate.EOW_Date = toDateOrNull(warrantyEowDate);
        }
        if (attachContactToExistingAsset && contactId) {
          dataToUpdate.ContactID = contactId;
        }
        if (attachCompanyToExistingAsset && companyId !== null) {
          dataToUpdate.SiteAccountID = companyId;
        }

        if (Object.keys(dataToUpdate).length > 0) {
          await tx.asset_information.update({
            where: { AssetID: assetId },
            data: dataToUpdate,
          });
        }

        if (needWarrantyApproval && warrantyStatus === "01T") {
          const existingWarranty = await tx.asset_warranty.findFirst({
            where: { AssetID: assetId },
          });

          if (!existingWarranty) {
            await tx.asset_warranty.create({
              data: {
                AssetID: assetId,
                WarrantyApprovalStatus: "New",
                WarrantyCardDate: null,
                POPDocument: "",
                WarrantyCard: "",
                PhotoUnit: "",
                EndUserName: "",
                EndUserPhone: "",
                EndUserAddress: "",
              },
            });
          }
        }
      } else {
        throw new HttpError(400, "Asset information is required.");
      }

      // --- get Resource Data
      let resourceDataCode
      if(savedResourceId){
        const dataResource = await tx.resource.findUnique({
          where: {
            ResourceId: savedResourceId
          },
          select:{
            ResourceCode: true
          }
        })
        resourceDataCode = dataResource.ResourceCode
      }
      // return resourceDataCode

      // --- Case creation ---
      if (!contactId || !assetId) {
        throw new HttpError(
          400,
          "Case creation requires both Asset and Contact information."
        );
      }

      const createdBy = caseData.CreatedBy
        ? parseInt(caseData.CreatedBy, 10)
        : null;
      if (!createdBy) {
        throw new HttpError(400, "CreatedBy is required in caseData.");
      }

      
      const caseId = await generateID(resourceDataCode, "caseinformation", "CaseID", tx);

      const casePayload = {
        CaseID: caseId,
        SiteAccountID: companyId ?? null,
        ContactID: contactId,
        AssetID: assetId,
        CaseSubject: caseData.CaseSubject,
        CaseType: caseData.CaseType,
        KCI_Flag: Boolean(caseData.KCI_Flag),
        IncomingChannel: caseData.IncomingChannel ?? "Email",
        CaseStatus: caseData.CaseStatus ?? "New",
        CasePriority: caseData.CasePriority ?? "Medium",
        CustomerSeverity: caseData.CustomerSeverity ?? "Normal",
        CaseClosedDate: caseData.CaseClosedDate ?? null,
        CaseNote: caseData.CaseNote ?? null,
        SymptomCode: caseData.SymptomCode ?? null,
        CaseResolution: caseData.CaseResolution ?? null,
        Owner: createdBy,
        CreatedBy: createdBy,
        ProblemDescription: caseData.ProblemDescription ?? "",
        CaseProductNote: caseData.CaseNoteProduct ?? null,
      };

      const createdCase = await tx.caseinformation.create({
        data: {
          ...casePayload,
          ...(Array.isArray(accessories) && accessories.length > 0
            ? {
                accessory: {
                  create: accessories.map(normalizeAccessory),
                },
              }
            : {}),
        },
        include: {
          accessory: true,
        },
      });

      return {
        case: createdCase,
        assetId,
        contactId,
        companyId,
        productNumber,
      };
    }, { timeout: 50000 });
    
    // return console.log("debug", result)

    await notifySocket(
      "case:created",
      {
        message: `Case ${result.case.CaseID} created`,
        caseId: result.case.CaseID,
      },
      {
        createdById: result.case.CreatedBy,
        ownerId: result.case.Owner,
      }
    );

    //send Email
    try {
      if(result.case.KCI_Flag){
        const contactInfo = await prisma.contact_information.findUnique({
          where: {ContactID: result.contactId},
          select:{
            Email: true,
            FirstName: true,
            LastName: true,
            PIC_Email: true,
            PIC_Name: true,
          }
        })

        const companyInfo = result.companyId ? await prisma.site_account.findUnique({
          where: {
            SiteAccountID: result.companyId
          },
          select: { Email: true, Company: true}
        })
        : null;

        const to = contactInfo?.Email;
        const ccList = [
          contactInfo?.PIC_Email,
          companyInfo?.Email
        ].filter(Boolean)

        if(to){
          const subject = `[Case Created] Case ${result.case.CaseID} - ${result.case.CaseSubject || "No Subject"}`;

          const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #0b7285;">Thank you for contacting us</h2>
              <p>Dear ${contactInfo?.FirstName || "Customer"},</p>
              <p>Your case has been created successfully. Below are the details:</p>
              <table style="border-collapse: collapse; margin-top: 12px;">
                <tr><td style="padding: 4px 8px; font-weight: bold;">Case ID:</td><td>${result.case.CaseID}</td></tr>
                <tr><td style="padding: 4px 8px; font-weight: bold;">Subject:</td><td>${result.case.CaseSubject || "-"}</td></tr>
                <tr><td style="padding: 4px 8px; font-weight: bold;">Status:</td><td>${result.case.CaseStatus}</td></tr>
                <tr><td style="padding: 4px 8px; font-weight: bold;">Priority:</td><td>${result.case.CasePriority}</td></tr>
              </table>
              <p style="margin-top: 16px;">We will contact you shortly regarding your case.</p>
              <p>Best regards,<br/>Customer Support Team</p>
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #6c757d;">This message was generated automatically. Please do not reply to this email.</p>
            </div>
          `;

          await sendEmail({
            to,
            cc: ccList,
            subject,
            html,
            text: `Case ${result.case.CaseID} created successfully.`,
          });

          console.log(`[Email] Case ${result.case.CaseID} sent to ${to}`);
        } else{
          console.warn(`[Email] No recipient found for case ${result.case.CaseID}`);
        }
      }
    } catch (emailError) {
      console.error("Failed to send KCI email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Case created successfully.",
        data: {
          case: result.case,
          assetId: result.assetId,
          contactId: result.contactId,
          companyId: result.companyId,
          productNumber: result.productNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message =
      error instanceof HttpError
        ? error.message
        : error?.message || "Failed to create case.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}

