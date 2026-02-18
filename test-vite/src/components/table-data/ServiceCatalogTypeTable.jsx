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
import { ServiceCatalogTypeAdd } from "../model/MastertabelAdd/ServiceCatalogTypeAdd"
import { ServiceTypeEdit } from "../model/MastertabelEdit/ServiceCatalogTypeEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function serviceCatalogTypeColums(opts) {
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
            accessorKey: "ServiceTypeId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Type Id"}/>
            ),
        },
        {
            accessorKey: "ServiceTypeName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Type Name"}/>
            ),
        },
        {
            accessorKey: "ProblemCategory",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Problem Category"}/>
            ),
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
                const id = row.original.ServiceTypeId
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

export function ServiceCatalogTypeTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selectedId, setSelectedId] = React.useState(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchServiceCatalogType = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/service-type`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch Service Catalog Type data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchServiceCatalogType()
    }, [fetchServiceCatalogType, refresh])

    const HandleDeleteServiceCatalogType = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/service-type/${selectedId}`);
            toast.success("Delete Service Catalog Type Success")
            fetchServiceCatalogType()
            setSelectedId(null)
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Delete Failed Service Catalog Type ")
        }finally {
            setIsDeleting(false)
        }
    },[selectedId, fetchServiceCatalogType])

    const columns = React.useMemo(
        () => 
            serviceCatalogTypeColums({
                onEdit: (id) => <ServiceTypeEdit ServiceTypeId={id}  onUpdate={fetchServiceCatalogType}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setIsDialogOpen(true)
                    setSelectedId(id)
                }}
                >
                    <Trash/>
                </Button>
            }),
        [fetchServiceCatalogType]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Service Catalog Type Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search service catalog type..." loading={loading} handleRefresh={handleRefresh}>
                        <ServiceCatalogTypeAdd/>
                        <DataTableFacetedFilter
                            title={"All Problem Category"}
                            column={table.getColumn("ProblemCategory")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                onConfirm={HandleDeleteServiceCatalogType}
                confirming={isDeleting}
                confirmLabel="Delete Service Catalog Type"
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) return setSelectedId(null)
                }}
                title={"Delete Service Catalog Type"}
                description={"Are you sure want to delete Service Catalog Type ? "}
            />
        </div>
    )
}
