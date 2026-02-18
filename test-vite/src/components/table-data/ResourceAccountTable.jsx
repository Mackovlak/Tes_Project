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
import { ResourceAccountEdit } from "../model/MastertabelEdit/ResourceAccountEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { Trash } from "lucide-react"
import { ResourceAccountAdd } from "../model/MastertabelAdd/ResourceAccountAdd"


function ResourceAccountColums(opts) {
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
            accessorKey: "ResourceAccountId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Resource Account ID"}/>
            ),
        },
        {
            accessorKey: "Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Name"}/>
            ),
        },
        {
            accessorKey: "ResourceId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Resource Id"}/>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.ResourceAccountId
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

export function ResourceAccountTable() {
    const [data, setData] = React.useState([])
    const [resource, setResource] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selected, setSelected] = React.useState(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    const fetchAll = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const [accountRes, resourceRes] = await Promise.all([
            ApiCustomer.get("/api/resource-account"),
            ApiCustomer.get("/api/resources"),
        ])
        setData(accountRes.data.data)
        setResource(resourceRes.data.data)
        } catch (error) {
            toast.error("Failed to fetch Resource Account and Resource data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchAll()
    }, [fetchAll])

    const HandleDeleteResourceAccount = React.useCallback(async () => {
        if (!selected) return;
        setIsDeleting(true);
        try {
            await ApiCustomer.delete(`/api/resource-account/${selected}`);
            toast.success("Resource Account deleted successfully");
            fetchAll();
            setIsDialogOpen(false);
            setSelected(null);
        } catch (error) {
            toast.error("Failed to delete Resource Account");
        }finally {
            setIsDeleting(false);
        }
    }, [selected, fetchAll]);

    const columns = React.useMemo(
        () => 
            ResourceAccountColums({
                onEdit: (id) => <ResourceAccountEdit resourceAccountID={id} resources={resource} onUpdate={fetchAll}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSelected(id);
                    setIsDialogOpen(true);
                }}>

                    <Trash/>
                </Button>
            }),
        [fetchAll, resource]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Resource Account Management</h2>}
                data={data}
                columns={columns}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search resource account...">
                        <ResourceAccountAdd/>
                       <DataTableFacetedFilter
                        title={"All Resource"}
                        column={table.getColumn("ResourceId")}
                       />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                title="Delete Resource Account"
                description="Are you sure want to delete this Resource Account? This action cannot be undone."
                onConfirm={HandleDeleteResourceAccount}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelected(null)
                }} 
                confirming={isDeleting}
                confirmLabel="Delete Resource Account"
            />
        </div>
    )
}