import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

// ✅ GET data berdasarkan id_csr
export async function GET(request, { params }) {
  try {
    // const { searchParams } = new URL(request.url);
    // const csrId = searchParams.get("id_csr");
    const { id_csr } = await params;
    const csrId = id_csr
    // console.log("csrId", csrId);
    if (!csrId) {
      return NextResponse.json(
        { success: false, message: "Parameter 'id_csr' tidak ditemukan." },
        { status: 400 }
      );
    }

    const csrInfo = await prisma.caseresolution.findUnique({
      where: {
        id_csr: parseInt(csrId),
      },
    });

    return NextResponse.json({
      success: true,
      status: 200,
      message: "List Data Global Trade Check",
      data: csrInfo,
    });
  } catch (e) {
    console.error("🔥 ERROR in GET API:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: e.message,
      },
      { status: 500 }
    );
  }
}

// ✅ PATCH untuk update data berdasarkan id_csr
export async function PATCH(request, { params }) {
  try {
   const { id_csr } = await params;
    const csrId = id_csr

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
      where: { id_csr: parseInt(csrId) },
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

export async function DELETE(request, { params }) {
  const caseResolutionId = parseInt(params.id_csr);

  try {
    const deleted = await prisma.caseresolution.delete({
      where: { id_csr: caseResolutionId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Case resolution berhasil di Hapus",
        data: deleted,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal Menghapus Data.",
        error: error.message,
      },
      { status: 404 }
    );
  }
}