import { NextResponse } from "next/server";

import prisma from "../../../../../prisma/client";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const siteAccountId = parseInt(searchParams.get("siteAccountId"), 10);
  
    if (!siteAccountId) {
      return NextResponse.json({ success: false, message: "SiteAccountID required" }, { status: 400 });
    }
  
    try {
      // Fetch related contacts & assets using SiteAccountID
      const contacts = await prisma.contact_information.findMany({
        where: { SiteAccountID: siteAccountId },
      });
  
      const assets = await prisma.asset_information.findMany({
        where: { SiteAccountID: siteAccountId },
        include:
            {
                product_information:true
            }
      });
  
      return NextResponse.json({
        success: true,
        message: "Company affiliation check completed",
        data: {
          contacts,
          assets,
        },
      });
    } catch (error) {
      console.error("Error checking company affiliations:", error);
      return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
  }
  