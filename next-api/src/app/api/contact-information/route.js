import { NextResponse } from "next/server";

import prisma  from "../../../../prisma/client";

import redis, { deleteByPattern, redisKey } from "../../../../lib/redis";

// export async function GET(request) {
//     try{
//         // Ambil parameter pencarian & pagination
//         const { searchParams } = new URL(request.url);
//         const search = searchParams.get("search") || "";
//
//         const email = searchParams.get("email") || "";
//         const phone = searchParams.get("phone") || "";
//         const country = searchParams.get("country") || "";
//
//         const contactID = searchParams.get("ContactID") || 0;
//         const siteAccountID = searchParams.get("SiteAccountID") || "";
//         const page = parseInt(searchParams.get("page")) || 1;
//         const limit = parseInt(searchParams.get("limit")) || 10;
//
//
//          // Initialize filters
//         const andConditions = [];
//
//         // If searching within a company
//         if (siteAccountID) {
//             andConditions.push({SiteAccountID: parseInt(siteAccountID)})
//         }
//
//          // Search by Email (must be in the selected country)
//          if (email) {
//             const emailCond = { Email: { contains: email }}
//             if(country){
//                 andConditions.push({ AND: [emailCond, {Country: { contains: country}}]})
//             } else{
//                 andConditions.push(emailCond);
//             }
//          }
//
//          // Search by Phone (match phone in any country)
//          if (phone) {
//              andConditions.push({
//                  OR: [
//                      { Phone: { contains: phone } },
//                      { Mobile: { contains: phone } },
//                      { OtherPhone: { contains: phone } }
//                  ]
//             })
//          }
//
//          if(search){
//              const searchTerms = search.trim().split(/\s+/);
//              const nameSearchCondition = {
//                 AND: searchTerms.map((term) => ({
//                     OR: [
//                         { FirstName: { contains: term  } },
//                         { LastName: { contains: term  } }
//                     ]
//                 }))
//             };
//
//             andConditions.push({
//                 OR: [
//                     nameSearchCondition, // The smart name search
//                     { Email: { contains: search } },
//                     { City: { contains: search  } }
//                 ]
//             });
//             // andConditions.push({
//             //     OR: [
//             //         { FirstName: { contains: search } },
//             //         { LastName: { contains: search } },
//             //         { Email: { contains: search } },
//             //         { City: { contains: search } }
//             //     ]
//             // })
//          }
//
//          if(contactID) andConditions.push({OR:[{ContactID: parseInt(contactID)}]})
//
//
//
//         const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
//
//          // Get total count
//          const totalCount = await prisma.contact_information.count({ where: whereCondition });
//
//
//
//         // Hitung offset berdasarkan halaman
//         const skip = (page - 1) * limit;
//
//
//
//         // Ambil data dengan filter & pagination
//         const contact_information = await prisma.contact_information.findMany({
//             where: whereCondition,
//             // skip: (page - 1) * limit,
//             // take: limit,
//             orderBy: { FirstName: "asc" },
//             include: { site_account: { select: { Company: true } } }
//         });
//
//
//         return NextResponse.json({
//             success: true,
//             message: "List Data Contacts Information",
//             data: contact_information.map(contact => ({
//                 ...contact,
//                 Company: contact.site_account?.Company || "No Company" // Tambahkan Company di level utama
//             })),
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page
//         });
//
//     } catch (error) {
//         console.error(" ERROR in GET API:", error);
//
//         return NextResponse.json({
//             success: false,
//             message: "Failed to fetch data",
//             error: error.message
//         }, { status: 500 });
//     }
// }

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Setup Modes & Params
    const mode = searchParams.get("mode") ?? "paginated";
    const search = searchParams.get("search")?.trim() || "";

    // ── 1. Handle "Distinct" Mode for Dropdown Autocomplete ──
    if (mode === "distinct") {
      const field = searchParams.get("field");
      const q = searchParams.get("q")?.trim() || "";
      const limit = Math.min(50, parseInt(searchParams.get("limit") || "30", 10));

      const DISTINCT_FIELDS = {
        // Company exists on the relational site_account table
        Company: () =>
          prisma.site_account.findMany({
            where: q ? { Company: { contains: q } } : {},
            select: { Company: true },
            distinct: ["Company"],
            orderBy: { Company: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.Company).filter(Boolean)),

        Salutation: () =>
          prisma.contact_information.findMany({
            where: q ? { Salutation: { contains: q } } : {},
            select: { Salutation: true },
            distinct: ["Salutation"],
            orderBy: { Salutation: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.Salutation).filter(Boolean)),

        PreferredLanguage: () =>
          prisma.contact_information.findMany({
            where: q ? { PreferredLanguage: { contains: q } } : {},
            select: { PreferredLanguage: true },
            distinct: ["PreferredLanguage"],
            orderBy: { PreferredLanguage: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.PreferredLanguage).filter(Boolean)),

        Country: () =>
          prisma.contact_information.findMany({
            where: q ? { Country: { contains: q } } : {},
            select: { Country: true },
            distinct: ["Country"],
            orderBy: { Country: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.Country).filter(Boolean)),

        StateProvince: () =>
          prisma.contact_information.findMany({
            where: q ? { StateProvince: { contains: q } } : {},
            select: { StateProvince: true },
            distinct: ["StateProvince"],
            orderBy: { StateProvince: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.StateProvince).filter(Boolean)),

        City: () =>
          prisma.contact_information.findMany({
            where: q ? { City: { contains: q } } : {},
            select: { City: true },
            distinct: ["City"],
            orderBy: { City: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.City).filter(Boolean)),

        ZipPostalCode: () =>
          prisma.contact_information.findMany({
            where: q ? { ZipPostalCode: { contains: q } } : {},
            select: { ZipPostalCode: true },
            distinct: ["ZipPostalCode"],
            orderBy: { ZipPostalCode: "asc" },
            take: limit,
          }).then((r) => r.map((x) => x.ZipPostalCode).filter(Boolean)),
      };

      if (!DISTINCT_FIELDS[field]) {
        return NextResponse.json(
          { success: false, message: `Unknown field: ${field}` },
          { status: 400 }
        );
      }

      const values = await DISTINCT_FIELDS[field]();
      return NextResponse.json({ success: true, values }, { status: 200 });
    }

    // ── 2. Handle "Paginated" Mode for the Data Table ──
    // FIXED: Use skip and take directly to match the site_account implementation
    const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
    const take = Math.min(200, Math.max(1, parseInt(searchParams.get("take") ?? "20", 10)));
    
    // Sort parsing
    const sortBy = searchParams.get("sortBy") ?? "FirstName";
    const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
    const orderBy = { [sortBy]: sortDir };

    // ── 3. Filters Mapping ──
    const baseConditions = [];

    // Global Search (Smart Name + Email + City + Company)
    if (search) {
      const searchTerms = search.split(/\s+/);
      const nameSearchCondition = {
        AND: searchTerms.map((term) => ({
          OR: [
            { FirstName: { contains: term } },
            { LastName: { contains: term } },
            { Email: { contains: term } },
            { City: { contains: term } },
            { site_account: { Company: { contains: term } } }
          ],
        })),
      };
      baseConditions.push(nameSearchCondition);
    }

    // Exact/Specific column filters from Datatable Faceted Filters
    const company = searchParams.get("Company");
    if (company) baseConditions.push({ site_account: { Company: { equals: company } } });

    const salutation = searchParams.get("Salutation");
    if (salutation) baseConditions.push({ Salutation: salutation });

    const preferredLanguage = searchParams.get("PreferredLanguage");
    if (preferredLanguage) baseConditions.push({ PreferredLanguage: preferredLanguage });

    const country = searchParams.get("Country");
    if (country) baseConditions.push({ Country: country });

    const stateProvince = searchParams.get("StateProvince");
    if (stateProvince) baseConditions.push({ StateProvince: stateProvince });

    const city = searchParams.get("City");
    if (city) baseConditions.push({ City: city });

    const zipPostalCode = searchParams.get("ZipPostalCode");
    if (zipPostalCode) baseConditions.push({ ZipPostalCode: zipPostalCode });

    // Additional specific filters
    const email = searchParams.get("email");
    if (email) baseConditions.push({ Email: { contains: email } });

    const phone = searchParams.get("phone");
    if (phone) {
      baseConditions.push({
        OR: [
          { Phone: { contains: phone } },
          { Mobile: { contains: phone } },
          { OtherPhone: { contains: phone } },
        ],
      });
    }

    const contactID = searchParams.get("ContactID");
    if (contactID) baseConditions.push({ ContactID: parseInt(contactID, 10) });

    const siteAccountID = searchParams.get("SiteAccountID");
    if (siteAccountID) baseConditions.push({ SiteAccountID: parseInt(siteAccountID, 10) });

    const whereCondition = baseConditions.length > 0 ? { AND: baseConditions } : {};

    // ── 4. Redis Caching ──
    const sortedParams = new URLSearchParams(
      [...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b))
    );
    const cacheKey = redisKey(`contact_information:list:${sortedParams.toString()}`);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    // ── 5. Fetch Data (Concurrent Execution) ──
    const [totalCount, rawContacts] = await Promise.all([
      prisma.contact_information.count({ where: whereCondition }),
      prisma.contact_information.findMany({
        where: whereCondition,
        skip: skip,     // FIXED: Using skip
        take: take,     // FIXED: Using take
        orderBy: orderBy,
        include: { site_account: { select: { Company: true } } },
      }),
    ]);

    // Flatten the relation so the frontend gets a clean object
    const mappedContacts = rawContacts.map((contact) => ({
      ...contact,
      Company: contact.site_account?.Company || "No Company",
    }));

    // FIXED: Response strictly matches the working format hook expects
    const response = {
      success: true,
      message: "List Data Contacts Information",
      data: mappedContacts,
      total: totalCount, // FIXED: Changed from totalCount/totalPages to just `total`
      skip,
      take,
      mode,
    };

    // ── 6. Cache the Response ──
    await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error("🔥 ERROR in GET API:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
    const { 
        SiteAccountID,  
        Salutation,
        FirstName,
        LastName,
        Email,
        PreferredLanguage,
        Phone,
        Mobile,
        WorkPhone,
        WorkExtension,
        OtherPhone,
        OtherExtension,
        Fax,
        AddressLine1,
        AddressLine2,
        City,
        StateProvince,
        Country,
        ZipPostalCode,
        PIC_Name,
        PIC_Email,
        PIC_Phone
    } = await request.json();

    try {
        const orConditions = [];

        if (Email) orConditions.push({ Email: { contains: Email } });
        if (Phone) orConditions.push({ Phone: { contains: Phone } });
        if (Mobile) orConditions.push({ Mobile: { contains: Mobile } });

        if (orConditions.length === 0) {
            return NextResponse.json({
                success: false,
                message: "At least one of Email, Phone, or Mobile must be provided."
            }, { status: 400 });
        }

        const dupCount = await prisma.contact_information.count({ where: { OR: orConditions } });
        if (dupCount !== 0) {
            return NextResponse.json({
                success: false,
                message: "A Contact with this email or phone already exists."
            }, { status: 409 });
        }

        const contact_information = await prisma.contact_information.create({
            data: {
                SiteAccountID,
                Salutation,
                FirstName,
                LastName,
                Email,
                PreferredLanguage,
                Phone,
                Mobile,
                WorkPhone,
                WorkExtension,
                OtherPhone,
                OtherExtension,
                Fax,
                AddressLine1,
                AddressLine2,
                City,
                StateProvince,
                Country,
                ZipPostalCode,
                PIC_Name,
                PIC_Email,
                PIC_Phone
            },
        });

        return NextResponse.json({
            success: true,
            message: "Contact Information Created Successfully!",
            data: contact_information,
        }, { status: 201 });
    } catch (error) {
        if (error?.code === 'P2002') {
            return NextResponse.json({
                success: false,
                message: "A Contact with this email or phone already exists."
            }, { status: 409 });
        }
        return NextResponse.json({
            success: false,
            message: "Failed to create contact",
            error: error.message
        }, { status: 500 });
    }
}
