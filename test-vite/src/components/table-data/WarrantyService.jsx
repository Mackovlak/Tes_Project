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
import { WarrantyServiceEdit } from "../model/MastertabelEdit/WarrantyServiceEdit"
import { WarrantyServiceAdd } from "../model/MastertabelAdd/WarrantyServiceAdd"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function warrantyServiceColums(opts) {
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
            accessorKey: "Service_offerID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Offer ID"}/>
            ),
        },
        {
            accessorKey: "Service_description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Description"}/>
            ),
        },
        {
            accessorKey: "CTat_RTime",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"CTat RTime"}/>
            ),
        },
        {
            accessorKey: "Price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Price"}/>
            ),
        },
        {
            accessorKey: "Shipping_Fee",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Shipping Fee"}/>
            ),
        },
        {
            accessorKey: "qty_ws",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"QTY"}/>
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
            accessorKey: "WarrantyCondition",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Warranty Condition"}/>
            ),
            cell: ({ getValue}) => {
                const val = getValue()
                return (
                    <span>{val === "InWarranty" ? "In Warranty" : val === "OutWarranty" ? "Out of Warranty" : ""}</span>
                )
            }
        },
        {
            accessorKey: "CaseTypeServices",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case Type Services"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.Service_offerID
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

export function WarrantyServiceTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selectedId, setSeletectedId] = React.useState(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }
    const fetchWarrantyService = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get("/api/warranty-services")
        setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Warranty Servuce data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchWarrantyService()
    }, [fetchWarrantyService, refresh])

    const HandleDeleteWarrantyCondition = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/warranty-services/${selectedId}`)
            toast.success("Warranty Service deleted successfully")
            fetchWarrantyService()
            setIsDialogOpen(false)
            setSeletectedId(null)
        } catch (error) {
             toast.error("Failed to delete Warranty Service")   
        }finally {
            setIsDeleting(false)
        }
    }, [selectedId, fetchWarrantyService])

    const columns = React.useMemo(
        () => 
            warrantyServiceColums({
                onEdit: (id) => <WarrantyServiceEdit Service_offerID={id} onUpdate={fetchWarrantyService}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSeletectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchWarrantyService]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Warranty Service Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search product..." loading={loading} handleRefresh={handleRefresh}>
                        <WarrantyServiceAdd/>
                       <DataTableFacetedFilter
                        title={"All Case Type"}
                        column={table.getColumn("CaseTypeServices")}
                       />
                       <DataTableFacetedFilter
                        title={"All Warranty Condition"}
                        column={table.getColumn("WarrantyCondition")}
                       />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Delete Warranty Service"
                description="Are you sure you want to delete this warranty service?"
                onConfirm={HandleDeleteWarrantyCondition}
                confirming={isDeleting}
            />
        </div>
    )
}
