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
import { WorkOrderDelete, WorkOrderEdit } from "../model/sc-modal"
import { useServerPageTable } from "./config/data-use-table"

const WO_STATUS_OPTIONS = [
  { label: "OPEN_UNSCHEDULED",           value: "OPEN_UNSCHEDULED" },
  { label: "OPEN_SCHEDULED",     value: "OPEN_SCHEDULED" },
  { label: "OPEN_COMPLETED",       value: "OPEN_COMPLETED" },
  { label: "REPAIR_PROGRESS",       value: "REPAIR_PROGRESS" },
  { label: "CLOSED_POSTED",        value: "CLOSED_POSTED" },
  { label: "CLOSED_CANCELLED",        value: "CLOSED_CANCELLED" },
];

function workorderFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    // Both modes store [value] — read first element
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "SystemStatus":    p.SystemStatus    = v; break;
      default: break;
    }
  }
  return p;
}

function workorderSortToParams(s) {
  if (!s[0]) return { sortBy: "CreatedOn", sortDir: "desc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}
function WorkOrderColums(opts) {
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
            accessorKey: "WOID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Work Order ID"}/>
            ),
            cell: ({ getValue }) => {
                return (
                   <Link to={`/app/work/${getValue()}`}>
                    {getValue()}
                   </Link>
                )
            }
        },
        {
            accessorKey: "CaseID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case ID"}/>
            ),
        },
        {
            accessorKey: "WorkOrderType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Work Order Type"}/>
            ),
        },
        {
            accessorKey: "SystemStatus",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"System Status"}/>
            ),
        },
        {
            accessorKey: "ShipmentCountry",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Shipment Country"}/>
            ),
        },
        {
            accessorKey: "ShipmentState",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Shipment State"}/>
            ),
        },
        {
            accessorKey: "CreatedOn",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"RMA Number"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "owner.Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Owner"}/>
            ),
        },
        {
            accessorKey: "DueDateCustomer",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Due Date Customer"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "OTCCode",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"OTC Code"}/>
            ),
        },
        {
            accessorKey: "RequestedDateTimeCustomer",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Requested Date Time Customer"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "GuaranteedFixTimeCustomer",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Guaranteed Fix Time Customer"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "EarlyStartDateTimeCustomer",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Early Start Date Time Customer"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "LatestStartDateTimeCustomer",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Latest Start DateT ime Customer"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "ActiveScheduleDate",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Active Schedule Date"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "CasePriorityIndex",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case Priority"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        // {
        //     id: "actions",
        //     header: () => <div className="text-center">Actions</div>,
        //     cell: ({ row }) => {
        //         const id = row.original.WOID
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

export function WorkOrderTable() {
  const hook = useServerPageTable({
    url:               "/api/work-order",
    pageSize:          20,
    defaultSorting:    [{ id: "CreatedOn", desc: true }],
    filtersToParams:   workorderFiltersToParams,
    sortToParams:      workorderSortToParams,
    globalSearchParam: "search",
  });

  const columns   = React.useMemo(() => WorkOrderColums(), []);

    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Work Order Management</h2>}
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
                    <DataTableToolbar table={table} searchPlaceholder=" Search work order..." loading={hook.loading} handleRefresh={hook.refresh} {...serverProps}>
                       <DataTableFacetedFilter
                        mode="server"
                        title={"All System Status"}
                        column={table.getColumn("SystemStatus")}
                        options={WO_STATUS_OPTIONS}
                       />
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
