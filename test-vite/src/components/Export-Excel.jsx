"use client";

/**
 * ExportExcel
 *
 * Professional pattern for exporting large datasets:
 *
 * 1. Never export from the current page — always fetch from a dedicated
 *    /export endpoint that returns ALL matching rows (respecting current filters).
 * 2. Pass the same active filters from the hook to the export request so users
 *    get exactly what they see on screen, not the whole database.
 * 3. Show a proper loading state with row count feedback.
 * 4. Build the xlsx file entirely on the client using the `xlsx` library —
 *    no server-side xlsx dependency, no memory pressure on the server.
 * 5. Guard against accidental monster exports with a row count warning.
 *
 * Usage:
 *   <ExportExcel
 *     exportParams={hook.exportParams}   // { ...filterParams, ...sortParams }
 *     disabled={hook.loading}
 *   />
 *
 * The hook should expose `exportParams` as a memoized object containing
 * all current filter + sort state translated to server query params.
 * See CaseTable for the full wiring.
 */

import * as React from "react";
import * as XLSX  from "xlsx";
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle } from "lucide-react";
import ApiCustomer from "@/api";
import { toast } from "sonner";

// Warn (but allow) if export will be large
const WARN_THRESHOLD = 5_000;

export function ExportExcel({ exportParams = {}, disabled = false, filename = "Case Information" }) {
  const [status, setStatus] = React.useState("idle"); // idle | counting | fetching | building | done

  const handleExport = React.useCallback(async () => {
    if (status !== "idle") return;

    try {
      setStatus("fetching");

      const res = await ApiCustomer.get("/api/case-information/export", {
        params: exportParams,
      });

      if (!res.data.success) {
        toast.error(res.data.message ?? "Export failed");
        return;
      }

      const rows = res.data.data ?? [];

      if (rows.length === 0) {
        toast.info("No data to export with the current filters.");
        return;
      }

      // Warn on large exports but don't block
      if (rows.length > WARN_THRESHOLD) {
        toast.info(`Building Excel file with ${rows.length.toLocaleString()} rows…`);
      }

      setStatus("building");

      // Slight delay lets the browser repaint the "building" label before xlsx blocks
      await new Promise((r) => setTimeout(r, 30));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto column widths — reads header keys and samples first 50 data rows
      const headers = Object.keys(rows[0] ?? {});
      const colWidths = headers.map((h) => {
        const maxDataLen = Math.min(50, rows.length);
        let max = h.length;
        for (let i = 0; i < maxDataLen; i++) {
          const cell = String(rows[i][h] ?? "");
          if (cell.length > max) max = cell.length;
        }
        return { wch: Math.min(max + 2, 60) }; // cap at 60 chars wide
      });
      worksheet["!cols"] = colWidths;

      // Freeze header row
      worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");

      const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      XLSX.writeFile(workbook, `${filename} ${dateStr}.xlsx`);

      setStatus("done");
      toast.success(`Exported ${rows.length.toLocaleString()} rows successfully.`);
    } catch (err) {
      console.error("[ExportExcel]", err);
      const msg = err.response?.data?.message ?? err.message ?? "Export failed";
      toast.error(msg);
    } finally {
      // Reset after a moment so the button is re-clickable
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [exportParams, filename, status]);

  const isLoading = status !== "idle" && status !== "done";

  const label = {
    idle:     "Export to Excel",
    counting: "Counting rows…",
    fetching: "Fetching data…",
    building: "Building file…",
    done:     "Done ✓",
  }[status];

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || isLoading}
      className="gap-1.5"
    >
      {isLoading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : status === "done"
          ? <AlertCircle className="h-4 w-4 text-green-500" />
          : <Download className="h-4 w-4" />
      }
      {label}
    </Button>
  );
}
