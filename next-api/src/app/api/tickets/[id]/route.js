// app/api/tickets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, TicketStatus } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()


// ─── GET /api/tickets/:id ──────────────────────────────────────────────────
// :id can be the cuid OR the human-readable ticketNumber (TKT-...)
export async function GET(_req, { params }) {
  try {
    const { id } = params

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
      },
      include: {
        contact:     true,
        siteAccount: true,
        history:     { orderBy: { createdAt: "asc" } },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: ticket })
  } catch (err) {
    console.error("[GET /api/tickets/:id]", err)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/tickets/:id ────────────────────────────────────────────────
// Update status or add a note
const UpdateTicketSchema = z.object({
  status:      z.nativeEnum(TicketStatus).optional(),
  note:        z.string().optional(),
  changedBy:   z.string().optional(),
})

export async function PATCH(req, { params }) {
  try {
    const { id }   = params
    const body     = await req.json()
    const parsed   = UpdateTicketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { status, note, changedBy } = parsed.data

    const existing = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { ticketNumber: id }] },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id: existing.id },
        data: {
          ...(status && { status }),
          ...(status === "CLOSED" && { closedAt: new Date() }),
          ...(note && { notes: note }),
        },
        include: {
          contact:     true,
          siteAccount: true,
          history:     { orderBy: { createdAt: "asc" } },
        },
      })

      if (status && status !== existing.status) {
        await tx.ticketHistory.create({
          data: {
            ticketId:  existing.id,
            oldStatus: existing.status,
            newStatus: status,
            note:      note ?? null,
            changedBy: changedBy ?? null,
          },
        })
      }

      return ticket
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error("[PATCH /api/tickets/:id]", err)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
