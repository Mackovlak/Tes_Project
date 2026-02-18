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
import { BookingDetailsAdd, BookingDetailsDelete, BookingDetailsEdit } from "../model/sc-modal"

function bookingDetailsColums(opts) {
    const { userMap } = opts
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
            accessorKey: "BookingDetailId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Bookings Details ID"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    <Link to={`/app/bookings/${getValue()}`}>
                        {getValue()}
                    </Link>
                )
            }
        },
        {
            accessorKey: "BookingId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Booking Id"}/>
            ),
        },
        {
            accessorKey: "ResourceId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Schedule Jeopardy"}/>
            ),
        },
        {
            accessorKey: "ResourceAccountId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Resource Account Id"}/>
            ),
        },
        {
            accessorKey: "engineer.Name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Engineer Id"}/>
            ),
        },
        {
            accessorKey: "Status.Description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Status"}/>
            ),
        },
        {
            id: "CustomerTime",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Customer Time"}/>
            ),
            cell: ({ row }) => {
                const items = row.original
                return (
                    <div className="flex flex-col gap-1">
                        <span>Start:{formatDate(items.StartTimeCustomerTime)}</span>
                        <span>End:{formatDate(items.EndTimeCustomerTime)}</span>
                        <span>Est. Arrival:{formatDate(items.EstimatedArrivalTimeCustomerTime)}</span>
                        <span>Actual Arrival:{formatDate(items.ActualArrivalTimeCustomerTime)}</span>
                    </div>
                )
            }
        },
        {
            id: "UserTime",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"User Time"}/>
            ),
            cell: ({ row }) => {
                const items = row.original
                return (
                    <div className="flex flex-col gap-1">
                        <span>Start:{formatDate(items.StartTimeUserTime)}</span>
                        <span>End:{formatDate(items.EndTimeUserTime)}</span>
                        <span>Duration:{items.DurationInMinutesUserTime}</span>
                        <span>Est. Arrival:{formatDate(items.EstimatedArrivalTimeCustomerTime)}</span>
                        <span>Actual Arrival:{formatDate(items.ActualArrivalTimeCustomerTime)}</span>
                    </div>
                )
            }
        },
        {
            id: "IDUser",
            accessorFn: row => userMap[row.ChangedBy] || "",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Changed By"}/>
            ),
            cell: ({ getValue }) => {
                return (
                    <span>{getValue()}</span>
                )
            }
        },
        {
            accessorKey: "ChangedAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Changed At"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
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

export function BookingDetailsTable() {
    const [data, setData] = React.useState([])
    const [user, setUser] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchAll = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
        const [bookingDetail, users] = await Promise.all([
            ApiCustomer.get(`/api/bookingDetails`),
            ApiCustomer.get(`/api/user`)
        ])
        setData(bookingDetail.data.data)
        setUser(users.data.data)
        } catch (error) {
            toast.error("Failed to fetch Booking Details dan User data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchAll()
    }, [fetchAll, refresh])

    const userMap = React.useMemo(() => {
        return Object.fromEntries(
            user.map(u => [u.IDUser, u.Username])
        )
    }, [user])

    const columns = React.useMemo(
        () => 
            bookingDetailsColums({
                userMap,
                onEdit: (id) => <BookingDetailsEdit BookingDetailId={id}  onUpdate={fetchAll}/>,
                onDelete: (id) => <BookingDetailsDelete BookingDetailId={id}/>
            }),
        [fetchAll, userMap]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📊 Booking Details Management</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search booking details..." loading={loading} handleRefresh={handleRefresh}> 
                       <DataTableFacetedFilter
                        title={"All Changed By"}
                        column={table.getColumn("IDUser")}
                       />
                       {/* <BookingDetailsAdd/> */}
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
