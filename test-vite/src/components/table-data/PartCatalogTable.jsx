import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DataTable } from "./config/data-table"
import { DataTableColumnHeader } from "./config/data-table-column-header"
import { DataTableToolbar } from "./config/data-table-toolbar"
import { Button }    from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { DataTableFacetedFilter } from "./config/data-table-faceted-filter"






// ── Column factory ────────────────────────────────────────────────────────────

function buildColumns() {
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
      header: ({ column }) => <DataTableColumnHeader id="PartNumber" title="Part #"  column={column}/>,
    },
    {
      accessorKey: "Keyword",
      header: ({ column }) => <DataTableColumnHeader id="Keyword" title="Keyword"  column={column}/>,
    },
    {
      accessorKey: "PartDescription",
      header: ({ column }) => <DataTableColumnHeader id="PartDescription" title="Description"  column={column}/>,
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



// ── Paginated variant ─────────────────────────────────────────────────────────

export function PartCatalogPaginated({ selectedPartCatalog, setSelectedPartCatalog, hook, fetchFilter }) {

  const { rowSelection, onRowSelectionChange } = usePartRowSelection(
    hook.data, selectedPartCatalog, setSelectedPartCatalog,
  );


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = React.useMemo(() => buildColumns(), []);

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
      containerClassName="max-h-55"
      cellClassName="p-2"
      facetedFilter={false}
      enableMultiSelect
      getRowId={(row) => String(row.PartNumber)}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      globalSearch={hook.globalSearch}
      onGlobalSearchChange={hook.setGlobalSearch}
      serverPagination={{
        pageIndex:        hook.pageIndex,
        pageCount:        hook.pageCount,
        pageSize:         hook.pageSize,
        total:            hook.total,
        onPageChange:     hook.setPageIndex,
        onPageSizeChange: hook.setPageSize, // FIX B: was () => {} no-op before
      }}
      toolbar={(table, serverProps) => (
        <DataTableToolbar table={table} searchPlaceholder=" Search erf cases..." loading={hook.loading}  handleRefresh={hook.refresh} total={hook.total} {...serverProps}>
           <DataTableFacetedFilter
               mode="server"
               title={"All Category"}
               column={table.getColumn("Keyword")}
               fetchOptions={fetchFilter.Category}
               portal={false}
           />
        </DataTableToolbar>
      )}
    />
  );
}
