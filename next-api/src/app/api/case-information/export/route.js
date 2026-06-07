/**
 * GET /api/case-information/export
 *
 * Streams all matching case rows (no pagination limit) for Excel export.
 * Accepts the same filter/sort params as the main list endpoint.
 *
 * This is the correct pattern for bulk exports:
 *   - Separate endpoint from the paginated list → no interference with cache
 *   - Server builds the flat row structure the export needs
 *   - Returns JSON (client builds xlsx) — fast, no server xlsx dependency
 *   - Hard-cap at 50 000 rows to protect the DB
 *   - Short Redis cache (60s) so repeated exports in quick succession are free
 *
 * Why NOT export from current page data:
 *   - Current page is 20-200 rows; real exports need thousands
 *   - The export shape (flat with computed fields) differs from list shape
 *   - Keeps concerns separated cleanly
 */

import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";
import redis, { redisKey } from "../../../../../lib/redis";

const MAX_EXPORT_ROWS = 50_000;

// ── Reuse the same buildWhere / buildOrderBy from the list route ──────────────
// (In your actual codebase, extract these to a shared lib/case-query.js file
//  and import them in both routes. Duplicated here for clarity.)

function buildWhere(searchParams) {
  const CaseStatus         = searchParams.get("CaseStatus");
  const AssetID            = searchParams.get("AssetID");
  const excludeStatusesRaw = searchParams.getAll("excludeStatuses[]");
  const resourceTarget     = searchParams.get("resource");
  const startDate          = searchParams.get("startDate");
  const endDate            = searchParams.get("endDate");
  const search             = searchParams.get("search")?.trim() ?? "";

  const AND = [];

  if (search) {
    AND.push({
      OR: [
        { CaseID:      { contains: search } },
        { CaseSubject: { contains: search } },
        { asset_information: { SerialNumber:  { contains: search } } },
        { asset_information: { ProductNumber: { contains: search } } },
        { asset_information: { product_information: { ProductName: { contains: search } } } },
        { contact_information: { site_account: { Company: { contains: search } } } },
        { createdByUser: { Name: { contains: search } } },
        { ownerUser:     { Name: { contains: search } } },
      ],
    });
  }

  if (CaseStatus) AND.push({ CaseStatus });
  else if (excludeStatusesRaw?.length) AND.push({ CaseStatus: { notIn: excludeStatusesRaw } });

  if (AssetID) AND.push({ AssetID: parseInt(AssetID) });

  if (startDate || endDate) {
    const createdOn = {};
    if (startDate) createdOn.gte = new Date(startDate);
    if (endDate)   createdOn.lte = new Date(endDate + "T23:59:59");
    AND.push({ CreatedOn: createdOn });
  }

  if (resourceTarget) {
    AND.push({ OR: [
      { createdByUser: { ResourceId: resourceTarget } },
      { ownerUser:     { ResourceId: resourceTarget } },
    ]});
  }

  const serialNumber  = searchParams.get("SerialNumber")?.trim();
  const productNumber = searchParams.get("ProductNumber")?.trim();
  const productName   = searchParams.get("ProductName")?.trim();
  const createdName   = searchParams.get("CreatedName")?.trim();
  const owner         = searchParams.get("Owner")?.trim();

  if (serialNumber)  AND.push({ asset_information: { SerialNumber:  { contains: serialNumber } } });
  if (productNumber) AND.push({ asset_information: { ProductNumber: { contains: productNumber } } });
  if (productName)   AND.push({ asset_information: { product_information: { ProductName: { contains: productName } } } });
  if (createdName)   AND.push({ createdByUser: { Name: { contains: createdName } } });
  if (owner)         AND.push({ ownerUser:     { Name: { contains: owner } } });

  return AND.length ? { AND } : {};
}

// ── Export-specific select (wider than list — includes workorder, accessories) ─

const EXPORT_SELECT = {
  CaseID:             true,
  CaseSubject:        true,
  CaseStatus:         true,
  CaseType:           true,
  CreatedOn:          true,
  CaseClosedDate:     true,
  CaseID_Manual:      true,
  CaseID_Manual_Date: true,
  CaseProductNote:    true,
  OTCCode:            true,

  createdByUser: { select: { Name: true } },
  ownerUser:     { select: { Name: true } },
  otcCodeTable:  { select: { Description: true } },

  asset_information: {
    select: {
      SerialNumber:  true,
      ProductNumber: true,
      WarrantyOTCCode: { select: { Description: true } },
      product_information: {
        select: {
          ProductName:   true,
          ProductNumber: true,
          ProductLine:   true,
          product_type:  { select: { ProductType: true, ProductTower: true, ProductGroup: true } },
        },
      },
    },
  },

  contact_information: {
    select: {
      FirstName:  true,
      LastName:   true,
      City:       true,
      site_account: { select: { Company: true } },
    },
  },

  accessory: { select: { Accessories: true } },

  workorder: {
    select: {
      DelayCode: true,
      owner: { select: { Name: true } },
    },
    take: 1,
    orderBy: { CreatedOn: "desc" },
  },

  ActionLog: {
    select: { ChangeAt: true, dataNew: true, model: true, dataOld: true },
    orderBy: { ChangeAt: "asc" },
    take: 50,
  },
};

// ── Flat row formatter for export (matches ExportExcel's expected shape) ───────

function formatExportRow(c) {
  const logs = c.ActionLog ?? [];

  const finishRepairLog = logs.find(
    (l) => l.dataNew === "FinishRepair" || l.dataNew === "Finish Repair",
  );
  const partOrderLog = logs.find((l) => l.dataNew === "PartOrder");

  const toLocale = (d) => (d ? new Date(d).toLocaleString() : "N/A");

  // TAT: created → finish repair
  let tatFinishRepair = "N/A";
  if (finishRepairLog && c.CreatedOn) {
    const ms = Math.abs(new Date(finishRepairLog.ChangeAt) - new Date(c.CreatedOn));
    tatFinishRepair = Math.ceil(ms / 86_400_000) + " days";
  }

  // TAT E2E: created → closed
  let tatE2E = "N/A";
  if (c.CaseStatus === "Close" && c.CreatedOn && c.CaseClosedDate) {
    const ms = Math.abs(new Date(c.CaseClosedDate) - new Date(c.CreatedOn));
    tatE2E = Math.ceil(ms / 86_400_000) + " days";
  }

  return {
    "ID Case":              c.CaseID               ?? "N/A",
    "Case ID Manual":       c.CaseID_Manual         ?? "N/A",
    "Case Note":            c.CaseProductNote        ?? "N/A",
    "Product Tower":        c.asset_information?.product_information?.product_type?.ProductTower ?? "N/A",
    "Product Group":        c.asset_information?.product_information?.product_type?.ProductGroup ?? "N/A",
    "Product Line":         c.asset_information?.product_information?.ProductLine  ?? "N/A",
    "Product Type":         c.asset_information?.product_information?.product_type?.ProductType  ?? "N/A",
    "Product No":           c.asset_information?.ProductNumber ?? "N/A",
    "Product Name":         c.asset_information?.product_information?.ProductName  ?? "N/A",
    "Serial No":            c.asset_information?.SerialNumber  ?? "N/A",
    "Warranty Status":      c.OTCCode
                              ? c.otcCodeTable?.Description
                              : c.asset_information?.WarrantyOTCCode?.Description ?? "N/A",
    "Company Code":         "HPSC KK",
    "Company Name":         "PT. JAVA ABADI GEMILANG",
    "CE Name":              c.workorder?.[0]?.owner?.Name ?? "N/A",
    "Case Type":            c.CaseType    ?? "N/A",
    "Case Status":          c.CaseStatus  ?? "N/A",
    "Customer Company":     c.contact_information?.site_account?.Company ?? "N/A",
    "Customer Name":        `${c.contact_information?.FirstName ?? ""} ${c.contact_information?.LastName ?? ""}`.trim() || "N/A",
    "Customer City":        c.contact_information?.City ?? "N/A",
    "Received Date":        toLocale(c.CreatedOn),
    "Part Order Date":      partOrderLog ? toLocale(partOrderLog.ChangeAt) : "N/A",
    "Finish Repair Date":   finishRepairLog ? toLocale(finishRepairLog.ChangeAt) : "N/A",
    "Closed Date":          toLocale(c.CaseClosedDate),
    "Case ID Manual Date":  toLocale(c.CaseID_Manual_Date),
    "Accessories":          c.accessory?.map((a) => a.Accessories).filter(Boolean).join(", ") || "N/A",
    "TAT Finish Repair":    tatFinishRepair,
    "TAT E2E":              tatE2E,
    "Delay Code":           c.workorder?.[0]?.DelayCode ?? "N/A",
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const cacheKey = redisKey(`case:export:${searchParams.toString() || "all"}`);
  const cached   = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), { status: 200 });
  }

  const where = buildWhere(searchParams);

  try {
    // Count first — reject if unreasonably large to protect the DB
    const total = await prisma.caseinformation.count({
      where: Object.keys(where).length ? where : undefined,
    });

    if (total > MAX_EXPORT_ROWS) {
      return NextResponse.json(
        {
          success: false,
          message: `Export exceeds limit of ${MAX_EXPORT_ROWS.toLocaleString()} rows (found ${total.toLocaleString()}). Apply more filters before exporting.`,
          total,
        },
        { status: 400 },
      );
    }

    const cases = await prisma.caseinformation.findMany({
      where:   Object.keys(where).length ? where : undefined,
      select:  EXPORT_SELECT,
      orderBy: { CreatedOn: "desc" },
    });

    const rows = cases.map(formatExportRow);

    const response = { success: true, data: rows, total: rows.length };
    // Short cache: 60s — export data should be fresh but repeated clicks are free
    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.error("[export] Error:", e.message);
    return NextResponse.json(
      { success: false, message: "Export failed", error: e.message },
      { status: 500 },
    );
  }
}
