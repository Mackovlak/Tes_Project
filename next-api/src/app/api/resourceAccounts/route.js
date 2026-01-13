import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(request) {
  try {
    // Ambil parameter pencarian & pagination dari URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || ""; // Ambil kata kunci pencarian
    
    const resourceId = searchParams.get('resourceId');
    
    const page = parseInt(searchParams.get("page")) || 1; // Halaman saat ini
    const limit = parseInt(searchParams.get("limit")) || 10; // Batas data per halaman

    console.log("Query Params:", { search, page, limit });
    
  if (!resourceId) {
    return NextResponse.json({ error: 'Missing resourceId' }, { status: 400 });
  }

  

    // Hitung jumlah total data yang cocok dengan pencarian
    // const totalCount = await prisma.resourceAccount.count({
    //   where: {
    //     ResourceId: resourceId, // your where condition
    //   },
    // });
    

    // console.log("Total Data:",/ totalCount);

    // Hitung offset berdasarkan halaman
    // const skip = (page - 1) * limit;

    // Ambil data Accounts dengan filter dan pagination
    const accounts = await prisma.resourceAccount.findFirst({
      where: { ResourceId: resourceId },
      include: { resource: true }, // ✅ only include here, NO select!
    });

    return NextResponse.json({
      success: true,
      message: "List Data Subk Technician",
      data: accounts,
    });
  } catch (error) {
    console.error("🔥 ERROR in GET API:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
