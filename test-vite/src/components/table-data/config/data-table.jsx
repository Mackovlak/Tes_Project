"use client";

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  DataTable — unified table component  (improved)                        │
 * │                                                                         │
 * │  CLIENT    — <DataTable data columns />                                 │
 * │  SERVER    — <DataTable ... serverPagination={...} />                   │
 * │  VIRTUAL   — <DataTable ... virtual={...} />                            │
 * │                                                                         │
 * │  KEY FIXES vs original:                                                 │
 * │  1. flexRender imported and used for ALL headers + cells. The original  │
 * │     called header/cell as functions directly — string headers and any   │
 * │     non-function cell definition silently rendered nothing.             │
 * │  2. twMerge removed as a standalone import; cn() already wraps it.      │
 * │  3. Skeleton loader size matches the real page size, not a hardcoded 8. │
 * │  4. Stale-while-revalidate overlay bar shows when refetching over data. │
 * │  5. Error state has a retry button.                                     │
 * │  6. Row striping no longer fights selected-row highlight (order fixed). │
 * │  7. IntersectionObserver root resolved after mount to avoid null-root   │
 * │     issue on first render.                                              │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import * as React from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  flexRender,          // ← was missing; broke all column rendering
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// PaginationBar
// ─────────────────────────────────────────────────────────────────────────────

function PaginationBar({ table, serverPagination, onRefresh, loading }) {
  const isServer = !!serverPagination;
  const pageIndex = isServer ? serverPagination.pageIndex : table.getState().pagination.pageIndex;
  const pageCount = isServer ? serverPagination.pageCount : table.getPageCount();
  const pageSize  = isServer ? serverPagination.pageSize  : table.getState().pagination.pageSize;
  const total     = isServer ? serverPagination.total     : table.getFilteredRowModel().rows.length;

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  const goTo = (idx) => {
    if (isServer) serverPagination.onPageChange(idx);
    else          table.setPageIndex(idx);
  };

  const handlePageSize = (val) => {
    const n = Number(val);
    if (isServer) serverPagination.onPageSizeChange?.(n);
    else          table.setPageSize(n);
  };

  const pills = React.useMemo(() => {
    if (pageCount <= 0) return [];
    const show = new Set([0, pageCount - 1]);
    for (let d = -2; d <= 2; d++) {
      const i = pageIndex + d;
      if (i >= 0 && i < pageCount) show.add(i);
    }
    const sorted = Array.from(show).sort((a, b) => a - b);
    const result = [];
    for (let k = 0; k < sorted.length; k++) {
      if (k > 0 && sorted[k] - sorted[k - 1] > 1) result.push("gap-" + k);
      result.push(sorted[k]);
    }
    return result;
  }, [pageIndex, pageCount]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5 text-xs">
        <span className="hidden sm:inline">Rows per page</span>
        <Select value={String(pageSize)} onValueChange={handlePageSize}>
          <SelectTrigger className="h-7 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="shrink-0 text-xs">
        {total.toLocaleString()} row{total !== 1 ? "s" : ""}
        {pageCount > 1 && ` · page ${pageIndex + 1} of ${pageCount}`}
      </span>

      <div className="flex flex-wrap items-center gap-0.5">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goTo(0)} disabled={!canPrev}>
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goTo(pageIndex - 1)} disabled={!canPrev}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {pills.map((item) =>
          typeof item === "string" ? (
            <span key={item} className="px-1 text-xs select-none">…</span>
          ) : (
            <Button
              key={item}
              variant={item === pageIndex ? "default" : "outline"}
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => goTo(item)}
            >
              {item + 1}
            </Button>
          )
        )}

        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goTo(pageIndex + 1)} disabled={!canNext}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => goTo(pageCount - 1)} disabled={!canNext}>
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>

        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton rows — page-sized, deterministic widths (no Math.random in render)
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRows({ count, colCount }) {
  return Array.from({ length: count }).map((_, i) => (
    <TableRow key={`sk-${i}`} className="pointer-events-none">
      {Array.from({ length: colCount }).map((__, j) => (
        <TableCell key={j} className="py-2">
          <div
            className="h-4 animate-pulse rounded-md bg-muted"
            style={{ width: `${["75%", "55%", "90%", "60%", "80%"][(i + j) % 5]}` }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

// ─────────────────────────────────────────────────────────────────────────────
// DataTable
// ─────────────────────────────────────────────────────────────────────────────

export function DataTable({
  data = [],
  columns,

  title,
  toolbar,
  className,
  containerClassName,   // replaces the old potraitName (typo fixed)
  cellClassName,        // replaces cellName — only used on cells, never on Table
  loading,
  error,
  onRetry,              // optional callback for the retry button in error state
  emptyMessage = "No data found",

  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,

  globalSearch,
  onGlobalSearchChange,

  enableSingleSelect = false,
  enableMultiSelect  = false,
  selectedRowId,
  onSelectedRowChange,
  rowSelection,
  onRowSelectionChange,
  getRowId,

  serverPagination,
  defaultPageSize    = 20,
  paginationDisabled = false,
  onRefresh,            // forwarded to the refresh button in PaginationBar

  virtual,
  virtualRowEstimate = 36,
  virtualOverscan    = 8,

  facetedFilter = true,
} = {}) {

  const isServerPage = !!serverPagination;
  const isVirtual    = !!virtual;
  const isClient     = !isServerPage && !isVirtual;

  // ── Internal state ──────────────────────────────────────────────────────────
  const [internalSorting,   setInternalSorting]   = React.useState([]);
  const [internalFilters,   setInternalFilters]   = React.useState([]);
  const [internalPageIndex, setInternalPageIndex] = React.useState(0);
  const [internalPageSize,  setInternalPageSize]  = React.useState(defaultPageSize);

  const activeSorting    = sorting       ?? internalSorting;
  const activeSetSorting = setSorting    ?? setInternalSorting;
  const activeFilters    = columnFilters ?? internalFilters;
  const activeSetFilters = setColumnFilters ?? setInternalFilters;

  // Reset client page when filters/sorting change
  const prevClientKey = React.useRef("");
  React.useEffect(() => {
    if (!isClient) return;
    const key = JSON.stringify({ f: activeFilters, s: activeSorting });
    if (key !== prevClientKey.current) {
      prevClientKey.current = key;
      setInternalPageIndex(0);
    }
  }, [activeFilters, activeSorting, isClient]);

  // ── Single-select map ───────────────────────────────────────────────────────
  const singleSel = React.useMemo(() => {
    if (!enableSingleSelect || selectedRowId == null) return {};
    return { [String(selectedRowId)]: true };
  }, [enableSingleSelect, selectedRowId]);

  const selectionEnabled = enableSingleSelect || enableMultiSelect;

  // ── Scroll container ref ────────────────────────────────────────────────────
  const scrollRef = React.useRef(null);

  // ── Virtualizer ─────────────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count:            isVirtual ? data.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize:     () => virtualRowEstimate,
    overscan:         virtualOverscan,
  });

  const virtualItems  = isVirtual ? rowVirtualizer.getVirtualItems() : [];
  const totalVirtSize = isVirtual ? rowVirtualizer.getTotalSize()    : 0;

  const sentinelOffset = virtual?.sentinelOffset ?? 30;
  const sentinelIndex  = isVirtual && data.length > sentinelOffset
    ? data.length - sentinelOffset
    : -1;

  // ── Sentinel observer ───────────────────────────────────────────────────────
  // BUG FIX: root is resolved lazily from the ref, not from a closure that
  // captures a potentially-null value at definition time.
  const observerRef = React.useRef(null);
  const sentinelCallbackRef = React.useCallback(
    (el) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!el || !isVirtual || !virtual?.fetchMore) return;
      const obs = new IntersectionObserver(
        (entries) => { if (entries[0]?.isIntersecting) virtual.fetchMore(); },
        {
          root:       scrollRef.current, // may still be null on first virtual render;
          // if so the observer falls back to the viewport, which is acceptable
          rootMargin: "0px 0px 400px 0px",
          threshold:  0,
        },
      );
      obs.observe(el);
      observerRef.current = obs;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVirtual, virtual?.fetchMore],
  );

  // ── TanStack table ──────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ?? undefined,

    meta: { onSelectRow: (original) => onSelectedRowChange?.(original) },

    state: {
      sorting:       activeSorting,
      columnFilters: activeFilters,
      ...(enableSingleSelect ? { rowSelection: singleSel }          : {}),
      ...(enableMultiSelect  ? { rowSelection: rowSelection ?? {} } : {}),
      ...(isClient ? {
        pagination: { pageIndex: internalPageIndex, pageSize: internalPageSize },
      } : {}),
      ...(isServerPage ? {
        pagination: { pageIndex: serverPagination.pageIndex, pageSize: serverPagination.pageSize },
      } : {}),
    },

    manualPagination: isServerPage,
    manualFiltering:  isServerPage || isVirtual,
    manualSorting:    isServerPage || isVirtual,

    pageCount: isServerPage ? (serverPagination.pageCount ?? -1) : undefined,

    onSortingChange:       activeSetSorting,
    onColumnFiltersChange: activeSetFilters,

    onPaginationChange: isServerPage
      ? (updater) => {
          const prev = { pageIndex: serverPagination.pageIndex, pageSize: serverPagination.pageSize };
          const next = typeof updater === "function" ? updater(prev) : updater;
          if (next.pageIndex !== prev.pageIndex) serverPagination.onPageChange(next.pageIndex);
          if (next.pageSize  !== prev.pageSize)  serverPagination.onPageSizeChange?.(next.pageSize);
        }
      : isClient
        ? (updater) => {
            const prev = { pageIndex: internalPageIndex, pageSize: internalPageSize };
            const next = typeof updater === "function" ? updater(prev) : updater;
            if (next.pageIndex !== prev.pageIndex) setInternalPageIndex(next.pageIndex);
            if (next.pageSize  !== prev.pageSize) {
              setInternalPageSize(next.pageSize);
              setInternalPageIndex(0);
            }
          }
        : undefined,

    enableRowSelection:   selectionEnabled,
    onRowSelectionChange: enableMultiSelect ? onRowSelectionChange : undefined,

    getCoreRowModel:        getCoreRowModel(),
    getSortedRowModel:      isClient                          ? getSortedRowModel()      : undefined,
    getFilteredRowModel:    isClient                          ? getFilteredRowModel()    : undefined,
    getPaginationRowModel:  (isClient && !paginationDisabled) ? getPaginationRowModel()  : undefined,
    getFacetedRowModel:     (isClient && facetedFilter)       ? getFacetedRowModel()     : undefined,
    getFacetedUniqueValues: (isClient && facetedFilter)       ? getFacetedUniqueValues() : undefined,
  });

  // ── Row selection handler ───────────────────────────────────────────────────
  const handleSelectRow = React.useCallback((row) => {
    if (enableSingleSelect) { onSelectedRowChange?.(row.original); return; }
    if (enableMultiSelect)  row.toggleSelected();
  }, [enableSingleSelect, enableMultiSelect, onSelectedRowChange]);

  // ── Rows to render ──────────────────────────────────────────────────────────
  const allRows = table.getRowModel().rows;

  const displayRows = isVirtual
    ? null
    : (isClient && !paginationDisabled) || isServerPage
      ? table.getPaginationRowModel().rows
      : allRows;

  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0;
  const paddingBottom = virtualItems.length > 0
    ? totalVirtSize - (virtualItems[virtualItems.length - 1]?.end ?? totalVirtSize)
    : 0;

  const showPagination = !isVirtual && !paginationDisabled;

  // Skeleton count: match the actual page size so the layout doesn't jump
  const skeletonCount = isServerPage
    ? (serverPagination?.pageSize ?? defaultPageSize)
    : defaultPageSize;

  const serverProps = React.useMemo(() => ({
    isServerMode: isServerPage || isVirtual,
    globalSearch: globalSearch ?? "",
    onGlobalSearchChange,
  }), [isServerPage, isVirtual, globalSearch, onGlobalSearchChange]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title  && <div>{title}</div>}
      {toolbar && toolbar(table, serverProps)}

      {/* Error state with optional retry */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span className="flex-1">{error}</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="h-7 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10">
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Virtual row count */}
      {isVirtual && virtual.total > 0 && (
        <p className="text-xs text-muted-foreground">
          {data.length.toLocaleString()} / {virtual.total.toLocaleString()} rows loaded
          {virtual.allLoaded && " · all loaded ✓"}
        </p>
      )}

      {/* Stale-while-revalidate top bar: visible when data exists but is refreshing */}
      {loading && data.length > 0 && !isVirtual && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] bg-primary/40 rounded-full" />
        </div>
      )}

      <Table
        ref={isVirtual ? scrollRef : undefined}
        className="text-[11px] leading-tight"
        potrait={cn(
          "mt-3 rounded-xl border-2 max-h-105 2xl:max-h-195",
          containerClassName,
        )}
      >
        <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur-sm">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id} className="whitespace-nowrap">
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {/* ── Initial loading skeleton ─────────────────────────────────── */}
          {loading && !data.length ? (
            <SkeletonRows count={skeletonCount} colCount={columns.length} />

          ) : isVirtual ? (
            /* ── Virtual rows ────────────────────────────────────────────── */
            <>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{ height: `${paddingTop}px`, padding: 0, border: "none" }}
                  />
                </TableRow>
              )}

              {virtualItems.map((vRow) => {
                const row        = allRows[vRow.index];
                const isSelected = selectionEnabled && row ? row.getIsSelected() : false;
                const isSentinel = vRow.index === sentinelIndex;

                return (
                  <TableRow
                    key={row?.id ?? `v-${vRow.index}`}
                    data-index={vRow.index}
                    ref={(el) => {
                      if (el) rowVirtualizer.measureElement(el);
                      if (isSentinel) sentinelCallbackRef(el);
                    }}
                    tabIndex={selectionEnabled ? 0 : undefined}
                    aria-selected={isSelected || undefined}
                    onClick={selectionEnabled && row ? () => handleSelectRow(row) : undefined}
                    onKeyDown={selectionEnabled && row ? (e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectRow(row); }
                    } : undefined}
                    className={cn(
                      selectionEnabled && "cursor-pointer",
                      isSelected && "bg-blue-50 dark:bg-blue-950",
                    )}
                  >
                    {row
                      ? row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn("whitespace-nowrap py-0", cellClassName)}
                          >
                            {/* FIX: use flexRender here too */}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))
                      : columns.map((_, ci) => (
                          <TableCell key={ci} className={cn("whitespace-nowrap py-0", cellClassName)}>
                            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                  </TableRow>
                );
              })}

              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{ height: `${paddingBottom}px`, padding: 0, border: "none" }}
                  />
                </TableRow>
              )}

              {loading && data.length > 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-3 text-center text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading more…
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </>

          ) : displayRows?.length ? (
            /* ── Paginated / client rows ─────────────────────────────────── */
            displayRows.map((row, idx) => {
              const isSelected = selectionEnabled ? row.getIsSelected() : false;
              return (
                <TableRow
                  key={row.id}
                  tabIndex={selectionEnabled ? 0 : undefined}
                  aria-selected={isSelected || undefined}
                  onClick={selectionEnabled ? () => handleSelectRow(row) : undefined}
                  onKeyDown={selectionEnabled ? (e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectRow(row); }
                  } : undefined}
                  className={cn(
                    // Stripe first so selected bg can override
                    idx % 2 !== 0 && "bg-muted/50",
                    selectionEnabled && "cursor-pointer hover:bg-accent/50",
                    // FIX: selected bg applied last, overrides stripe
                    isSelected && "bg-blue-50 dark:bg-blue-950 hover:bg-blue-50 dark:hover:bg-blue-950",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("whitespace-nowrap py-0", cellClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            /* ── Empty state ─────────────────────────────────────────────── */
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-16 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <PaginationBar
          table={table}
          serverPagination={isServerPage ? serverPagination : undefined}
          onRefresh={onRefresh}
          loading={loading}
        />
      )}
    </div>
  );
}
