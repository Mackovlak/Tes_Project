// app/api/tickets/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "../../../../prisma/client"
// ─── 1. ZOD SCHEMAS (Matches your React Frontend EXACTLY) ──────────────
const ContactSchema = z.object({
  ContactID:     z.number().optional(), // From frontend
  Salutation:    z.string().optional(),
  FirstName:     z.string().optional(),
  LastName:      z.string().optional(),
  Email:         z.string().optional(),
  Phone:         z.string().optional(),
  Mobile:        z.string().optional(),
  AddressLine1:  z.string().optional(),
  City:          z.string().optional(),
  StateProvince: z.string().optional(),
  Country:       z.string().optional(),
  ZipPostalCode: z.string().optional(),
})

const CompanySchema = z.object({
  SiteAccountID: z.number().optional(),
  Company:       z.string().optional(),
  NPWP:          z.string().optional(),
})

const ProductSchema = z.object({
  SerialNumber:       z.string().min(1),
  ProductNumber:      z.string().optional(),
  ProblemDescription: z.string().min(1),
})

const CreateTicketSchema = z.object({
  contact:    ContactSchema,
  company:    CompanySchema.optional(),
  product:    ProductSchema,
  ticketType: z.string(),
  caseId:     z.string().optional(),
  bookingNo:  z.string().optional(),
})

// ─── 2. HELPER FUNCTION ────────────────────────────────────────────────
async function generateTicketNumber() {
  const today = new Date()
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "")
  const count = await prisma.ticket.count({
    where: { CreatedAt: { gte: new Date(today.setHours(0,0,0,0)) } }
  })
  return `TKT-${datePart}-${String(count + 1).padStart(4, "0")}`
}

// ─── 3. POST HANDLER ───────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json()
    const parsed = CreateTicketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { contact, company, product, ticketType, caseId, bookingNo } = parsed.data

    // START PRISMA TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      
      let finalSiteAccountId = company?.SiteAccountID || null;
      let finalContactId = contact.ContactID || null;

      // A. Create Company if new
      if (!finalSiteAccountId && company?.Company) {
        const newCompany = await tx.site_account.create({
          data: {
            Company: company.Company,
            NPWP: company.NPWP || null,
          }
        })
        finalSiteAccountId = newCompany.SiteAccountID
      }

      // B. Create Contact if new
      if (!finalContactId && contact.FirstName) {
        const newContact = await tx.contact_information.create({
          data: {
            SiteAccountID: finalSiteAccountId,
            Salutation:    contact.Salutation,
            FirstName:     contact.FirstName,
            LastName:      contact.LastName || "",
            Email:         contact.Email,
            Phone:         contact.Phone,
            Mobile:        contact.Mobile,
            AddressLine1:  contact.AddressLine1,
            City:          contact.City,
            StateProvince: contact.StateProvince,
            Country:       contact.Country,
            ZipPostalCode: contact.ZipPostalCode,
          }
        })
        finalContactId = newContact.ContactID
      }

      // C. Determine Reference Number
      const referenceNumber = ticketType === "PengambilanBarang" ? caseId 
                            : ticketType === "OnlineBooking" ? bookingNo 
                            : null;

      // D. Create the Ticket
      const ticketNumber = await generateTicketNumber()
      const newTicket = await tx.ticket.create({
        data: {
          TicketNumber:    ticketNumber,
          ContactID:       finalContactId,
          SiteAccountID:   finalSiteAccountId,
          Type:            ticketType,
          Status:          "OPEN",
          Subject:         `${ticketType} - ${product.SerialNumber}`, // Auto-generate subject
          Description:     product.ProblemDescription,
          SerialNumber:    product.SerialNumber,
          ProductNumber:   product.ProductNumber,
          ReferenceNumber: referenceNumber,
        },
        include: {
          contact_information: true,
          site_account: true,
        }
      })

      // E. Log History
      await tx.ticket_history.create({
        data: {
          TicketID:  newTicket.TicketID,
          NewStatus: "OPEN",
          Note:      "Ticket created via Agent Portal",
        }
      })

      return newTicket
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })

  } catch (err) {
    console.error("[POST /api/tickets]", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// ─── POST /api/tickets ─────────────────────────────────────────────────────
// export async function POST(req) {
//   try {
//     const body   = await req.json()
//     const parsed = CreateTicketSchema.safeParse(body)
//
//     if (!parsed.success) {
//       return NextResponse.json(
//         { success: false, errors: parsed.error.flatten().fieldErrors },
//         { status: 422 }
//       )
//     }
//
//     const { contact, company, product, ticketType, caseId, bookingNo } = parsed.data
//
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. resolve or create SiteAccount
//       let siteAccountId
//
//       if (company?.SiteAccountID) {
//         siteAccountId = company.SiteAccountID
//       } else if (company?.Company?.trim()) {
//         const sa = await tx.siteAccount.create({
//           data: {
//             company: company.Company,
//             npwp:    company.NPWP,
//           },
//         })
//         siteAccountId = sa.id
//       }
//
//       // 2. resolve or create Contact
//       let contactId
//
//       if (contact.ContactID) {
//         contactId = contact.ContactID
//       } else {
//         const c = await tx.contact.create({
//           data: {
//             salutation:    contact.Salutation,
//             firstName:     contact.FirstName,
//             lastName:      contact.LastName,
//             email:         contact.Email || null,
//             phone:         contact.Phone,
//             mobile:        contact.Mobile,
//             addressLine1:  contact.AddressLine1,
//             city:          contact.City,
//             province:      contact.StateProvince,
//             country:       contact.Country,
//             zipPostalCode: contact.ZipPostalCode,
//             siteAccountId: siteAccountId ?? null,
//           },
//         })
//         contactId = c.id
//       }
//
//       // 3. reference number
//       const referenceNumber =
//         ticketType === "PengambilanBarang" ? caseId :
//         ticketType === "OnlineBooking"     ? bookingNo :
//         undefined
//
//       // 4. create ticket
//       const ticketNumber = await generateTicketNumber()
//       const ticket = await tx.ticket.create({
//         data: {
//           ticketNumber,
//           ticketType:         TYPE_MAP[ticketType],
//           contactId,
//           siteAccountId:      siteAccountId ?? null,
//           serialNumber:       product.SerialNumber,
//           productNumber:      product.ProductNumber,
//           problemDescription: product.ProblemDescription,
//           referenceNumber:    referenceNumber ?? null,
//         },
//         include: {
//           contact:     true,
//           siteAccount: true,
//         },
//       })
//
//       // 5. log history
//       await tx.ticketHistory.create({
//         data: {
//           ticketId:  ticket.id,
//           newStatus: "OPEN",
//           note:      "Ticket created",
//         },
//       })
//
//       return ticket
//     })
//
//     return NextResponse.json({ success: true, data: result }, { status: 201 })
//   } catch (err) {
//     console.error("[POST /api/tickets]", err)
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// ─── GET /api/tickets ──────────────────────────────────────────────────────
// Query params: ?search=TKT-2024&status=OPEN&page=1&limit=20
export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl
    const search  = searchParams.get("search")  ?? ""
    const status  = searchParams.get("status")  ?? undefined
    const page    = Math.max(1, Number(searchParams.get("page")  ?? 1))
    const limit   = Math.min(100, Number(searchParams.get("limit") ?? 20))
    const skip    = (page - 1) * limit

    const where = {}

    if (status) where.status = status

    if (search) {
      where.OR = [
        { ticketNumber:      { contains: search, mode: "insensitive" } },
        { serialNumber:      { contains: search, mode: "insensitive" } },
        { referenceNumber:   { contains: search, mode: "insensitive" } },
        { contact_information: { firstName: { contains: search, mode: "insensitive" } } },
        { contact_information: { lastName:  { contains: search, mode: "insensitive" } } },
        { contact_information: { email:     { contains: search, mode: "insensitive" } } },
        { contact_information: { phone:     { contains: search, mode: "insensitive" } } },
        { site_account: { company: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          contact_information:     { select: { ContactID: true, FirstName: true, LastName: true, Email: true, Phone: true } },
          site_account: { select: { SiteAccountID: true, Company: true } },
        },
        orderBy: { CreatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: tickets,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error("[GET /api/tickets]", err)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
