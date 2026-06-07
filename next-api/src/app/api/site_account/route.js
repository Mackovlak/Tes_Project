import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

import redis, { deleteByPattern, redisKey } from "../../../../lib/redis";

// export async function GET(request) {
//     try {
//         // Ambil parameter pencarian & pagination
//         const { searchParams } = new URL(request.url);
//         const search = searchParams.get("search") || "";
//
//         const SiteAccountID = searchParams.get("SiteAccountID") || "";
//         const email = searchParams.get("email") || "";
//         const phone = searchParams.get("phone") || "";
//
//         const page = parseInt(searchParams.get("page")) || 1;
//         const limit = parseInt(searchParams.get("limit")) || 100;
//
//          // Initialize search filters
//          let whereCondition = {};
//
//          //seacrh by ID {}
//          // Search by Email
//          if (email) {
//              whereCondition.OR = [{ Email: { contains: email } }];
//          }
//
//          // Search by Phone
//          if (phone) {
//              whereCondition.OR = [...(whereCondition.OR || []), { 
//                 PrimaryPhone: { contains: phone }, 
//                 WhatsappNo: { contains: phone }, 
//             }];
//          }
//
//          if (search) {
//             whereCondition.OR = [...(whereCondition.OR || []), { Company: { contains: search } }];
//         }
//
//         //  // If both Email and Phone exist, apply the combined filter
//         //  if (email && phone) {
//         //      whereCondition = {
//         //          OR: [
//         //              { Email: { contains: email } },
//         //              { PrimaryPhone: { contains: phone } },
//         //              { Company: { contains: search } }
//         //          ]
//         //      };
//         //  }
//
//         // Hitung jumlah data total
//         const totalCount = await prisma.site_account.count({
//             where: whereCondition
//         });
//
//         // Hitung offset berdasarkan halaman
//         const skip = (page - 1) * limit;
//
//         // Ambil data dengan filter & pagination
//         const site_accounts = await prisma.site_account.findMany({
//             where: whereCondition,
//             skip: skip, 
//             orderBy: { Company: "asc" }
//         });
//
//         return NextResponse.json({
//             success: true,
//             message: "List Data Site Account",
//             data: site_accounts,
//             totalPages: Math.ceil(totalCount / limit),
//             currentPage: page
//         });
//     } catch (error) {
//         console.error("🔥 ERROR in GET API:", error);
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
      const limit = Math.min(
        50,
        parseInt(searchParams.get("limit") || "30", 10),
      );

      // Define which fields are allowed for distinct search to prevent errors
      const DISTINCT_FIELDS = {
        Company: () =>
          prisma.site_account
            .findMany({
              where: q ? { Company: { contains: q } } : {},
              select: { Company: true },
              distinct: ["Company"],
              orderBy: { Company: "asc" },
              take: limit,
            })
            .then((r) => r.map((x) => x.Company).filter(Boolean)),

        Email: () =>
          prisma.site_account
            .findMany({
              where: q ? { Email: { contains: q } } : {},
              select: { Email: true },
              distinct: ["Email"],
              orderBy: { Email: "asc" },
              take: limit,
            })
            .then((r) => r.map((x) => x.Email).filter(Boolean)),

        SiteAccountID: () =>
          prisma.site_account
            .findMany({
              where: q ? { SiteAccountID: { contains: q } } : {},
              select: { SiteAccountID: true },
              distinct: ["SiteAccountID"],
              orderBy: { SiteAccountID: "asc" },
              take: limit,
            })
            .then((r) => r.map((x) => x.SiteAccountID).filter(Boolean)),

        Country: () =>
          prisma.site_account
            .findMany({
              where: q ? { Country: { contains: q } } : {},
              select: { Country: true },
              distinct: ["Country"],
              orderBy: { Country: "asc" },
              take: limit,
            })
            .then((r) => r.map((x) => x.Country).filter(Boolean)),

        StateProvince: () =>
          prisma.site_account.findMany({
              where: q ? { StateProvince: { contains: q } } : {},
              select: { StateProvince: true },
              distinct: ["StateProvince"],
              orderBy: { StateProvince: "asc" },
              take: limit,
          })
            .then((r) => r.map((x) => x.StateProvince).filter(Boolean)),
        City: () =>
          prisma.site_account.findMany({
              where: q ? { City: { contains: q } } : {},
              select: { City: true },
              distinct: ["City"],
              orderBy: { City: "asc" },
              take: limit,
          })
            .then((r) => r.map((x) => x.City).filter(Boolean)),
        ZipPostalCode: () =>
          prisma.site_account.findMany({
              where: q ? { ZipPostalCode: { contains: q } } : {},
              select: { ZipPostalCode: true },
              distinct: ["ZipPostalCode"],
              orderBy: { ZipPostalCode: "asc" },
              take: limit,
          })
            .then((r) => r.map((x) => x.ZipPostalCode).filter(Boolean)),
      };

      if (!DISTINCT_FIELDS[field]) {
        return NextResponse.json(
          { success: false, message: `Unknown field: ${field}` },
          { status: 400 },
        );
      }

      const values = await DISTINCT_FIELDS[field]();
      return NextResponse.json({ success: true, values }, { status: 200 });
    }

    // ── 2. Handle "Paginated" Mode for the Data Table ──
    const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
    const take = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("take") ?? "20", 10)),
    );

    // Sort parsing
    const sortBy = searchParams.get("sortBy") ?? "Company";
    const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
    const orderBy = { [sortBy]: sortDir };

    // ── 3. Filters Mapping (Using Array Push strategy) ──
    const baseConditions = [];

    // Global search (acts as a catch-all for main fields)
    if (search) {
      baseConditions.push({
        OR: [
          { Company: { contains: search } },
          { Email: { contains: search } },
          { PrimaryPhone: { contains: search } },
        ],
      });
    }

    // Exact/Specific column filters
    const email = searchParams.get("email");
    if (email) baseConditions.push({ Email: { contains: email } });

    const country = searchParams.get("Country");
    if (country) baseConditions.push({ Country: { contains: country } });

    const stateProvince = searchParams.get("StateProvince");
    if (stateProvince) baseConditions.push({ StateProvince: { contains: stateProvince } });

    const city = searchParams.get("City");
    if (city) baseConditions.push({ City: { contains: city } });

    const zipPostalCode = searchParams.get("ZipPostalCode");
    if (zipPostalCode) baseConditions.push({ ZipPostalCode: { contains: zipPostalCode } });


    const phone = searchParams.get("phone");
    if (phone) {
      baseConditions.push({
        OR: [
          { PrimaryPhone: { contains: phone } },
          { WhatsappNo: { contains: phone } },
        ],
      });
    }

    const siteAccountID = searchParams.get("SiteAccountID");
    if (siteAccountID) baseConditions.push({ SiteAccountID: siteAccountID });

    // Combine all conditions safely using AND
    const whereCondition =
      baseConditions.length > 0 ? { AND: baseConditions } : {};

    // ── 4. Redis Caching ──
    // Sort the URL parameters alphabetically so identical queries always hit the same cache
    const sortedParams = new URLSearchParams(
      [...searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)),
    );
    const cacheKey = redisKey(`site_account:list:${sortedParams.toString()}`);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    // ── 5. Fetch Data (Concurrent Execution) ──
    const [totalCount, site_accounts] = await Promise.all([
      prisma.site_account.count({ where: whereCondition }),
      prisma.site_account.findMany({
        where: whereCondition,
        skip: skip,
        take: take,
        orderBy: orderBy,
      }),
    ]);

    const response = {
      success: true,
      message: "List Data Site Account",
      data: site_accounts,
      total: totalCount,
      skip,
      take,
      mode,
    };

    // Cache the response for 120 seconds
    await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("🔥 ERROR in GET API:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Ambil data dari request
    const data = await request.json();

    // Validasi sederhana
    if (
      !data.Company ||
      !data.Email ||
      (data.PrimaryPhone == "" && data.WhatsappNo == "")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Company, Email, and PrimaryPhone are required",
        },
        { status: 400 },
      );
    }

    let orConditions = [];

    if (data.Email) {
      orConditions.push({ Email: { contains: data.Email } });
    }
    if (data.PrimaryPhone) {
      orConditions.push({ PrimaryPhone: { contains: data.PrimaryPhone } });
    }
    if (data.WhatsappNo) {
      orConditions.push({ WhatsappNo: { contains: data.WhatsappNo } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one of Email, PrimaryPhone, or WhatsappNo is required for duplicate check",
        },
        { status: 400 },
      );
    }

    const availableCompanyEmailPhoneDuplicate = await prisma.site_account.count(
      {
        where: {
          OR: orConditions,
        },
      },
    );

    if (availableCompanyEmailPhoneDuplicate !== 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A Company with this email or phone already exists.",
          error: "A Company with this email or phone already exists.",
        },
        { status: 409 },
      );
    }
    // Simpan ke database
    const newAccount = await prisma.site_account.create({
      data: {
        Company: data.Company,
        Email: data.Email,
        PrimaryPhone: data.PrimaryPhone,
        WhatsappNo: data.WhatsappNo,
        AddressLine1: data.AddressLine1 || "",
        AddressLine2: data.AddressLine2 || "",
        City: data.City || "",
        StateProvince: data.StateProvince || "",
        Country: data.Country || "",
        ZipPostalCode: data.ZipPostalCode || "",
        NPWP: data.NPWP || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Site Account Created Successfully!",
        data: newAccount,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "A Company with this email or phone already exists.",
          error: "Unique constraint violation",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create site account",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
