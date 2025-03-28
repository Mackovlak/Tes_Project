import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

export async function GET(request) {
    const {searchParams } = new URL(request.url);
    const contactID = parseInt(searchParams.get("contactID"),10);

    if(!contactID) return NextResponse.json({ success: false, message: "Contact ID required" }, { status: 400 });

    try{
        // Get the contact and its affiliated company (if any)
        const contact = await prisma.contact_information.findUnique({
            where: { ContactID: contactID },
            include: {
                site_account: true // Fetch the related company
            }
        });

        if (!contact) {
            return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
        }

        const assets = await prisma.asset_information.findMany({
            where: { ContactID: contactID },
            include: {product_information: true }
        })

        return NextResponse.json({
            success: true,
            message: "Contact affiliation check completed",
            data: {
                company : contact.site_account || [],
                assets,
                contacts : []
            }
        })
    }catch(err){
        console.error("Error checking contacts affiliations:", err);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}