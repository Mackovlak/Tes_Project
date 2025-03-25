import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

export async function GET(request, { params }) {
    try {
        const siteAccountID = parseInt(params.SiteAccountID);

        console.log("Site Account ID Defined : ", siteAccountID)
        if (isNaN(siteAccountID)) {
            return NextResponse.json(
                { success: false, message: "Invalid SiteAccountID" },
                { status: 400 }
            );
        }
        
        const site_account = await prisma.site_account.findUnique({
            where: { SiteAccountID: siteAccountID },
        });
        console.log("Site Account GET : ", site_account)

        if (!site_account) {
            return NextResponse.json(
                { success: false, message: "Site Account not found!", data: null },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Detail Data Site Account", data: site_account },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// UPDATE DATA
export async function PATCH(request, { params }) {
    try {
        const siteAccountID = parseInt(params.SiteAccountID);
        if (isNaN(siteAccountID)) {
            return NextResponse.json(
                { success: false, message: "Invalid SiteAccountID" },
                { status: 400 }
            );
        }

        const {
            Company,
            Email,
            PrimaryPhone,
            AddressLine1,
            AddressLine2,
            City,
            StateProvince,
            Country,
            ZipPostalCode,
        } = await request.json();

        // Validasi: Minimal harus ada satu field yang diisi
        if (!Company && !Email && !PrimaryPhone && !AddressLine1 && !City && !Country && !ZipPostalCode) {
            return NextResponse.json(
                { success: false, message: "At least one field must be updated!" },
                { status: 400 }
            );
        }

        const site_account = await prisma.site_account.update({
            where: { SiteAccountID: siteAccountID },
            data: {
                Company,
                Email,
                PrimaryPhone,
                AddressLine1,
                AddressLine2,
                City,
                StateProvince,
                Country,
                ZipPostalCode,
            },
        });

        return NextResponse.json(
            { success: true, message: "Data Site Account Updated!", data: site_account },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error updating site account", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE DATA
export async function DELETE( request) {
    try {
        // ✅ Extract SiteAccountID from URL
        const url = new URL(request.url);
        const siteAccountID = parseInt(url.pathname.split("/").pop(), 10); // Get last part of URL

        if (isNaN(siteAccountID)) {
            return NextResponse.json(
                { success: false, message: "Invalid SiteAccountID" },
                { status: 400 }
            );
        }
        
        // ✅ Check if related contacts exist
        const contactCount = await prisma.contact_information.count({
            where: { SiteAccountID: siteAccountID },
        });

        // ✅ Check if related assets exist
        const assetCount = await prisma.asset_information.count({
            where: { SiteAccountID: siteAccountID },
        });

        if (contactCount > 0 || assetCount > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Cannot delete! This company has related Contacts or Assets.",
                    contacts: contactCount,
                    assets: assetCount,
                },
                { status: 409 } // 409 Conflict status
            );
        }

        // ✅ If no related records, proceed with deletion
        await prisma.site_account.delete({
            where: { SiteAccountID: siteAccountID },
        });

        return NextResponse.json(
            { success: true, message: "Site Account successfully deleted!" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error deleting site account", error: error.message },
            { status: 500 }
        );
    }
}
