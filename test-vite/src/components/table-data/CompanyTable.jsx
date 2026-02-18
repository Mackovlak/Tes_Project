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
import { CompanyEdit } from "../model/MastertabelEdit/CompanyEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { Trash } from "lucide-react"

function companyColums(opts) {
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
            accessorKey: "Company",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Company"}/>
            ),
           
        },
        {
            accessorKey: "Email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Email"}/>
            ),
           
        },
        {
            accessorKey: "PrimaryPhone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Primary Phone"}/>
            ),
           
        },
        {
            accessorKey: "WhatsappNo",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Whatsapp No"}/>
            ),
           
        },
        {
            accessorKey: "AddressLine1",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Address Line 1"}/>
            ),
           
        },
        {
            accessorKey: "AddressLine2",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Address Line 2"}/>
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
                <DataTableColumnHeader column={column} title={"State/Province"}/>
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
                <DataTableColumnHeader column={column} title={"Zip/Postal Code"}/>
            ),
           
        },
        {
            accessorKey: "NPWP",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"NPWP"}/>
            ),
           
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.SiteAccountID
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

export function CompanyTable() {
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

    const fetchCompany = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await ApiCustomer.get(`/api/site_account`)
            setData(res.data.data || [])
        } catch (error) {
            toast.error("Failed to fetch Company data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchCompany()
    }, [fetchCompany, refresh])

    const handleDeleteCompany = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            const res = await ApiCustomer.delete(`/api/site_account/${selectedId}`)
            toast.success("Company deleted successfully")
            fetchCompany()
            setIsDialogOpen(false)
            setSeletectedId(null)
        } catch (error) {
            toast.error("Failed to delete Company")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedId, fetchCompany])

    const columns = React.useMemo(
        () => 
            companyColums({
                onEdit: (id) => <CompanyEdit  siteAccountId={id} onUpdate={fetchCompany}/>,
                onDelete: (id) => <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={() => {
                  setIsDialogOpen(true)
                  setSeletectedId(id)
                }}>
                <Trash/>
                </Button>
            }),
        [fetchCompany]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Company Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search company..." loading={loading} handleRefresh={handleRefresh}>
                        <DataTableFacetedFilter
                            title="🌍 All Countries"
                            column={table.getColumn("Country")}
                        />
                        <DataTableFacetedFilter
                            title="🏞 All States"
                            column={table.getColumn("StateProvince")}
                        />
                        <DataTableFacetedFilter
                            title="🏙 All Cities"
                            column={table.getColumn("City")}
                        />
                        <DataTableFacetedFilter
                            title="📮 All Zip Codes"
                            column={table.getColumn("ZipPostalCode")}
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
                onConfirm={handleDeleteCompany}
                title="Delete Company"
                description="Are you sure want to delete this company?"
            />
        </div>
    )
}
