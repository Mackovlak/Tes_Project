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
import { RepairClassCodeAdd,} from "../model/MastertabelAdd/RepairClassCodeAdd"
import { RepairClassCodeEdit } from "../model/MastertabelEdit/RepairClassCodeEdit"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function repairClassCodeColums(opts) {
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
            accessorKey: "Code",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Code"}/>
            ),
            cell: ({ getValue }) => {
                const rowCode = getValue()
                return (
                <Link to={`/app/repair-class-code/${rowCode}`}>
                    {rowCode}
                </Link>
                )
            }
        },
        {
            accessorKey: "Description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Description"}/>
            ),
        },
        {
            accessorKey: "Definition",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Definition"}/>
            ),
        },
        {
            accessorKey: "PaymentEligibility",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Payment Eligibility"}/>
            ),
            cell: ({ getValue }) => {
                const LabelPayment = {
                    Eligible: "Eligible",
                    Not_Eligible: "Not Eligible"
                }
                const valuePayment = getValue()
                return LabelPayment[valuePayment]
            }
        },
        {
            accessorKey: "CreatedOn",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"CreatedOn"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.Code
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

export function RepairClassCodeTable() {
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

    const fetchRepairClassCode = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/repairClassCode`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch Repair Class Code data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchRepairClassCode()
    }, [fetchRepairClassCode, refresh])

    const HandleRepairClassCodeDelete = React.useCallback(async () => {
        try {
            await ApiCustomer.delete(`/api/repairClassCode/${selectedId}`)
            toast.success("Delete Repair Class Code Success")
            fetchRepairClassCode()
            setIsDialogOpen(false)
            setSelectedId(null)
        } catch (error) {
            toast.error("Delete Failed")
        }finally {
            setIsDeleting(false)
        }
    },[selectedId, fetchRepairClassCode])

    const columns = React.useMemo(
        () => 
            repairClassCodeColums({
                onEdit: (id) => <RepairClassCodeEdit Code={id}  onUpdate={fetchRepairClassCode}/>,
                onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"} onClick={() => {
                    setIsDialogOpen(true)
                    setSelectedId(id)
                }}>
                    <Trash/>
                </Button>
            }),
        [fetchRepairClassCode]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Repair Class Code Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search repair class code..." loading={loading} handleRefresh={handleRefresh}>
                        <RepairClassCodeAdd/>
                        <DataTableFacetedFilter
                            title={"All Code"}
                            column={table.getColumn("Code")}
                        />
                    </DataTableToolbar>
                )}
            />
            <ConfirmDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) return setSelectedId(null)
            }}
            confirming={isDeleting}
            onConfirm={HandleRepairClassCodeDelete}
            title={"Delete Repair Class Code"}
            description={"Are you sure want to delete this part?"}
            confirmLabel="Delete Repair Class Code"
            />
        </div>
    )
}
