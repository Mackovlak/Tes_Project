import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
// import { generateID } from "@/utils/generateID";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
  
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return new Response(JSON.stringify({ error: 'Invalid query' }), { status: 400 });
    }
  
    const searchTerm = query.trim();
  
    try {
      const cases = await prisma.caseinformation.findMany({
        where: {
          OR: [
            { CaseID: { contains: searchTerm} },
            { CaseSubject: { contains: searchTerm} },
            { CaseID_Manual: { contains: searchTerm} },
            { CaseType: { contains: searchTerm} },
            { site_account: { Company: { contains: searchTerm} } },
            { contact_information: { FirstName: { contains: searchTerm}, LastName: { contains: searchTerm} } },
            { asset_information: {is : { SerialNumber: { contains: searchTerm} }}},
          ],
        },
        include: {
          site_account: true,
          contact_information: true,
          asset_information: true,
        },
      });
  
      const workOrders = await prisma.workorder.findMany({
        where: {
          OR: [
            { WOID: { contains: searchTerm} },
            // { BookingID: { contains: searchTerm} },
            // { SystemStatus: searchTerm },
          ],
        },
      });
  
      const materialOrders = await prisma.materialorder.findMany({
        where: {
          OR: [
            { MOID: { contains: searchTerm} },
            { WOID: { contains: searchTerm} },
            { OrderNumber: { contains: searchTerm} },
            {
              materialorderlineitems: {
                some: {
                  PartNumber: { contains: searchTerm},
                },
              },
            },
          ],
        },
        include: {
          materialorderlineitems: true,
        },
      });
  
      return new Response(
        JSON.stringify({
          cases,
          workOrders,
          materialOrders,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (err) {
      console.error('Global search failed:', err);
      return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
    }
  }