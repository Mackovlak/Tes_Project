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
import { OTCCodeAdd } from "../model/MastertabelAdd/OTCCodeAdd"
import { OTCCodeEdit } from "../model/MastertabelEdit/OTCCodeEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function otcCodeColums(opts) {
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
            accessorKey: "OTCCode",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"OTC Code"}/>
            ),
        },
        {
            accessorKey: "Description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Description"}/>
            ),
        },
        {
            accessorKey: "WarrantyCondition",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Warranty Condition"}/>
            ),
        },
        {
            accessorKey: "CreatedOn",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"CreatedOn"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.OTCCode
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

export function OTCCodeTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selecterdId, setSelectedId] = React.useState(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchOTCCode = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/otc-code`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch OTC Code data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchOTCCode()
    }, [fetchOTCCode, refresh])

    const HandleDeleteOTCCode = React.useCallback(async () => {
        if (!selecterdId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/otc-code/${selecterdId}`)
            toast.success("Delete OTC Code Success")
            fetchOTCCode()
            setSelectedId(null)
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Delete Failed OTC code")
        }finally {
            setIsDeleting(false)
        }
    },[selecterdId, fetchOTCCode])

    const columns = React.useMemo(
        () => 
            otcCodeColums({
                onEdit: (id) => <OTCCodeEdit OTCCode={id}  onUpdate={fetchOTCCode}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setIsDialogOpen(true)
                    setSelectedId(id)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchOTCCode]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 OTC Code Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search otc code..." loading={loading} handleRefresh={handleRefresh}>
                        <OTCCodeAdd/>
                        <DataTableFacetedFilter
                            title={"All Warranty"}
                            column={table.getColumn("WarrantyCondition")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                onConfirm={HandleDeleteOTCCode}
                confirming={isDeleting}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) return setSelectedId(null)
                }}
                open={isDialogOpen}
                title={"Delete OTC Code"}
                description={"Are you sure want to delete OTC code ? "}
                confirmLabel="Delete OTC Code"
            />
        </div>
    )
}
