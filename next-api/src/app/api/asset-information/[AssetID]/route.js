import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";
import redis, { deleteByPattern, redisKey } from "../../../../../lib/redis";

export async function GET(request, { params }) {
    const { AssetID } = await params
    const assetID = parseInt(AssetID);

    if (isNaN(assetID)) {
        return NextResponse.json({
            success: false,
            message: "Invalid Asset ID"
        }, { status: 400 });
    }

    const cacheKey = redisKey(`asset:detail:${assetID}`);
    const cached = await redis.get(cacheKey);
    if (cached) {
        return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    const asset_information = await prisma.asset_information.findUnique({
        where: { AssetID: assetID },
        include: {
            site_account: true,
            contact_information: true,
            product_information:{
                include: {
                    product_type: true
                }
            },
            asset_warranty: true,
            WarrantyOTCCode: true
        }
    });

    if (!asset_information) {
        return NextResponse.json({
            success: false,
            message: "Detail Data Asset Information Not Found!",
            data: null
        }, { status: 404 });
    }

    const response = {
        success: true,
        message: "Detail Data Asset Information",
        data: asset_information
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

    return NextResponse.json(response, { status: 200 });
}


// update data
/**
 * TODO 
 * MAKE UPDATE ASSET AND CREATE PRODUCT SEPARATELY
 */

import fs from "fs";
import path from "path";

export async function PATCH(request, { params }) {
    const assetId = parseInt(params.AssetID);

    try {
        const contentType = request.headers.get("content-type") || "";
        let body = {};
        let files = {};

        // --- 1. Parse request based on Content-Type ---
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();

            formData.forEach((value, key) => {
                if (value instanceof File) {
                    if (!files[key]) files[key] = [];
                    files[key].push(value);
                } else {
                    body[key] = value;
                }
            });
        } else if (contentType.includes("application/json")) {
            body = await request.json();
        } else {
            return NextResponse.json(
                { success: false, message: "Unsupported content type" },
                { status: 400 }
            );
        }

        // --- 2. Extract fields from body ---
        const {
            SerialNumber,
            ProductNumber,
            SiteAccountID,
            ContactID,
            Warranty_Status,
            EOW_Date,
            needWarrantyApproval = false,
            WarrantyApprovalStatus,
            WarrantyCardDate,
            EndUserName,
            EndUserPhone,
            EndUserAddress,
            PurchaseDate,
            CaseID,
        } = body;

        // --- 3. Save files if any ---
        const uploadDir = path.join(process.cwd(), "public", "uploads","warranty");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const saveFile = async (file, doctype) => {
            if (!file || typeof file === "string") return null;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            //file name
            const ext = path.extname(file.name);
            const uniqueId = Date.now();

            const filename = `${CaseID}-${doctype}-${uniqueId}${ext}`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            return `/uploads/warranty/${filename}`; // URL path
        };

        const popPath = files.POPDocument?.[0]
            ? await saveFile(files.POPDocument[0], "pop")
            : body.POPDocument && typeof body.POPDocument === "string"
                ? body.POPDocument
                : "";

        const warrantyPath = files.WarrantyCard?.[0]
            ? await saveFile(files.WarrantyCard[0], "warranty-card")
            : body.WarrantyCard && typeof body.WarrantyCard === "string"
                ? body.WarrantyCard
                : "";

        const photoPath = files.PhotoUnit?.[0]
            ? await saveFile(files.PhotoUnit[0], "unit")
            : body.PhotoUnit && typeof body.PhotoUnit === "string"
                ? body.PhotoUnit
                : "";
        // --- 4. Check if asset exists ---
        const existingAsset = await prisma.asset_information.findUnique({
            where: { AssetID: assetId },
        });

        if (!existingAsset) {
            return NextResponse.json(
                { success: false, message: "Asset not found" },
                { status: 404 }
            );
        }

        // --- 5. Build update data ---
        const dataToUpdate = {};
        if (SerialNumber !== undefined) dataToUpdate.SerialNumber = SerialNumber;
        if (ProductNumber !== undefined) dataToUpdate.ProductNumber = ProductNumber;
        if (SiteAccountID !== undefined)
            dataToUpdate.SiteAccountID = SiteAccountID
                ? parseInt(SiteAccountID)
                : null;
        if (ContactID !== undefined)
            dataToUpdate.ContactID = ContactID ? parseInt(ContactID) : null;
        if (Warranty_Status !== undefined)
            dataToUpdate.Warranty_Status = Warranty_Status;
        if (EOW_Date !== undefined)
            dataToUpdate.EOW_Date = EOW_Date ? new Date(EOW_Date) : null;

        // --- 6. Perform database update ---
        const result = await prisma.$transaction(async (tx) => {
            const updatedAsset = await tx.asset_information.update({
                where: { AssetID: assetId },
                data: dataToUpdate,
            });

            // If warranty update is needed
            if (
                (needWarrantyApproval === "true" || needWarrantyApproval === true)
            ) {
                const existingWarranty = await tx.asset_warranty.findFirst({
                    where: { AssetID: assetId },
                });

                const warrantyData = {
                    WarrantyApprovalStatus,
                    WarrantyCardDate: WarrantyCardDate ? new Date(WarrantyCardDate) : null,
                    PurchaseDate: PurchaseDate ? new Date(PurchaseDate) : null,
                    POPDocument: popPath,
                    WarrantyCard: warrantyPath,
                    PhotoUnit: photoPath,
                    EndUserName,
                    EndUserPhone,
                    EndUserAddress,
                };
                if (existingWarranty) {
                    await tx.asset_warranty.update({
                        where: { WarrantyID: existingWarranty.WarrantyID },
                        data: warrantyData,
                    });
                } else {
                    await tx.asset_warranty.create({
                        data: {
                            AssetID: assetId,
                            ...warrantyData,
                        },
                    });
                }
            }

            return updatedAsset;
        },{timeout: 50000});
        await deleteByPattern("asset:list:*");
        await redis.del(redisKey(`asset:detail:${assetId}`));

        return NextResponse.json(
            {
                success: true,
                message: "Data Asset Information Updated!",
                data: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update asset",
                error: error.message,
            },
            { status: 500 }
        );
    }
}




//delete data
export async function DELETE(request, { params }) {
    const assetID = parseInt(params.AssetID);

    try {
        const deletedAsset = await prisma.asset_information.delete({
            where: {
                AssetID: assetID,
            },
        });

        await deleteByPattern("asset:list:*");
       await redis.del(redisKey(`asset:detail:${assetID}`));

        return NextResponse.json({
            success: true,
            message: "Data Asset Information deleted",
            data: deletedAsset
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Asset not found or already deleted",
            error: error.message
        }, { status: 404 });
    }
}
