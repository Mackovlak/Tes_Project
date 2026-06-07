"use client"

import * as React from "react"
import Swal from "sweetalert2"
import { toast } from "sonner"
import ApiCustomer from "@/api"
import { DataTableToolbar } from "./config/data-table-toolbar"
import { DataTableColumnHeader } from "./config/data-table-column-header"
import { DataTableFacetedFilter } from "./config/data-table-faceted-filter"
import { DataTable } from "./config/data-table"
import { useServerPageTable } from "./config/data-use-table" // Ensure this path is correct
import { Button } from "../ui/button"
import { formatDate } from "@/lib/utils"
import { AssetEdit } from "../model/MastertabelEdit/AssetEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { Trash } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Filter Fetchers (Mode: Distinct)
// ─────────────────────────────────────────────────────────────────────────────
function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/asset-information", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

const fetchSerialNumber = makeFetch("SerialNumber");
const fetchProductNumber = makeFetch("ProductNumber");

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Parsers
// ─────────────────────────────────────────────────────────────────────────────
function assetFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "SerialNumber":  p.SerialNumber = v; break;
      case "ProductNumber": p.ProductNumber = v; break;
      // Map other specific server-side filters here if needed
      default: break;
    }
  }
  return p;
}

function assetSortToParams(s) {
  if (!s[0]) return { sortBy: "SerialNumber", sortDir: "asc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Columns Definition
// ─────────────────────────────────────────────────────────────────────────────
function assetColums(opts) {
    return [
        {
            id: "no",
            header: () => <div className="text-center">No</div>,
            cell: ({ row, table }) => {
                const { pageIndex, pageSize } = table.getState().pagination;
                return (
                    <div className="text-center">
                        {pageIndex * pageSize + row.index + 1}
                    </div>
                )
            },
        }, 
        {
            accessorKey: "SerialNumber",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Serial Number"/>,
        },
        {
            accessorKey: "product_information.ProductName",
            id: "ProductName", // Give nested keys a clean ID for sorting/filtering
            header: ({ column }) => <DataTableColumnHeader column={column} title="Product Name"/>,
        },
        {
            accessorKey: "ProductNumber",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Product Number"/>,
        },
        {
            accessorKey: "product_information.ProductLine",
            id: "ProductLine",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Product Line"/>,
        },
        {
            id: "siteAccount",
            accessorFn: (row) => row.site_account?.Company ?? "",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Site Account"/>,
        },
        {
            id: "Contact",
            accessorFn: (row) => `${row.contact_information?.FirstName ?? ""} ${row.contact_information?.LastName ?? ""}`.trim(),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Contact"/>,
        },
        {
            accessorKey: "Warranty_Status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Warranty Status"/>,
        },
        {
            accessorKey: "EOW_Date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="EOW Date"/>,
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.AssetID
                return (
                    <div className="flex justify-center gap-2">
                        {opts.onEdit(id)}
                        {opts.onDelete(id)}
                    </div>
                )
            },
        },
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function AssetTable() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState()

    // 1. Replaced custom fetch loop with your custom hook
    const hook = useServerPageTable({
        url: "/api/asset-information",
        pageSize: 20,
        defaultSorting: [{ id: "SerialNumber", desc: false }],
        filtersToParams: assetFiltersToParams,
        sortToParams: assetSortToParams,
        globalSearchParam: "search",
    });

    const handleDeleteAsset = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/asset-information/${selectedId}`)
            toast.success("Asset deleted successfully")
            hook.refresh() // Use the hook's built-in refresh
            setIsDialogOpen(false)
            setSelectedId(null)
        } catch (error) {
            toast.error("Failed to delete Asset")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedId, hook])

    const columns = React.useMemo(
        () => 
            assetColums({
                onEdit: (id) => <AssetEdit assetId={id} onUpdate={hook.refresh}/>,
                onDelete: (id) =>
                   <Button 
                     variant="outline" 
                     className="text-red-500 hover:text-red-700" 
                     onClick={() => {
                       setIsDialogOpen(true) 
                       setSelectedId(id)
                     }} >
                     <Trash />
                   </Button>
            }),
        [hook.refresh]
    )

    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📦 Asset Information</h2>}
                data={hook.data}
                columns={columns}
                loading={hook.loading}
                error={hook.error}
                sorting={hook.sorting}
                setSorting={hook.setSorting}
                columnFilters={hook.columnFilters}
                setColumnFilters={hook.setColumnFilters}
                globalSearch={hook.globalSearch}
                onGlobalSearchChange={hook.setGlobalSearch}
                
                // 2. Pass server pagination props to the DataTable
                serverPagination={{
                    pageIndex:        hook.pageIndex,
                    pageCount:        hook.pageCount,
                    pageSize:         hook.pageSize,
                    total:            hook.total,
                    onPageChange:     hook.setPageIndex,
                    onPageSizeChange: hook.setPageSize,
                }}

                toolbar={(table, serverProps) => (
                    <DataTableToolbar 
                        table={table} 
                        searchPlaceholder=" Search asset..." 
                        loading={hook.loading} 
                        handleRefresh={hook.refresh}
                        total={hook.total}
                        {...serverProps}
                    >
                        {/* 3. Server-side dynamic autocomplete filters */}
                        <DataTableFacetedFilter
                            mode="server"
                            title="Serial Number"
                            column={table.getColumn("SerialNumber")}
                            fetchOptions={fetchSerialNumber}
                        />
                        <DataTableFacetedFilter
                            mode="server"
                            title="Product Number"
                            column={table.getColumn("ProductNumber")}
                            fetchOptions={fetchProductNumber}
                        />
                    </DataTableToolbar>
                )}
            />

            <ConfirmDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelectedId(null)
                }}
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete your asset."
                confirmLabel="Delete Asset"
                confirming={isDeleting} 
                onConfirm={handleDeleteAsset}
            />
        </div>
    )
}
