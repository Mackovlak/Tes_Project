import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";

export async function GET(request, { params }) {
  try {
    const { BookingId } = await params;
    const bookingId = parseInt(BookingId); // Perbaiki format parameter

    if (!bookingId) {
      return NextResponse.json(
        { error: 'BookingId wajib diisi.' },
        { status: 400 }
      )
    }

    const booking = await prisma.bookings.findUnique({
      where: { BookingId: bookingId },
      include: {
        workorder: {
          include: {
            caseinformation: true,
          },
        }, // Relasi ke tabel workorder
        bookingDetails: {
          orderBy: { ChangedAt: 'desc' }, // Urutkan ChangedAt terbaru
          take: 1, // Ambil hanya 1 record
          include: {
            resourceaccount: true,
            resource: true,
            subkTechnician: true,
            engineer: true,
          }
        },
        BookingStatus: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking tidak ditemukan.' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking, { status: 200 })

  } catch (error) {
    console.error('[BOOKING_FETCH_ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data booking.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { BookingId } = params;
    const bookingId = parseInt(BookingId);

    if (!bookingId) {
      return NextResponse.json(
        { error: 'BookingId wajib diisi.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      BookingStatusId,
      ChangedBy,
      DoNotDisturb,
      CeScheduleChange,
      ScheduleJeopardy,
      ScheduleJeopardyTime,
      TotalBillableDurationInMinutes,
      TotalInProgressDurationInMinutes,
      TotalBreakDurationInMinutes,
      bookingDetailsData,
      bookingDetails2Data
    } = body;

    const changedBy = parseInt(ChangedBy);
    const resourceId = bookingDetailsData?.ResourceId ?? "default-id";
    const accountId = bookingDetailsData?.ResourceAccountId ?? "default-id";
    const subkTechnicianId = bookingDetailsData?.SubkTechnicianId ?? null;

    if (!changedBy || !bookingDetailsData) {
      return NextResponse.json(
        { error: 'ChangedBy dan bookingDetailsData wajib diisi.' },
        { status: 400 }
      );
    }

    const existingResource = await prisma.resource.findUnique({
      where: { ResourceId: resourceId.toString() }
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: `ResourceId ${resourceId} not found.` },
        { status: 400 }
      );
    }

    const isValidDate = (val) => {
      const d = new Date(val);
      return val && !isNaN(d.getTime()) ? d : null;
    };

    const result = await prisma.$transaction(async (tx) => {
      // Ambil booking untuk dapatkan WOID
      const existingBooking = await tx.bookings.findUnique({
        where: { BookingId: bookingId },
        select: { WOID: true }
      });

      if (!existingBooking) {
        throw new Error(`Booking dengan ID ${bookingId} tidak ditemukan.`);
      }

      const updatedBooking = await tx.bookings.update({
        where: { BookingId: bookingId },
        data: {
          BookingStatusId : BookingStatusId,
          DoNotDisturb,
          CeScheduleChange,
          ScheduleJeopardy,
          ScheduleJeopardyTime,
          TotalBillableDurationInMinutes,
          TotalInProgressDurationInMinutes,
          TotalBreakDurationInMinutes,
        },
      });

      const existingDetail = await tx.bookingDetails.findFirst({
        where: { BookingId: bookingId },
        orderBy: { ChangedAt: 'desc' },
      });

      if (!existingDetail) {
        throw new Error('No bookingDetails found to update.');
      }

      const dataToUpdate = {
        ChangedBy: changedBy,
        Name: "",
          Status: BookingStatusId
    ? { connect: { BookingStatusId: BookingStatusId } }
    : { disconnect: true },
        StartTimeCustomerTime: isValidDate(bookingDetailsData.StartTimeCustomerTime),
        EndTimeCustomerTime: isValidDate(bookingDetailsData.EndTimeCustomerTime),
        EstimatedArrivalTimeCustomerTime: isValidDate(bookingDetailsData.EstimatedArrivalTimeCustomerTime),
        ActualArrivalTimeCustomerTime: isValidDate(bookingDetailsData.ActualArrivalTimeCustomerTime),
        StartTimeUserTime: isValidDate(bookingDetailsData.StartTimeUserTime),
        EndTimeUserTime: isValidDate(bookingDetailsData.EndTimeUserTime),
        EstimatedArrivalTimeUserTime: isValidDate(bookingDetailsData.EstimatedArrivalTimeUserTime),
        ActualArrivalTimeUserTime: isValidDate(bookingDetailsData.ActualArrivalTimeUserTime),
        DurationInMinutesUserTime: parseInt(bookingDetailsData.DurationInMinutesUserTime),
        resource: { connect: { ResourceId: resourceId.toString() } },
        resourceaccount: { connect: { ResourceAccountId: accountId.toString() } },
        booking: { connect: { BookingId: bookingId } },
      };

      if (subkTechnicianId) {
        dataToUpdate.subkTechnician = {
          connect: { SubkTechnicianId: subkTechnicianId.toString() },
        };
      }

      const updatedBookingDetail = await tx.bookingDetails.update({
        where: { BookingDetailId: existingDetail.BookingDetailId },
        data: dataToUpdate,
      });

      // Jika BookingStatus = Completed, update SystemStatus menjadi OPEN_COMPLETED
      if (BookingStatusId === 2) {
        await tx.workorder.update({
          where: { WOID: existingBooking.WOID },
          data: { SystemStatus: 'OPEN_COMPLETED' },
        });
      }

      return NextResponse.json(
        {
          message: 'Booking dan BookingDetails berhasil diperbarui.',
          data: { updatedBooking, updatedBookingDetail },
        },
        { status: 200 }
      );
    }, {
      timeout: 50000,
    });

    return result;

  } catch (error) {
    console.error('[BOOKING_PATCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui booking.' },
      { status: 500 }
    );
  }
}


// export async function PATCH(request, { params }) {
//   try {
//     const { BookingId } = params;
//     const bookingId = parseInt(BookingId);

//     if (!bookingId) {
//       return NextResponse.json(
//         { error: 'BookingId wajib diisi.' },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const {
//       BookingStatus,
//       ChangedBy,
//       DoNotDisturb,
//       CeScheduleChange,
//       ScheduleJeopardy,
//       ScheduleJeopardyTime,
//       TotalBillableDurationInMinutes,
//       TotalInProgressDurationInMinutes,
//       TotalBreakDurationInMinutes,
//       bookingDetailsData,
//       bookingDetails2Data
//     } = body;

//     const changedBy = parseInt(ChangedBy);
//     const resourceId = bookingDetailsData?.ResourceId ?? "default-id";
//     const accountId = bookingDetailsData?.ResourceAccountId ?? "default-id";
//     const subkTechnicianId = bookingDetailsData?.SubkTechnicianId ?? null;

//     if (!changedBy || !bookingDetailsData) {
//       return NextResponse.json(
//         { error: 'ChangedBy dan bookingDetailsData wajib diisi.' },
//         { status: 400 }
//       );
//     }

//     const existingResource = await prisma.resource.findUnique({
//       where: { ResourceId: resourceId.toString() }
//     });

//     if (!existingResource) {
//       return NextResponse.json(
//         { error: `ResourceId ${resourceId} not found.` },
//         { status: 400 }
//       );
//     }

//     const isValidDate = (val) => {
//       const d = new Date(val);
//       return val && !isNaN(d.getTime()) ? d : null;
//     };

//     const result = await prisma.$transaction(async (tx) => {
//       const updatedBooking = await tx.bookings.update({
//         where: { BookingId: bookingId },
//         data: {
//           BookingStatus,
//           DoNotDisturb,
//           CeScheduleChange,
//           ScheduleJeopardy,
//           ScheduleJeopardyTime,
//           TotalBillableDurationInMinutes,
//           TotalInProgressDurationInMinutes,
//           TotalBreakDurationInMinutes,
//         },
//       });

//       const existingDetail = await tx.bookingDetails.findFirst({
//         where: { BookingId: bookingId },
//         orderBy: { ChangedAt: 'desc' },
//       });

//       if (!existingDetail) {
//         throw new Error('No bookingDetails found to update.');
//       }

//       const dataToUpdate = {
//         ChangedBy: changedBy,
//         Name: "",
//         Status: BookingStatus,
//         StartTimeCustomerTime: isValidDate(bookingDetailsData.StartTimeCustomerTime),
//         EndTimeCustomerTime: isValidDate(bookingDetailsData.EndTimeCustomerTime),
//         EstimatedArrivalTimeCustomerTime: isValidDate(bookingDetailsData.EstimatedArrivalTimeCustomerTime),
//         ActualArrivalTimeCustomerTime: isValidDate(bookingDetailsData.ActualArrivalTimeCustomerTime),
//         StartTimeUserTime: isValidDate(bookingDetailsData.StartTimeUserTime),
//         EndTimeUserTime: isValidDate(bookingDetailsData.EndTimeUserTime),
//         EstimatedArrivalTimeUserTime: isValidDate(bookingDetailsData.EstimatedArrivalTimeUserTime),
//         ActualArrivalTimeUserTime: isValidDate(bookingDetailsData.ActualArrivalTimeUserTime),
//         DurationInMinutesUserTime: parseInt(bookingDetailsData.DurationInMinutesUserTime),
//         resource: { connect: { ResourceId: resourceId.toString() } },
//         resourceaccount: { connect: { ResourceAccountId: accountId.toString() } },
//         booking: { connect: { BookingId: bookingId } },
//       };

//       if (subkTechnicianId) {
//         dataToUpdate.subkTechnician = {
//           connect: { SubkTechnicianId: subkTechnicianId.toString() },
//         };
//       }

//       const updatedBookingDetail = await tx.bookingDetails.update({
//         where: { BookingDetailId: existingDetail.BookingDetailId },
//         data: dataToUpdate,
//       });

//       return NextResponse.json(
//         {
//           message: 'Booking dan BookingDetails berhasil diperbarui.',
//           data: { updatedBooking, updatedBookingDetail },
//         },
//         { status: 200 }
//       );
//     }, {
//       timeout: 50000,
//     });

//     return result;

//   } catch (error) {
//     console.error('[BOOKING_PATCH_ERROR]', error);
//     return NextResponse.json(
//       { error: 'Terjadi kesalahan saat memperbarui booking.' },
//       { status: 500 }
//     );
//   }
// }

