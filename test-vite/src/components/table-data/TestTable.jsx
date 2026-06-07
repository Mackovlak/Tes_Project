"use client";

/**
 * TEST TABLE for test — server-paginated + server-virtual modes
 *
 */

import * as React from "react";
import { Checkbox }  from "@/components/ui/checkbox";
import { Input }     from "@/components/ui/input";
import { Button }    from "@/components/ui/button";
import { DataTable } from "./config/data-table";
import {
  useServerPageTable,
  useServerVirtual,
} from "./config/data-use-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const PARTS_API = "/api/service-log/parts-catalog";

// ── Column filter input ───────────────────────────────────────────────────────

function ColFilter({ id, label, filterStateRef, column, className }) {
  const value = filterStateRef.current.columnFilters.find((f) => f.id === id)?.value ?? "";

  const sorted = column.getIsSorted() // false | "asc" | "desc"
  const onChange = (e) => {
    const v = e.target.value;
    filterStateRef.current.setColumnFilters((prev) => {
      const without = prev.filter((f) => f.id !== id);
      return v ? [...without, { id, value: v }] : without;
    });
  };

  return (
    <div className="font-semibold text-foreground whitespace-pre-wrap">
      <Button
        type="button"
        variant="ghost"
        className={className}
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        {label}
        {sorted === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : sorted === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
        )}
      </Button>
      {/* {label} */}
      <Input
        className="mt-1 bg-background font-normal h-7 text-xs"
        value={value}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        placeholder="Filter…"
      />
    </div>
  );
}

// ── Column factory ────────────────────────────────────────────────────────────

function buildColumns(filterStateRef) {
  return [
    {
      id: "select",
      header: () => <span className="font-semibold text-foreground">Select</span>,
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      size: 56,
    },
    {
      accessorKey: "PartNumber",
      header: ({ column }) => <ColFilter id="PartNumber" label="Part #" filterStateRef={filterStateRef} column={column}/>,
    },
    {
      accessorKey: "Keyword",
      header: ({ column }) => <ColFilter id="Keyword" label="Keyword" filterStateRef={filterStateRef} column={column}/>,
    },
    {
      accessorKey: "PartDescription",
      header: ({ column }) => <ColFilter id="PartDescription" label="Description" filterStateRef={filterStateRef} column={column}/>,
    },
  ];
}

// ── Shared row-selection logic ────────────────────────────────────────────────

function usePartRowSelection(data, selectedParts, setSelectedParts) {
  const dataById = React.useMemo(() => {
    const m = new Map();
    for (const part of data) m.set(String(part.PartNumber), part);
    return m;
  }, [data]);

  const rowSelection = React.useMemo(() => {
    const map = {};
    for (const item of selectedParts) map[String(item.PartNumber)] = true;
    return map;
  }, [selectedParts]);

  const onRowSelectionChange = React.useCallback(
    (updater) => {
      setSelectedParts((prev) => {
        const prevMap = Object.fromEntries(prev.map((p) => [String(p.PartNumber), true]));
        const nextMap = typeof updater === "function" ? updater(prevMap) : updater;
        const nextIds = new Set(Object.keys(nextMap).filter((k) => nextMap[k]));
        let next = prev.filter((p) => nextIds.has(String(p.PartNumber)));
        for (const id of nextIds) {
          if (prev.some((p) => String(p.PartNumber) === id)) continue;
          const part = dataById.get(id);
          if (part) next = [...next, { ...part, qty: 1, Total: part.Price }];
        }
        return next;
      });
    },
    [dataById, setSelectedParts],
  );

  return { rowSelection, onRowSelectionChange };
}

// ── Shared filter params ──────────────────────────────────────────────────────

function partFiltersToParams(filters) {
  const p = {};
  for (const f of filters) {
    if (f.id === "PartNumber")      p.partNumber = f.value;
    if (f.id === "Keyword")         p.keyword    = f.value;
    if (f.id === "PartDescription") p.partDesc   = f.value;
  }
  return p;
}

function partSortToParams(s) {
  return {
    sortBy:  s[0]?.id   ?? "PartNumber",
    sortDir: s[0]?.desc ? "desc" : "asc",
  };
}

// ── Paginated variant ─────────────────────────────────────────────────────────

function PartCatalogPaginated({ selectedPartCatalog, setSelectedPartCatalog }) {
  const hook = useServerPageTable({
    url:             PARTS_API,
    pageSize:        20,
    defaultSorting:  [{ id: "PartNumber", desc: false }],
    filtersToParams: (f) => ({ mode: "paginated", ...partFiltersToParams(f) }),
    sortToParams:    partSortToParams,
  });

  const { rowSelection, onRowSelectionChange } = usePartRowSelection(
    hook.data, selectedPartCatalog, setSelectedPartCatalog,
  );

  const filterStateRef = React.useRef({ columnFilters: hook.columnFilters, setColumnFilters: hook.setColumnFilters });
  filterStateRef.current = { columnFilters: hook.columnFilters, setColumnFilters: hook.setColumnFilters };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = React.useMemo(() => buildColumns(filterStateRef), []);

  return (
    <DataTable
      data={hook.data}
      columns={columns}
      loading={hook.loading}
      error={hook.error}
      sorting={hook.sorting}
      setSorting={hook.setSorting}
      columnFilters={hook.columnFilters}
      setColumnFilters={hook.setColumnFilters}
      potraitName="max-h-80"
      cellClassName="p-2"
      facetedFilter={false}
      enableMultiSelect
      getRowId={(row) => String(row.PartNumber)}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      serverPagination={{
        pageIndex:        hook.pageIndex,
        pageCount:        hook.pageCount,
        pageSize:         hook.pageSize,
        total:            hook.total,
        onPageChange:     hook.setPageIndex,
        onPageSizeChange: hook.setPageSize, // FIX B: was () => {} no-op before
      }}
    />
  );
}

// ── Virtual variant ───────────────────────────────────────────────────────────

function PartCatalogVirtual({ selectedPartCatalog, setSelectedPartCatalog }) {
  const hook = useServerVirtual({
    url:             PARTS_API,
    windowSize:      100,
    defaultSorting:  [{ id: "PartNumber", desc: false }],
    filtersToParams: (f) => ({ mode: "virtual", ...partFiltersToParams(f) }),
    sortToParams:    partSortToParams,
  });

  const { rowSelection, onRowSelectionChange } = usePartRowSelection(
    hook.data, selectedPartCatalog, setSelectedPartCatalog,
  );

  const filterStateRef = React.useRef({ columnFilters: hook.columnFilters, setColumnFilters: hook.setColumnFilters });
  filterStateRef.current = { columnFilters: hook.columnFilters, setColumnFilters: hook.setColumnFilters };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = React.useMemo(() => buildColumns(filterStateRef), []);

  return (
    <DataTable
      data={hook.data}
      columns={columns}
      loading={hook.loading}
      error={hook.error}
      sorting={hook.sorting}
      setSorting={hook.setSorting}
      columnFilters={hook.columnFilters}
      setColumnFilters={hook.setColumnFilters}
      potraitName="max-h-80"
      cellClassName="p-2"
      facetedFilter={false}
      enableMultiSelect
      paginationDisabled
      getRowId={(row) => String(row.PartNumber)}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      // FIX C: pass fetchMore directly; DataTable builds the sentinel observer
      virtual={{
        total:          hook.total,
        allLoaded:      hook.allLoaded,
        fetchMore:      hook.fetchMore,
        sentinelOffset: hook.sentinelOffset,
      }}
    />
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function PartCatalogTable({ selectedPartCatalog, setSelectedPartCatalog }) {
  const [mode, setMode] = React.useState("paginated");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={mode === "paginated" ? "default" : "outline"}
          onClick={() => setMode("paginated")}
        >
          Paginated
        </Button>
        <Button
          size="sm"
          variant={mode === "virtual" ? "default" : "outline"}
          onClick={() => setMode("virtual")}
        >
          Infinite Scroll
        </Button>
        <span className="text-xs text-muted-foreground ml-1">
          {mode === "paginated"
            ? "Server pagination — any page jump works"
            : "Append-on-demand — scroll to load more"}
        </span>
      </div>

      {mode === "paginated" ? (
        <PartCatalogPaginated
          key="paginated"
          selectedPartCatalog={selectedPartCatalog}
          setSelectedPartCatalog={setSelectedPartCatalog}
        />
      ) : (
        <PartCatalogVirtual
          key="virtual"
          selectedPartCatalog={selectedPartCatalog}
          setSelectedPartCatalog={setSelectedPartCatalog}
        />
      )}
    </div>
  );
}
