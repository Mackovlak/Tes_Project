import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

export async function GET(request) {
  try {
    //ambil parameter
    const { searchParams } = new URL(request.url);
    const tower = searchParams.get("ProductTower") || "";
    const group = searchParams.get("ProductGroup") || "";

    
    const whereCondition = {};
    if (tower) whereCondition.ProductTower = { equals: tower };
    if (group) whereCondition.ProductGroup = { equals: group };

    const product_types = await prisma.product_type.findMany({
        where: whereCondition,
        orderBy: { ProductTypeID: "asc" },
      });


    return NextResponse.json(
      {
        success: true,
        message: "List Data Product Type",
        data: product_types
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (err) {
    console.error("🔥 ERROR in GET API:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: err.message,
      },
      { status: 500 }
    );
  }
}


export async function POST(request) {
    //get all request
    const { 
        ProductTower,
        ProductGroup,
        ProductType,
        ProductTypeID
    } = await request.json();

     // ✅ Check if ProductNumber already exists
     const existingProductType = await prisma.product_type.findFirst({
        where: { 
            ProductType: ProductType,
            ProductTower: ProductTower,
            ProductGroup: ProductGroup 
        }
    });

    if (existingProductType) {
        return NextResponse.json({
            success: true,
            message: "Product type already exists. No need to create a new entry.",
            data: existingProductType
        }, { status: 200 });
    }

    //create data 
    const product_type = await prisma.product_type.create({
        data:{
            ProductType: ProductType,
            ProductTower: ProductTower,
            ProductGroup: ProductGroup,

        },
    });

    return NextResponse.json(
        {
            success: true,
            message: "Asset Information Created Successfully!",
            data: product_type,
        },
        { 
            status: 201
        }
    )
}
