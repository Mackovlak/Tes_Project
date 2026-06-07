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
import { formatDate } from "@/lib/utils"
import { Link } from "react-router"
import { PartAdd } from "../model/MastertabelAdd/PartAdd"
import { PartEdit } from "../model/MastertabelEdit/PartEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { useServerPageTable } from "./config/data-use-table"

function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/service-log/parts-catalog", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

const fetchCatagory = makeFetch("Keyword");

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Parsers
// ─────────────────────────────────────────────────────────────────────────────
function partFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "Keyword":           p.keyword = v; break;
      default: break;
    }
  }
  return p;
}

function partSortToParams(s) {
  if (!s[0]) return { sortBy: "PartNumber", sortDir: "asc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}

function partColums(opts) {
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
            accessorKey: "PartNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Part Number"}/>
            ),
        },
        {
            accessorKey: "Keyword",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Category"}/>
            ),
        },
        {
            accessorKey: "PartDescription",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Part Description"}/>
            ),
        },
        {
            accessorKey: "Orderability",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Orderability"} ableToSort={false}/>
            ),
            cell: ({ getValue }) => {
                const rawOrderability = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawOrderability ? "bg-green-500" : "bg-red-500"}`}>{rawOrderability ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "RestrictionReason",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Restriction Reason"}/>
            ),
        },
        {
            accessorKey: "CSR_Flag",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"CSR Flag"} ableToSort={false}/>
            ),
             cell: ({ getValue }) => {
                const rawCSR_Flag = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawCSR_Flag ? "bg-green-500" : "bg-red-500"}`}>{rawCSR_Flag ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "ROHS_Flag",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"ROHS Flag"} ableToSort={false}/>
            ),
               cell: ({ getValue }) => {
                const rawROHS_Flag = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawROHS_Flag ? "bg-green-500" : "bg-red-500"}`}>{rawROHS_Flag ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "Returnable_Flag",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Returnable Flag"} ableToSort={false}/>
            ),
            cell: ({ getValue }) => {
                const rawReturnable_Flag = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawReturnable_Flag ? "bg-green-500" : "bg-red-500"}`}>{rawReturnable_Flag ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "HardRoll_Flag",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Hard Roll Flag"} ableToSort={false}/>
            ),
            cell: ({ getValue }) => {
                const rawHardRoll_Flag = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawHardRoll_Flag ? "bg-green-500" : "bg-red-500"}`}>{rawHardRoll_Flag ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "LithiumBattery_Flag",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Lithium Battery Flag"} ableToSort={false}/>
            ),
            cell: ({ getValue }) => {
                const rawLithiumBattery_Flag = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawLithiumBattery_Flag ? "bg-green-500" : "bg-red-500"}`}>{rawLithiumBattery_Flag ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "Heavy_Flag",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Heavy Flag"} ableToSort={false}/>
            ),
            cell: ({ getValue }) => {
                const rawHeavy_Flag = getValue()
                return (
                    <span className={`p-2 rounded-full flex justify-center items-center ${rawHeavy_Flag ? "bg-green-500" : "bg-red-500"}`}>{rawHeavy_Flag ? "Yes" : "No"}</span>
                )
            }
        },
        {
            accessorKey: "Price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Price"}/>
            ),
        },
        {
            accessorKey: "FreightPrice",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Freight Price"}/>
            ),
        },
        {
            accessorKey: "Tax",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Tax"}/>
            ),
        },
        {
            accessorKey: "Total",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Total"}/>
            ),
        },
        {
            accessorKey: "Shipping_Fee",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Shipping Fee"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.PartNumber
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

export function PartTable() {
    const [selectedId, setSelectedId] = React.useState(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const hook = useServerPageTable({
      url:               "/api/service-log/parts-catalog",
      pageSize:          20,
      defaultSorting:    [{ id: "PartNumber", desc: false }],
      filtersToParams:   partFiltersToParams,
      sortToParams:      partSortToParams,
      globalSearchParam: "search",
    });

    const HandleDeletePart = React.useCallback(async () => {
        try {
            await ApiCustomer.delete(`/api/service-log/parts-catalog/${selectedId}`)
            toast.success("Delete part success")
            hook.refresh()
            setIsDialogOpen(false)
            setSelectedId(null)
        } catch (error) {
            toast.error("Failed to delete Part")
        }finally {
            setIsDeleting(false)
        }
    },[selectedId, hook])

    const columns = React.useMemo(
        () => 
            partColums({
                onEdit: (id) => <PartEdit PartId={id}  onUpdate={hook.refresh}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setIsDialogOpen(true)
                    setSelectedId(id)
                }}>
                    <Trash/>
                </Button>
            }),
        [hook.refresh]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Part Management</h2>}
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
                  pageIndex:        hook.pageIndex,
                  pageCount:        hook.pageCount,
                  pageSize:         hook.pageSize,
                  total:            hook.total,
                  onPageChange:     hook.setPageIndex,
                  onPageSizeChange: hook.setPageSize,
                }}
                toolbar={(table, serverProps) => (
                    <DataTableToolbar table={table} searchPlaceholder=" Search part..." loading={hook.loading} handleRefresh={hook.refresh} total={hook.total} {...serverProps}>
                        <PartAdd/>
                        <DataTableFacetedFilter
                            mode="server"
                            title={"All Category"}
                            column={table.getColumn("Keyword")}
                            fetchOptions={fetchCatagory}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                confirming={isDeleting}
                onConfirm={HandleDeletePart}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) return setSelectedId(null)
                }}
                title={"Delete Part"}
                description="Are you sure you want to delete this part?"
                confirmLabel="Delete Part"
            />
        </div>
    )
}
