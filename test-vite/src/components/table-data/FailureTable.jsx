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
import { FailureAdd } from "../model/MastertabelAdd/FailureAdd"
import { FailureEdit } from "../model/MastertabelEdit/FailureEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function failureColums(opts) {
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
            accessorKey: "FailureId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Failure Id"}/>
            ),
        },
        {
            accessorKey: "Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Name"}/>
            ),
        },
        {
            accessorKey: "Description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Description"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.FailureId
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

export function FailureTable() {
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

    const fetchFailure = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/failure`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch Failure data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchFailure()
    }, [fetchFailure, refresh])

    const HandleDeleteFailure = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleteing(true)
        try {
            await ApiCustomer.delete(`/api/failure/${selectedId}`)
            toast.success("Delete Failure Success")
            fetchFailure()
            setSelectedId(null)
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Delete Failed")
        }finally{
            setIsDeleteing(false)
        }
    },[selectedId, fetchFailure])

    const columns = React.useMemo(
        () => 
            failureColums({
                onEdit: (id) => <FailureEdit FailureId={id}  onUpdate={fetchFailure}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setIsDialogOpen(true)
                    setSelectedId(id)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchFailure]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Failure Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search nmu..." loading={loading} handleRefresh={handleRefresh}>
                        <FailureAdd/>
                        <DataTableFacetedFilter
                            title={"All Name"}
                            column={table.getColumn("Name")}
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
            confirming={isDeleting}
            onConfirm={HandleDeleteFailure}
            title={"Delete Failure"}
            confirmLabel="Delete Failure"
            description={"Are you sure want to delete Failure ?"}
            />
        </div>
    )
}
