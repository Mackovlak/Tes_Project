"use client"

import * as React from "react"
import Swal from "sweetalert2"
import { toast } from "sonner"
import ApiCustomer from "@/api"
import { DataTableToolbar } from "./config/data-table-toolbar"
import { DataTableColumnHeader } from "./config/data-table-column-header"
import { DataTablePagination } from "./config/data-table-pagination"
import { DataTableFacetedFilter } from "./config/data-table-faceted-filter"
import { DataTable } from "./config/data-table"
import { Button } from "../ui/button"
import { ProductEdit } from "../model/MastertabelEdit/ProductEdit"
import { ProductAdd } from "../model/MastertabelAdd/ProductAdd"
import { ProductImport } from "../importFileComponent/ProductImport"
import { ProductTemplateButton } from "../importFileComponent/ProductImport"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { useServerPageTable } from "./config/data-use-table"


function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/product-information", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

// Creating fetchers for your specific table filters
const fetchProductNumber = makeFetch("ProductNumber");
const fetchProductName = makeFetch("ProductName");
const fetchHWPC = makeFetch("HWPC");

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Parsers
// ─────────────────────────────────────────────────────────────────────────────
function productFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "ProductNumber": p.ProductNumber = v; break;
      case "ProductName":       p.ProductName = v; break;
      case "HWPC":          p.HWPC = v; break;
      default: break;
    }
  }
  return p;
}

function productSortToParams(s) {
  if (!s[0]) return { sortBy: "ProductNumber", sortDir: "asc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}


function productColums(opts) {
    return [
        {
            id: "no",
            header: () => <div className="text-center">No</div>,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex
                const pageSize  = table.getState().pagination.pageSize
                return (
                    <div className="text-center">
                        {pageIndex * pageSize + row.index + 1}
                    </div>
                )
            },
        }, 
        {
            accessorKey: "ProductNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Number"}/>
            ),
        },
        {
            accessorKey: "ProductLine",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Line"}/>
            ),
        },
        {
            accessorKey: "ProductName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Name"}/>
            ),
        },
        {
            accessorKey: "product_type.ProductType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Type"}/>
            ),
        },
        {
            accessorKey: "product_type.ProductGroup",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Group"}/>
            ),
        },
        {
            accessorKey: "product_type.ProductTower",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Tower"}/>
            ),
        },
        {
            accessorKey: "HWPC",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"HWPC"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.ProductNumber
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

export function ProductTable() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [selectedId, setSeletectedId] = React.useState()

    const hook = useServerPageTable({
        url: "/api/product-information",
        pageSize: 20,
        defaultSorting: [{ id: "ProductNumber", desc: false }],
        filtersToParams: productFiltersToParams,
        sortToParams: productSortToParams,
        globalSearchParam: "search",
    });

    const handleDeleteProduct = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            const res = await ApiCustomer.delete(`/api/product-information/${selectedId}`)
            toast.success("Product deleted successfully")
            hook.refresh
            setIsDialogOpen(false)
            setSeletectedId(null)
        } catch (error) {
            toast.error("Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedId, hook])

    const columns = React.useMemo(
        () => 
            productColums({
                onEdit: (id) => <ProductEdit productNumber={id} onUpdate={hook.refresh}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSeletectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [hook.refresh]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Product Management</h2>}
                data={hook.data}
                columns={columns}
                sorting={hook.sorting}
                setSorting={hook.setSorting}
                handleRefresh={hook.refresh}
                loading={hook.loading}
                error={hook.error}
                columnFilters={hook.columnFilters}
                setColumnFilters={hook.setColumnFilters}
                globalSearch={hook.globalSearch}
                onGlobalSearchChange={hook.setGlobalSearch}
                serverPagination={{
                  pageIndex: hook.pageIndex,
                  pageCount: hook.pageCount,
                  pageSize: hook.pageSize,
                  total: hook.total,
                  onPageChange: hook.setPageIndex,
                  onPageSizeChange: hook.setPageSize,
                }}
                toolbar={(table, serverProps) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search product..." loading={hook.loading} handleRefresh={hook.refresh} total={hook.total} {...serverProps}>
                        <ProductAdd/>
                        <ProductImport/>
                        <ProductTemplateButton/>
                        <DataTableFacetedFilter
                            mode="server"
                            title="All Product Number"
                            column={table.getColumn("ProductNumber")}
                            fetchOptions={fetchProductNumber}
                        />
                        <DataTableFacetedFilter
                            mode="server"
                            title="All Product Name"
                            column={table.getColumn("ProductName")}
                            fetchOptions={fetchProductName}
                        />
                        <DataTableFacetedFilter
                            mode="server"
                            title="All HWPC"
                            column={table.getColumn("HWPC")}
                            fetchOptions={fetchHWPC}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                confirming={isDeleting}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSeletectedId(null)
                }}
                onConfirm={handleDeleteProduct}
                title={"Delete Product"}
                description={"Are you sure you want to delete this product"}
            />
        </div>
    )
}
