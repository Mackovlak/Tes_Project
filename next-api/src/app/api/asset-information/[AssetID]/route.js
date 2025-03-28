import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";

export async function GET(request, { params }) {
    const assetID = parseInt(params.AssetID);

    if (isNaN(assetID)) {
        return NextResponse.json({
            success: false,
            message: "Invalid Asset ID"
        }, { status: 400 });
    }

    const asset_information = await prisma.asset_information.findUnique({
        where: { AssetID: assetID },
        include: {
            site_account: true,
            contact_information: true,
            product_information:true,
        }
    });

    if (!asset_information) {
        return NextResponse.json({
            success: false,
            message: "Detail Data Asset Information Not Found!",
            data: null
        }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: "Detail Data Asset Information",
        data: asset_information
    }, { status: 200 });
}


// update data
/**
 * TODO 
 * MAKE UPDATE ASSET AND CREATE PRODUCT SEPARATELY
 */
export async function PATCH(request, { params }) {
    const assetID = parseInt(params.AssetID);

    try {
        const body = await request.json();
        const { SerialNumber, ProductName, ProductNumber, ProductLine, SiteAccountID, ContactID } = body;

        // Validasi input tidak boleh kosong
        if (!SerialNumber || !ProductName || !ProductNumber || !ProductLine) {
            return NextResponse.json({
                success: false,
                message: "All fields are required!"
            }, { status: 400 });
        }

        // Cek apakah AssetID ada
        const existingAsset = await prisma.asset_information.findUnique({
            where: { AssetID: assetID }
        });

        if (!existingAsset) {
            return NextResponse.json({
                success: false,
                message: "Asset not found!"
            }, { status: 404 });
        }

        // Update data
        const updatedAsset = await prisma.asset_information.update({
            where: { AssetID: assetID },
            data: {
                SerialNumber,
                ProductNumber,
                SiteAccountID,
                ContactID
            }
        });

        return NextResponse.json({
            success: true,
            message: "Data Asset Information Updated!",
            data: updatedAsset
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to update asset",
            error: error.message
        }, { status: 500 });
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
