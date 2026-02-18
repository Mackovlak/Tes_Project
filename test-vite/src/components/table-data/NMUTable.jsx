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
import { NMUAdd, } from "../model/MastertabelAdd/NMUAdd"
import { NMUEdit } from "../model/MastertabelEdit/NMUEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function nmuColums(opts) {
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
            accessorKey: "NMUId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"NMU Id"}/>
            ),
        },
        {
            accessorKey: "NMUDesc",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"NMU Description"}/>
            ),
        },
        {
            accessorKey: "ItemNeeded",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Item Needed"}/>
            ),
            cell: ({ getValue }) => getValue() ? "Yes" : "No"
        },
        {
            accessorKey: "VersionNeeded",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Version Needed"}/>
            ),
            cell: ({ getValue }) => getValue() ? "Yes" : "No"
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"createdAt"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.NMUId
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

export function NmuTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selectedId, setSelectedId] = React.useState(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleteing] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchNMU = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/nmu`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch NMU data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchNMU()
    }, [fetchNMU, refresh])

    const HandleDeleteNMU = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleteing(true)
        try {
            await ApiCustomer.delete(`/api/nmu/${selectedId}`)
            toast.success("Delete NMU Success")
            fetchNMU()
            setSelectedId(null)
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Deleted Failed")            
        }finally {
            setIsDeleteing(false)
        }
    }, [selectedId, fetchNMU])

    const columns = React.useMemo(
        () => 
            nmuColums({
                onEdit: (id) => <NMUEdit NMUId={id}  onUpdate={fetchNMU}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSelectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchNMU]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 NMU Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search nmu..." loading={loading} handleRefresh={handleRefresh}>
                        <NMUAdd/>
                        <DataTableFacetedFilter
                        title={"All NMU Desc"}
                        column={table.getColumn("NMUDesc")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                onConfirm={HandleDeleteNMU}
                confirming={isDeleting}
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open)  setSelectedId(null)
                }}
                confirmLabel="Delete NMU"
                title={"Delete NMU"}
                description={"Are you sure want to delet nmu ?"}
            />
        </div>
    )
}
