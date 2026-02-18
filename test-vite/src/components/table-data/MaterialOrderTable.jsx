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

    const fetchMaterialOrder = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get("/api/mo-detaill")
        setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Material Order data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchMaterialOrder()
    }, [fetchMaterialOrder, refresh])

    const columns = React.useMemo(
        () => 
            MaterialOrderColums({
                onEdit: (id) => <MaterialOrderEdit MOID={id} onUpdate={fetchMaterialOrder}/>,
                onDelete: (id) => <MaterialOrderDelete MOID={id}/>
            }),
        [fetchMaterialOrder]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Material Order Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                cellName={"h-9"}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search material order..." loading={loading} handleRefresh={handleRefresh}>
                       <DataTableFacetedFilter
                        title={"All Order Status"}
                        column={table.getColumn("OrderStatus")}
                       />
                       <DataTableFacetedFilter
                        title={"All Order Type"}
                        column={table.getColumn("OrderType")}
                       />
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
