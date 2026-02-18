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
import { ProductEdit } from "../model/MastertabelEdit/ProductEdit"
import { ProductAdd } from "../model/MastertabelAdd/ProductAdd"
import { ProductImport } from "../importFileComponent/ProductImport"
import { ProductTemplateButton } from "../importFileComponent/ProductImport"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function productColums(opts) {
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
            accessorKey: "ProductNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Number"}/>
            ),
        },
        {
            accessorKey: "ProductLine",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Line"}/>
            ),
        },
        {
            accessorKey: "ProductName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Name"}/>
            ),
        },
        {
            accessorKey: "product_type.ProductType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Type"}/>
            ),
        },
        {
            accessorKey: "product_type.ProductGroup",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Group"}/>
            ),
        },
        {
            accessorKey: "product_type.ProductTower",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Tower"}/>
            ),
        },
        {
            accessorKey: "HWPC",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"HWPC"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.ProductNumber
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

export function ProductTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [selectedId, setSeletectedId] = React.useState()
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }
    const fetchProduct = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get("/api/product-information")
        setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Asset data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchProduct()
    }, [fetchProduct, refresh])

    const handleDeleteProduct = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            const res = await ApiCustomer.delete(`/api/product-information/${selectedId}`)
            toast.success("Product deleted successfully")
            fetchProduct()
            setIsDialogOpen(false)
            setSeletectedId(null)
        } catch (error) {
            toast.error("Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedId, fetchProduct])

    const columns = React.useMemo(
        () => 
            productColums({
                onEdit: (id) => <ProductEdit productNumber={id} onUpdate={fetchProduct}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSeletectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchProduct]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Product Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search product..." loading={loading} handleRefresh={handleRefresh}>
                        <ProductAdd/>
                        <ProductImport/>
                        <ProductTemplateButton/>
                        <DataTableFacetedFilter
                            title="All Product Number"
                            column={table.getColumn("ProductNumber")}
                        />
                        <DataTableFacetedFilter
                            title="All Product Name"
                            column={table.getColumn("ProductName")}
                        />
                        <DataTableFacetedFilter
                            title="All HWPC"
                            column={table.getColumn("HWPC")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                confirming={isDeleting}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSeletectedId(null)
                }}
                onConfirm={handleDeleteProduct}
                title={"Delete Product"}
                description={"Are you sure you want to delete this product"}
            />
        </div>
    )
}
