import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

// GET - Fetch Contact Information by ID
export async function GET(request, { params }) {
    try {
        const contactId = parseInt(params.contactId); // Perbaiki format parameter
        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, message: "Invalid Contact ID", data: null },
                { status: 400 }
            );
        }

        const contact_information = await prisma.contact_information.findUnique({
            where: { ContactID: contactId },
        });

        if (!contact_information) {
            return NextResponse.json(
                { success: false, message: "Detail Data Contact Not Found!", data: null },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Detail Data Contact", data: contact_information },
            { status: 200 }
        );
    } catch (error) {
        console.error("🔥 ERROR in GET:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH - Update Contact Information
export async function PATCH(request, { params }) {
    try {
        const contactId = parseInt(params.contactId);
        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, message: "Invalid Contact ID" },
                { status: 400 }
            );
        }

        const existingContact = await prisma.contact_information.findUnique({
            where: { ContactID: contactId },
        });

        if (!existingContact) {
            return NextResponse.json(
                { success: false, message: "Contact not found!" },
                { status: 404 }
            );
        }

        const data = await request.json();

        const updatedContact = await prisma.contact_information.update({
            where: { ContactID: contactId },
            data,
        });

        return NextResponse.json(
            { success: true, message: "Data Contact Information Updated!", data: updatedContact },
            { status: 200 }
        );
    } catch (error) {
        console.error("🔥 ERROR in PATCH:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Remove Contact Information
export async function DELETE(request, { params }) {
    try {
        const contactId = parseInt(params.contactId);
        if (isNaN(contactId)) {
            return NextResponse.json(
                { success: false, message: "Invalid Contact ID" },
                { status: 400 }
            );
        }

        const existingContact = await prisma.contact_information.findUnique({
            where: { ContactID: contactId },
        });

        if (!existingContact) {
            return NextResponse.json(
                { success: false, message: "Contact not found!" },
                { status: 404 }
            );
        }

        await prisma.contact_information.delete({
            where: { ContactID: contactId },
        });

        return NextResponse.json(
            { success: true, message: "Data Contact Information Deleted" },
            { status: 200 }
        );
    } catch (error) {
        console.error("🔥 ERROR in DELETE:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
