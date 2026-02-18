import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
  try {
    // Ambil parameter pencarian & pagination dari URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("keyword") || "";  // Ambil kata kunci pencarian
    const page = parseInt(searchParams.get("page")) || 1;  // Halaman saat ini
    const limit = parseInt(searchParams.get("limit")) || 1000;  // Batas data per halaman

    const skip = (page - 1) * limit;

    const where = search
      ? {
        OR: [
          { ResourceId: { contains: search } },
          { Name: { contains: search } },
          { ServiceCenterName: { contains: search } },
          { City: { contains: search } },
          { StateProvince: { contains: search } },
          { Country: { contains: search } },
          { Phone: { contains: search } },
          { Mobile: { contains: search } },
          { Email: { contains: search } },
          ], 
        }
      : undefined;
    // Hitung jumlah total data yang cocok dengan pencarian
    const totalCount = await prisma.resource.count({ where });

    // Ambil data Resources dengan filter dan pagination
    const resources = await prisma.resource.findMany({
      where,
      skip,
      take: limit,
      orderBy: { ResourceId: 'asc',
      },
      include: {
        resourceAccounts: true,
        bookingDetails: true,
        users: true,
      },
    });

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const currentPage = page;
    return NextResponse.json({
      success: true,
      message: 'List Data Resources',
      data: resources,
      meta: {
        totalCount,
        totalPages,
        currentPage,
        pageSize: limit,
      },

    });
  } catch (error) {
    console.error('🔥 ERROR in GET API:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch data',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
    try {
        const body = await req.json();

    const { ResourceId, Name, ServiceCenterName, ResourceCode, ResourceLogo, Phone, Mobile, Fax, Email, City, StateProvince, Country, ZipPostalCode, AddressLine, } = body;

    if (!ResourceId || !Name) {
      return NextResponse.json(
        {
          success: false,
          message: "ResourceId and Name are required fields.",
        },
        { status: 400 }
      );
    }

    const newResource = await prisma.resource.create({
      data: {
        ResourceId,
        Name,
        ServiceCenterName,
        ResourceCode,
        ResourceLogo,
        Phone,
        Mobile,
        Fax,
        Email,
        City,
        StateProvince,
        Country,
        ZipPostalCode,
        AddressLine,
      },
    });

    return NextResponse.json({ success: true, message: "Resource created successfully", data: newResource });
  } catch (error) {
    console.error("🔥 ERROR in POST API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create resource",
        error: error.message,
      },
      { status: 500 }
    );
  }
}