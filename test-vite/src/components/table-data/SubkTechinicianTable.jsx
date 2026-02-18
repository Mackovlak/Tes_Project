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
import { SubkTechnicianAdd,} from "../model/MastertabelAdd/SubkTechnicianAdd"
import { SubkTechnicianEdit } from "../model/MastertabelEdit/SubkTechnicianEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"


function subkTechnicianColums(opts) {
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
            accessorKey: "SubkTechnicianId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Subk Technician ID"}/>
            ),
        },
        {
            accessorKey: "Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Name"}/>
            ),
        },
        {
            accessorKey: "resourceAccount.Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Name Resource Account"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.SubkTechnicianId
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

export function SubkTechnicianTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selectedId, setSelectedId] = React.useState(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchSubkTechinician = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/subk-technician`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch SubkTechnician data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchSubkTechinician()
    }, [fetchSubkTechinician, refresh])

    const HandleDeleteSubkTechnician = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/subk-technician/${selectedId}`)
            toast.success("SubkTechnician deleted successfully")
            fetchSubkTechinician()
            setIsDialogOpen(false)
            setSelectedId(null)
        } catch (error) {
            toast.error("Failed to delete SubkTechnician")
        }finally {
            setIsDeleting(false)
        }
    },[selectedId, fetchSubkTechinician])

    const columns = React.useMemo(
        () => 
            subkTechnicianColums({
                onEdit: (id) => <SubkTechnicianEdit subkTechnicianId={id}  onUpdate={fetchSubkTechinician}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSelectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchSubkTechinician]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Subk Technician Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search subktechnician..." loading={loading} handleRefresh={handleRefresh}>
                        <SubkTechnicianAdd/>
                       <DataTableFacetedFilter
                        title={"All Subktechnician"}
                        column={table.getColumn("SubkTechnicianId")}
                       />
                       <DataTableFacetedFilter
                        title={"All Name"}
                        column={table.getColumn("Name")}
                       />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                title="Delete Subk Technician"
                description="Are you sure you want to delete this Subk Technician?"
                onConfirm={HandleDeleteSubkTechnician}
                confirming={isDeleting}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelectedId(null)
                }} 
                confirmLabel="Delete Subk Technician"
            />
        </div>
    )
}
