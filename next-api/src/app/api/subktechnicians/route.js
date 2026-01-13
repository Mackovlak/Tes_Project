import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
  try {
    // Ambil parameter pencarian & pagination dari URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';  // Ambil kata kunci pencarian
    const page = parseInt(searchParams.get('page')) || 1;  // Halaman saat ini
    const limit = parseInt(searchParams.get('limit')) || 10;  // Batas data per halaman

    console.log('Query Params:', { search, page, limit });

    // Hitung jumlah total data yang cocok dengan pencarian
    const totalCount = await prisma.subkTechnician.count({
      where: search
        ? {
            Name: { contains: search, mode: 'insensitive' }  // Sesuaikan dengan field nama pada tabel SubkTechnician
          }
        : undefined
    });

    console.log('Total Data:', totalCount);

    // Hitung offset berdasarkan halaman
    const skip = (page - 1) * limit;

    // Ambil data SubkTechnicians dengan filter dan pagination
    const subkTechnicians = await prisma.subkTechnician.findMany({
      where: search
        ? {
            Name: { contains: search, mode: 'insensitive' }  // Sesuaikan dengan field nama pada tabel SubkTechnician
          }
        : undefined,
      skip: skip,
      take: limit,
      orderBy: { Name: 'asc' }  // Sorting berdasarkan nama
    });

    return NextResponse.json({
      success: true,
      message: 'List Data Subk Technician',
      data: subkTechnicians,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
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
