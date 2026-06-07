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
import { useServerPageTable } from "./config/data-use-table"

function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/user", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

const fetchRole = makeFetch("Role");
const fetchResource = makeFetch("Name");

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Parsers
// ─────────────────────────────────────────────────────────────────────────────
function userFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "Role":           p.role = v; break;
      case "Resource":        p.resourceName = v; break;
      default: break;
    }
  }
  return p;
}

function userSortToParams(s) {
  if (!s[0]) return { sortBy: "CreatedAt", sortDir: "asc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}

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
    const [selecetedId, setSelectedId] = React.useState(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    const hook = useServerPageTable({
      url:               "/api/user",
      pageSize:          20,
      defaultSorting:    [{ id: "CreatedAt", desc: true }],
      filtersToParams:   userFiltersToParams,
      sortToParams:      userSortToParams,
      globalSearchParam: "search",
    });

    const HandleDeleteUser = React.useCallback(async () => {
        if (!selecetedId) return;
        setIsDeleting(true);
        try {
            const res = await ApiCustomer.delete(`/api/user/${selecetedId}`);
            toast.success("User deleted successfully");
            hook.refresh();
            setIsDialogOpen(false);
            setSelectedId(null);
        } catch (error) {
            toast.error("Failed to delete User");
        } finally {
            setIsDeleting(false);
        }
    }, [selecetedId, hook]);

    const columns = React.useMemo(
        () => 
            usersColums({
                onEdit: (id) => <UsersEdit UserId={id} onUpdate={hook.refresh}/>,
                onDelete: (id) => <Button className={"text-red-500 hover:text-red-700"} variant={"outline"} onClick={() => {
                    setSelectedId(id)
                    setIsDialogOpen(true)
                }}>
                    <Trash/>
                </Button>
            }),
        [hook.refresh]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 User Management</h2>}
                data={hook.data}
                columns={columns}
                sorting={hook.sorting}
                setSorting={hook.setSorting}
                handleRefresh={hook.refresh}
                loading={hook.loading}
                error={hook.error}
                columnFilters={hook.columnFilters}
                setColumnFilters={hook.setColumnFilters}
                globalSearch={hook.globalSearch}
                onGlobalSearchChange={hook.setGlobalSearch}
                serverPagination={{
                  pageIndex:        hook.pageIndex,
                  pageCount:        hook.pageCount,
                  pageSize:         hook.pageSize,
                  total:            hook.total,
                  onPageChange:     hook.setPageIndex,
                  onPageSizeChange: hook.setPageSize,
                }}
                toolbar={(table, serverProps) => (
                    <DataTableToolbar table={table} searchPlaceholder=" Search user..." loading={hook.loading} handleRefresh={hook.refresh} total={hook.total} {...serverProps}>
                        <UserAdd/>
                        <DataTableFacetedFilter
                            mode="server"
                            title={"All Role"}
                            column={table.getColumn("Role")}
                            fetchOptions={fetchRole}
                        />
                        <DataTableFacetedFilter
                            mode="server"
                            title={"All Resources"}
                            column={table.getColumn("Resource")}
                            fetchOptions={fetchResource}
                        />
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
