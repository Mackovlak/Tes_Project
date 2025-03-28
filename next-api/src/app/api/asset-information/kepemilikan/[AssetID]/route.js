import { NextResponse } from "next/server";

import prisma from "../../../../../../prisma/client";

// update data
export async function PATCH(request, context) {
    try {
        const body = await request.json();
        const { params } = context; // Gunakan context untuk mendapatkan params
        const assetID = parseInt(params.AssetID, 10);
        const { contactID, siteAccountID } = body;

        // Pastikan AssetID adalah angka yang valid
        if (isNaN(assetID)) {
            return NextResponse.json({
                success: false,
                message: "Invalid AssetID!"
            }, { status: 400 });
        }

        // Pastikan ContactID dikirim
        if (!contactID) {
            return NextResponse.json({
                success: false,
                message: "ContactID is required!"
            }, { status: 400 });
        }

        // Cek apakah AssetID ada di database
        const existingAsset = await prisma.asset_information.findUnique({
            where: { AssetID: assetID }
        });

        if (!existingAsset) {
            return NextResponse.json({
                success: false,
                message: "Asset not found!"
            }, { status: 404 });
        }

        // Update hanya kolom ContactID
        const updatedAsset = await prisma.asset_information.update({
            where: { AssetID: assetID },
            data: { ContactID: contactID, SiteAccountID: siteAccountID },
            include: {
                product_information: true,
                
            }
        });

        return NextResponse.json({
            success: true,
            message: "Asset contact successfully updated!",
            data: updatedAsset
        }, { status: 200 });

    } catch (error) {
        console.error("🔥 ERROR in PATCH API (Update Asset Contact):", error);

        return NextResponse.json({
            success: false,
            message: "Failed to update asset contact",
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
