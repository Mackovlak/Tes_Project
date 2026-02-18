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
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [sorting, setSorting] = React.useState([
        {
            id: "CreatedOn",
            desc:true
        }
    ])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchWorkOrder = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get("/api/work-order")
        setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Work Order data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchWorkOrder()
    }, [fetchWorkOrder, refresh])

    const columns = React.useMemo(
        () => 
            WorkOrderColums({
                onEdit: (id) => <WorkOrderEdit WOID={id} onUpdate={fetchWorkOrder}/>,
                onDelete: (id) => <WorkOrderDelete WOID={id}/>
            }),
        [fetchWorkOrder]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Work Order Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                cellName={"h-9"}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search work order..." loading={loading} handleRefresh={handleRefresh}>
                       <DataTableFacetedFilter
                        title={"All System Status"}
                        column={table.getColumn("SystemStatus")}
                       />
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
