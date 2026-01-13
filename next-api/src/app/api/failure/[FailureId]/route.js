import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

// ========== GET: Ambil failure berdasarkan ID ==========
export async function GET(request, { params }) {
  const { FailureId } = await params;

  if (!FailureId) {
    return NextResponse.json({
      success: false,
      message: "FailureId is required",
    }, { status: 400 });
  }

  try {
    const failure = await prisma.failure.findUnique({
      where: { FailureId: parseInt(FailureId) },
    });

    if (!failure) {
      return NextResponse.json({
        success: false,
        message: "Failure not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: failure,
    });

    console.log(failure);
  } catch (error) {
    console.error("🔥 ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch failure",
      error: error.message,
    }, { status: 500 });
  }
}

// ========== PATCH: Edit failure ==========
export async function PATCH(request, { params }) {
  const { FailureId } = params;
  const { Name, Description } = await request.json();

  if (!FailureId || !Name) {
    return NextResponse.json({
      success: false,
      message: "FailureId and Name are required",
    }, { status: 400 });
  }

  try {
    const updatedFailure = await prisma.failure.update({
      where: { FailureId: parseInt(FailureId) },
      data: { Name, Description },
    });

    return NextResponse.json({
      success: true,
      message: "Failure updated successfully",
      data: updatedFailure,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update failure",
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { FailureId } = params;

  try {
    const deletedFailure = await prisma.failure.delete({
      where: { FailureId: parseInt(FailureId) },
    });

    return NextResponse.json({
      success: true,
      message: "Failure deleted successfully",
      data: deletedFailure,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failure not found or already deleted",
      error: error.message,
    }, { status: 404 });
  }
}
