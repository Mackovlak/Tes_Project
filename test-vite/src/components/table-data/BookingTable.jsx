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
import { BookingsAdd, BookingsDelete, BookingsEdit } from "../model/sc-modal"
import { formatDate } from "@/lib/utils"
import { Link } from "react-router"

function bookingColums(opts) {
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
            accessorKey: "WOID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"WOID"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    <Link to={`/app/work/${getValue()}`}>
                        {getValue()}
                    </Link>
                )
            }
        },
        {
            accessorKey: "BookingStatus.Description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Status"}/>
            ),
        },
        {
            accessorKey: "ScheduleJeopardy",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Schedule Jeopardy"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    getValue() ? "Yes" : "No"
                )
            }
        },
        {
            accessorKey: "ScheduleJeopardyTime",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Schedule Jeopardy Time"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "DoNotDisturb",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Do Not Disturb"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    getValue() ? "Yes" : "No"
                )
            }
        },
        {
            accessorKey: "CeScheduleChange",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Ce Schedule Change"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    getValue() ? "Yes" : "No"
                )
            }
        },
        {
            accessorKey: "Duration",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Duration (min)"}/>
            ),
            cell: ({ row }) => {
                const item = row
                return (
                    <div className="flex flex-col gap-1">
                        <span>Total Billable: {item.TotalBillableDurationInMinutes || 0}</span>
                        <span>Total In Progress: {item.TotalInProgressDurationInMinutes || 0}</span>
                        <span>Total Break: {item.TotalBreakDurationInMinutes || 0}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "createdByUser.Username",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Created By"}/>
            ),
        },
        // {
        //     id: "actions",
        //     header: () => <div className="text-center">Actions</div>,
        //     cell: ({ row }) => {
        //         const id = row.original.BookingId
        //     return (
        //         <div className="flex justify-center gap-2">
        //             {opts.onEdit(id)}
        //             {opts.onDelete(id)}
        //         </div>
        //     )
        //     },
        // },
    ]
}

export function BookingTable() {
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }
    const fetchBooking = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const res = await ApiCustomer.get(`/api/booking`)
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch Booking data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchBooking()
    }, [fetchBooking, refresh])

    const columns = React.useMemo(
        () => 
            bookingColums({
                onEdit: (id) => <BookingsEdit BookingId={id}  onUpdate={fetchBooking}/>,
                onDelete: (id) => <BookingsDelete BookingId={id}/>
            }),
        [fetchBooking]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Booking Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search booking..." loading={loading} handleRefresh={handleRefresh}>
                       <DataTableFacetedFilter
                        title={"All WOID"}
                        column={table.getColumn("WOID")}
                       />
                       {/* <BookingsAdd/> */}
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
