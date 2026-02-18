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
import { UserAdd,} from "../model/MastertabelAdd/UserAdd"
import { UsersEdit } from "../model/MastertabelEdit/UserEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { UserImport, UserTemplateButton } from "../importFileComponent/UserImport"

function usersColums(opts) {
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
            accessorKey: "IDUser",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"ID User"}/>
            ),
        },
        {
            accessorKey: "Email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Email"}/>
            ),
        },
        {
            accessorKey: "Username",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Username"}/>
            ),
        },
        {
            accessorKey: "Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Name"}/>
            ),
        },
        {
            accessorKey: "Role",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Role"}/>
            ),
        },
        {
            id: "Resource",
            accessorKey: "resource.Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Resource"}/>
            ),
        },
        {
            accessorKey: "Phone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Phone"}/>
            ),
        },
        {
            accessorKey: "Signature",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Signature"}/>
            ),
            cell: ({ getValue }) => {
                const rowSignature = getValue()
                return rowSignature ? (
                    <img src={rowSignature} alt="Signature" className="w-10 h-10"/>
                ) : (
                    "No Signature"
                ) 
            }
        },
        {
            accessorKey: "ProfilePhoto",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Photo"}/>
            ),
            cell: ({ getValue }) => {
                const rowPhoto = getValue()
                return rowPhoto ? (
                    <img src={`${import.meta.env.VITE_API_BASE_URL}${rowPhoto}`} alt="Profile" className="w-10 h-10 object-cover rounded-full "/>
                ) : (
                    "No Photo"
                )
            }
        },
        {
            accessorKey: "CreatedAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"CreatedAt"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "UpdatedAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"UpdatedAt"}/>
            ),
             cell: ({ getValue }) => formatDate(getValue())
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.IDUser
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

export function UsersTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selecetedId, setSelectedId] = React.useState(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchUsers = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/user`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch User data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchUsers()
    }, [fetchUsers, refresh])

    const HandleDeleteUser = React.useCallback(async () => {
        if (!selecetedId) return;
        setIsDeleting(true);
        try {
            const res = await ApiCustomer.delete(`/api/user/${selecetedId}`);
            toast.success("User deleted successfully");
            fetchUsers();
            setIsDialogOpen(false);
            setSelectedId(null);
        } catch (error) {
            toast.error("Failed to delete User");
        } finally {
            setIsDeleting(false);
        }
    }, [selecetedId, fetchUsers]);

    const columns = React.useMemo(
        () => 
            usersColums({
                onEdit: (id) => <UsersEdit UserId={id} onUpdate={fetchUsers}/>,
                onDelete: (id) => <Button className={"text-red-500 hover:text-red-700"} variant={"outline"} onClick={() => {
                    setSelectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchUsers]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 User Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search user..." loading={loading} handleRefresh={handleRefresh}>
                        <UserAdd/>
                        <DataTableFacetedFilter
                            title={"All Role"}
                            column={table.getColumn("Role")}
                        />
                        <DataTableFacetedFilter
                            title={"All Resources"}
                            column={table.getColumn("Resource")}
                        />
                      <UserImport/>
                      <UserTemplateButton/>
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
                open={isDialogOpen}
                title="Delete User"
                description="Are you sure you want to delete this user?"
                onConfirm={HandleDeleteUser}
                confirming={isDeleting}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelectedId(null)
                }} 
                confirmLabel="Delete User"
            />
        </div>
    )
}
