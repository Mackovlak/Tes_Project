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
import { ProductTypeEdit } from "../model/MastertabelEdit/ProductTypeEdit"
import { ProductTypeAdd } from "../model/MastertabelAdd/ProductTypeAdd"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function productTypeColums(opts) {
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
            accessorKey: "ProductTower",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Tower"}/>
            ),
        },
        {
            accessorKey: "ProductGroup",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Group"}/>
            ),
        },
        {
            accessorKey: "ProductType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Type"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.ProductTypeID
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

export function ProductTypeTable() {
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

    const fetchProductType = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get("/api/product-type")
        setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Product Type data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchProductType()
    }, [fetchProductType, refresh])

    const handleDeleteProductType = React.useCallback(async () => { 
        if (!selectedId) return
        setIsDeleting(true)
        try {
             const res = await ApiCustomer.delete(`/api/product-type/${selectedId}`)
             toast.success("Product Type deleted successfully")
             fetchProductType()
             setIsDialogOpen(false)
             setSeletectedId(null)
        } catch (error) {
            toast.error("Failed to delete Product Type")
        } finally {
            setIsDeleting(false)
        }
    })   

    const columns = React.useMemo(
        () => 
            productTypeColums({
                onEdit: (id) => <ProductTypeEdit productTypeID={id} onUpdate={fetchProductType}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSeletectedId(id)
                    setIsDialogOpen(true)
                }}>    
                <Trash/>
                </Button>
            }),
        [fetchProductType]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Product Type Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search product..." loading={loading} handleRefresh={handleRefresh}>
                        <ProductTypeAdd/>
                        <DataTableFacetedFilter
                            title={"All Product Tower"}
                            column={table.getColumn("ProductTower")}
                        />
                        <DataTableFacetedFilter
                            title={"All Product Group"}
                            column={table.getColumn("ProductGroup")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Delete Product Type"
                description="Are you sure you want to delete this product type?"
                onConfirm={handleDeleteProductType}
                isPending={isDeleting}
            />
        </div>
    )
}
