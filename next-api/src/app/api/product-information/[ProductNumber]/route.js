import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";

export async function GET(request, { params }) {
    const productNumber = await params.ProductNumber;

    if (isNaN(productNumber)) {
        return NextResponse.json({
            success: false,
            message: "Invalid Product Number"
        }, { status: 400 });
    }

    const product_information = await prisma.product_information.findUnique({
        where: { ProductNumber: productNumber },
    });

    if (!product_information) {
        return NextResponse.json({
            success: false,
            message: "Detail Data Product Information Not Found!",
            data: null
        }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: "Detail Data Product Information",
        data: product_information
    }, { status: 200 });
}


// update data
export async function PATCH(request, { params }) {
    const productNumber = await params.ProductNumber;

    try {
        const body = await request.json();
        const {  ProductLine, ProductName } = body;

        // Validasi input tidak boleh kosong
        if (!ProductName || !ProductLine) {
            return NextResponse.json({
                success: false,
                message: "All fields are required!"
            }, { status: 400 });
        }

        // Cek apakah AssetID ada
        const existingProductInformation = await prisma.product_information.findUnique({
            where: { ProductNumber: productNumber }
        });

        if (!existingProductInformation) {
            return NextResponse.json({
                success: false,
                message: "Product Information not found!"
            }, { status: 404 });
        }

        // Update data
        const updatedProductInformation = await prisma.product_information.update({
            where: { ProductNumber: productNumber },
            data: {
                ProductName,
                ProductLine
            }
        });

        return NextResponse.json({
            success: true,
            message: "Data pRODUCT Information Updated!",
            data: updatedProductInformation
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
    const productNumber = await params.ProductNumber;

    try {
        const deletedProductInformation = await prisma.product_information.delete({
            where: {
                ProductNumber: productNumber,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Data Asset Information deleted",
            data: deletedProductInformation
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Asset not found or already deleted",
            error: error.message
        }, { status: 404 });
    }
}
