import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

// ✅ GET data berdasarkan id_csr
export async function GET(request) {
    try{
        // Ambil parameter pencarian & pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        console.log("Query Params:", { search, page, limit });

        let whereCondition = {}
        
          if (search) {
            whereCondition.AND = [
                whereCondition, // Keep SiteAccountID & ContactID constraints
                {
                    OR: [
                        { caseResolutionCode: { contains: search } },
                    ]
                }
            ];
        }

        console.log("Final WHERE Condition:", JSON.stringify(whereCondition));

        // Hitung jumlah data total
        const totalCount = await prisma.caseresolution.count({
            where: whereCondition
        });

        console.log("Total Data:", totalCount);

        // Hitung offset berdasarkan halaman
        const skip = (page - 1) * limit;

        // Ambil data dengan filter & pagination
        const CsrData = await prisma.caseresolution.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: { caseResolutionCode: "asc" }
        });

        return NextResponse.json({
            success: true,
            message: "List Data OTC CODE",
            data: CsrData,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        },
    {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Allow all origins
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
    } catch (error) {
        console.error("🔥 ERROR in GET API:", error);

        return NextResponse.json({
            success: false,
            message: "Failed to fetch data",
            error: error.message
        }, { status: 500 });
    }
}

// ✅ POST untuk membuat data baru
export async function POST(request) {
  try {
    // Mendapatkan data dari request body
    const {
      caseResolutionCode,
      autoClose,
      caseReadyForClosure,
      readyForCloseDays,
      readyForClosureDate,
      pendingCustomerAction,
      customerRequestedCloseDate,
    } = await request.json();

    // Validasi input
    // if (!caseResolutionCode || !autoClose || !caseReadyForClosure) {
    //   return NextResponse.json(
    //     { success: false, message: "Semua field wajib diisi." },
    //     { status: 400 }
    //   );
    // }

    // Menyimpan data baru ke database
    const newCaseResolution = await prisma.caseresolution.create({
      data: {
        caseResolutionCode,
        autoClose,
        caseReadyForClosure,
        readyForCloseDays: parseInt(readyForCloseDays),
        readyForClosureDate: readyForClosureDate ? new Date(readyForClosureDate) : null,
        pendingCustomerAction: pendingCustomerAction ? new Date(pendingCustomerAction) : null,
        customerRequestedCloseDate: customerRequestedCloseDate ? new Date(customerRequestedCloseDate) : null,
      },
    });

    // Mengembalikan respons sukses setelah data berhasil dibuat
    return NextResponse.json({
      success: true,
      status: 201,
      message: "Data berhasil dibuat.",
      data: newCaseResolution,
    });
  } catch (e) {
    console.error("🔥 ERROR in POST API:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat data.",
        error: e.message,
      },
      { status: 500 }
    );
  }
}


export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const csrId = searchParams.get("id_csr");

    if (!csrId) {
      return NextResponse.json(
        { success: false, message: "Parameter 'id_csr' diperlukan." },
        { status: 400 }
      );
    }

    const {
      caseResolutionCode,
      autoClose,
      caseReadyForClosure,
      readyForCloseDays,
      readyForClosureDate,
      pendingCustomerAction,
      customerRequestedCloseDate,
    } = await request.json();

    const updated = await prisma.caseresolution.update({
      where: { id_csr: csrId },
      data: {
        caseResolutionCode,
        autoClose,
        caseReadyForClosure,
        readyForCloseDays: parseInt(readyForCloseDays),
        readyForClosureDate: readyForClosureDate ? new Date(readyForClosureDate) : null,
        pendingCustomerAction: pendingCustomerAction ? new Date(pendingCustomerAction) : null,
        customerRequestedCloseDate: customerRequestedCloseDate ? new Date(customerRequestedCloseDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Data berhasil diperbarui.",
      data: updated,
    });
  } catch (e) {
    console.error("🔥 ERROR in PATCH API:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengupdate data",
        error: e.message,
      },
      { status: 500 }
    );
  }
}
