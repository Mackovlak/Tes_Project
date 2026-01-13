import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
  try {
    // Ambil parameter pencarian & pagination dari URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('keyword') || '';  // Ambil kata kunci pencarian
    const page = parseInt(searchParams.get('page')) || 1;  // Halaman saat ini
    const limit = parseInt(searchParams.get('limit')) || 10;  // Batas data per halaman

    console.log('Query Params:', { search, page, limit });

    // Hitung jumlah total data yang cocok dengan pencarian
    const totalCount = await prisma.failure.count({
      where: search
        ? {
            Name: { contains: search }  // Sesuaikan dengan field nama pada tabel Failure
          }
        : undefined
    });

    console.log('Total Data:', totalCount);

    // Hitung offset berdasarkan halaman
    const skip = (page - 1) * limit;

    // Ambil data Failures dengan filter dan pagination
    const failures = await prisma.failure.findMany({
      where: search
        ? {
            Name: { contains: search }  // Sesuaikan dengan field nama pada tabel Failure
          }
        : undefined,
      // skip: skip,
      // take: limit,
      orderBy: { Name: 'asc' }  // Sorting berdasarkan nama
    });

    return NextResponse.json({
      success: true,
      message: 'List Data Subk Technician',
      data: failures,
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

export async function POST(req) {
  const body = await req.json();
  const { FailureId, Name, Description } = body;

  if (!Name) {
    return NextResponse.json({
      success: false,
      error: 'FailureId and Name are required.'
    }, { status: 400 });
  }

  try {
    const Failures = await prisma.failure.create({
      data: {
        FailureId,
        Name,
        Description
      },
    });

    return NextResponse.json({ success: true, data: Failures });
  } catch (error) {
    console.error("Failure creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


