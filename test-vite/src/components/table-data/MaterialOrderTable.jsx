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
import { MaterialOrderDelete, MaterialOrderEdit } from "../model/sc-modal"
import { Link } from "react-router"
import { useServerPageTable } from "./config/data-use-table"

const MO_STATUS_OPTIONS = [
  { label: "New",                          value: "New" },
  { label: "Submitted",                         value: "Submitted" },
  { label: "Ordered",                     value: "Ordered" },
  { label: "Shipped",        value: "Shipped" },
  { label: "Closed",        value: "Closed" },
  { label: "Cancelled",                       value: "Cancelled" },
  { label: "BackOrdered",                      value: "BackOrdered" },
];

function materialorderFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    // Both modes store [value] — read first element
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "OrderStatus":    p.OrderStatus    = v; break;
      case "OrderType":  p.OrderType  = v; break;
      default: break;
    }
  }
  return p;
}

function materialorderSortToParams(s) {
  if (!s[0]) return { sortBy: "CreatedOn", sortDir: "desc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}
function MaterialOrderColums(opts) {
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
            accessorKey: "MOID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Material Order ID"}/>
            ),
            cell: ({ getValue }) => {
                return (
                   <Link to={`/app/material-order/${getValue()}`}>
                    {getValue()}
                   </Link>
                )
            }
        },
        {
            accessorKey: "WOID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Work Order ID"}/>
            ),
        },
        {
            accessorKey: "OrderNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Order Number"}/>
            ),
        },
        {
            accessorKey: "OrderStatus",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Order Status"}/>
            ),
        },
        {
            accessorKey: "OrderType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Order Type"}/>
            ),
        },
        {
            accessorKey: "CreatedOn",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"CreatedOn"}/>
            ),
            cell: ({getValue}) => formatDate(getValue())
        },
        {
            accessorKey: "SalesOrderNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Sales Order Number"}/>
            ),
        },
        {
            accessorKey: "RMANumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"RMA Number"}/>
            ),
        },
        {
            accessorKey: "ReadyForClosureDate",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Ready For Closure Date"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "Owner",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Owner"}/>
            ),
        },
        // {
        //     id: "actions",
        //     header: () => <div className="text-center">Actions</div>,
        //     cell: ({ row }) => {
        //         const id = row.original.MOID
        //     return (
        //         <div className="flex justify-center gap-2">
        //             {opts.onEdit(id)}
        //             {opts.onDelete(id)}
        //         </div>
        //     )
        //     },
        // },
    ]
}

export function MaterialOrderTable() {

  const hook = useServerPageTable({
    url:               "/api/mo-detaill",
    pageSize:          20,
    defaultSorting:    [{ id: "CreatedOn", desc: true }],
    filtersToParams:   materialorderFiltersToParams,
    sortToParams:      materialorderSortToParams,
    globalSearchParam: "search",
  });

  const columns   = React.useMemo(() => MaterialOrderColums(), []);

    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Material Order Management</h2>}
                data={hook.data}
                columns={columns}
                sorting={hook.sorting}
                setSorting={hook.setSorting}
                handleRefresh={hook.refresh}
                cellClassName={"h-9"}
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
                    <DataTableToolbar table={table} searchPlaceholder=" Search material order..." loading={hook.loading} handleRefresh={hook.refresh} total={hook.total} {...serverProps}>
                       <DataTableFacetedFilter
                        mode="server"
                        title={"All Order Status"}
                        column={table.getColumn("OrderStatus")}
                        options={MO_STATUS_OPTIONS}
                       />
                       {/* <DataTableFacetedFilter */}
                       {/*  title={"All Order Type"} */}
                       {/*  column={table.getColumn("OrderType")} */}
                       {/* /> */}
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
