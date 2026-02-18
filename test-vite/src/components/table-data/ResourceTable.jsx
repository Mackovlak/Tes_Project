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
import { ResourceEdit } from "../model/MastertabelEdit/ResourceEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { Trash } from "lucide-react"
import { ResourceAdd } from "../model/MastertabelAdd/ResourceAdd"

function ResourceColums(opts) {
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
            accessorKey: "ResourceId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Resource ID"}/>
            ),
        },
        {
            accessorKey: "Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Name"}/>
            ),
        },
        {
            accessorKey: "ServiceCenterName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Center Name"}/>
            ),
        },
        {
            accessorKey: "ResourceCode",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Resource Code"}/>
            ),
        },
        {
            accessorKey: "ResourceLogo",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Logo"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    <img src={getValue()} alt="Resource Logo" className="h-8 mx-auto-object-contain" />
                )
            }
        },
        {
            accessorKey: "Phone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Phone"}/>
            ),
        },
        {
            accessorKey: "Mobile",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Mobile"}/>
            ),
            
        },
        {
            accessorKey: "Fax",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Fax"}/>
            ),
        },
        {
            accessorKey: "Email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Email"}/>
            ),
        },
        {
            accessorKey: "Country",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Country"}/>
            ),
        },
        {
            accessorKey: "StateProvince",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"StateProvince"}/>
            ),
             
        },
        {
            accessorKey: "City",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"City"}/>
            ),
             
        },
        {
            accessorKey: "ZipPostalCode",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Zip Postal Code"}/>
            ),
             
        },
        {
            accessorKey: "AddressLine",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Address Line"}/>
            ),
             
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.ResourceId
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

export function ResourceTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selectedId, setSelectedId] = React.useState()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)   
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }
    const fetchResource = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get("/api/resources")
        setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Resource data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchResource()
    }, [fetchResource, refresh])

    const HandleDeleteResource = React.useCallback(async ()=> {
        if (!selectedId) return;
        setIsDeleting(true);
        try {
            await ApiCustomer.delete(`/api/resources/${selectedId}`);
            toast.success("Resource deleted successfully");
            fetchResource();
            setSelectedId(null)
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete Resource");
        }finally {
            setIsDeleting(false);
        }
    }, [selectedId, fetchResource]);

    const columns = React.useMemo(
        () => 
            ResourceColums({
                onEdit: (id) => <ResourceEdit ResourceId={id} onUpdate={fetchResource}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setSelectedId(id);
                    setIsDialogOpen(true);
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchResource]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Resource Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search resource..." loading={loading} handleRefresh={handleRefresh}>
                        <ResourceAdd/>
                       <DataTableFacetedFilter
                        title={"All Resource"}
                        column={table.getColumn("ResourceId")}
                       />
                    </DataTableToolbar>
                )}
            />
        
            <ConfirmDialog
                onConfirm={HandleDeleteResource}
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelectedId(null)
                }}
                title="Delete Resource"
                description="Are you sure want to delete this resource? This action cannot be undone."
                confirming={isDeleting}
                confirmLabel="Delete Resource"
            />
        </div>
    )
}
