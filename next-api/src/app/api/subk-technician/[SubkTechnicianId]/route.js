import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

// GET: Fetch single SubkTechnician by ID
export async function GET(request, { params }) {
  const { SubkTechnicianId } = params;

  try {
    const subkTechnician = await prisma.subkTechnician.findUnique({
      where: { SubkTechnicianId },
      include: {
        resourceAccount: true
      }
    });

    if (!subkTechnician) {
      return NextResponse.json({
        success: false,
        message: "SubkTechnician not found",
        data: null,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "SubkTechnician details retrieved successfully",
      data: subkTechnician,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch SubkTechnician",
      error: error.message,
    }, { status: 500 });
  }
}

// PATCH: Update SubkTechnician
export async function PATCH(request, { params }) {
  const { SubkTechnicianId } = params;

  try {
    const body = await request.json();
    const {SubkId ,Name, ResourceAccountId } = body;

    if (!Name) {
      return NextResponse.json({
        success: false,
        message: "Name is required",
      }, { status: 400 });
    }

    const updatedSubkTechnician = await prisma.subkTechnician.update({
      where: { SubkTechnicianId },
      data: {
        SubkTechnicianId: SubkId,
        Name,
        ResourceAccountId: ResourceAccountId || null, // optional
      },
    });

    return NextResponse.json({
      success: true,
      message: "SubkTechnician updated successfully",
      data: updatedSubkTechnician,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to update SubkTechnician",
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE: Delete SubkTechnician
export async function DELETE(request, { params }) {
  const { SubkTechnicianId } = params;

  try {
    const deletedSubkTechnician = await prisma.subkTechnician.delete({
      where: { SubkTechnicianId },
    });

    return NextResponse.json({
      success: true,
      message: "SubkTechnician deleted successfully",
      data: deletedSubkTechnician,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to delete SubkTechnician. It may not exist.",
      error: error.message,
    }, { status: 404 });
  }
}
