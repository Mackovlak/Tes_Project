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
import { ServiceCatalogAdd,} from "../model/sc-modal"
import { Trash } from "lucide-react"
import { ServiceCatalogEdit } from "../model/MastertabelEdit/ServiceCatalogEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function serviceCatalogColums(opts) {
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
            accessorKey: "ServiceCatalogID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Catalog ID"}/>
            ),
            cell: ({ getValue }) => {
                const rowCode = getValue()
                return (
                <Link to={`/app/service-log${rowCode}`}>
                    {rowCode}
                </Link>
                )
            }
        },
        {
            accessorKey: "AssetID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Asset ID"}/>
            ),
        },
        {
            accessorKey: "Service_offerID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Offer ID"}/>
            ),
        },
        {
            accessorKey: "PartNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Part Number"}/>
            ),
        },
        {
            accessorKey: "WarrantyStatus",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Warranty Status"}/>
            ),
        },
        {
            accessorKey: "Currency",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Currency"}/>
            ),
        },
        {
            accessorKey: "Price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Price"}/>
            ),
            cell: ({ getValue }) => getValue() ? parseFloat(getValue()).toFixed(2) : "-"
        },
        {
            accessorKey: "Tax",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Tax"}/>
            ),
            cell: ({ getValue }) => getValue() ? parseFloat(getValue()).toFixed(2) : "-"
        },
        {
            accessorKey: "Total",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Total"}/>
            ),
            cell: ({ getValue }) => getValue() ? parseFloat(getValue()).toFixed(2) : "-"
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.ServiceCatalogID
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

export function ServiceCatalogTable() {
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

    const fetchServiceCatalog = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/service-log`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch Service Catalog data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchServiceCatalog()
    }, [fetchServiceCatalog, refresh])

    const HandleServiceCatalogDelete = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/service-type/${selectedId}`)
            toast.success("Delete Service Catalog Success")
            fetchServiceCatalog()
            selectedId(null)
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Failed Delete Service Catalog")
        }finally{
           setIsDeleting(false) 
        }
    }, [selectedId, fetchServiceCatalog])

    const columns = React.useMemo(
        () => 
            serviceCatalogColums({
                onEdit: (id) => <ServiceCatalogEdit ServiceCatalogID={id}  onUpdate={fetchServiceCatalog}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSelectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchServiceCatalog]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Service Catalog Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search service catalog..." loading={loading} handleRefresh={handleRefresh}>
                        {/* <ServiceCatalogAdd/> */}
                        <DataTableFacetedFilter
                            title={"All Service offer ID"}
                            column={table.getColumn("Service_offerID")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                onConfirm={HandleServiceCatalogDelete}
                confirming={isDeleting}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) return setSelectedId(null)
                }}
                open={isDialogOpen}
                title={"Delete Service Catalog"}
                description={"Are you sure want to delete this Service Catalog ?"}
            />
        </div>
    )
}
