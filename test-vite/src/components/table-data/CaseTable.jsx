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
import { useAuth } from "@/context/auth-context"
import { STATUS_ENUM_TO_LABEL } from "@/hooks/useCaseStatus"
import { formatDate } from "@/lib/utils"
import { get } from "react-hook-form"
import { File } from "lucide-react"
import { Link } from "react-router"
import { CaseImport, CaseTemplateButton } from "../importFileComponent/CaseImport"
import { ExportExcel } from "../Export-Excel"

function caseColums() {
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
            accessorKey: "CaseID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case ID"}/>
            ),
            cell: ({ row, getValue }) => {
            const caseId = getValue();
            const href = `/app/case/${caseId}`
        
            return (
              <Link to={href} className="block w-full py-1">
                <span className="text-sky-500 hover:opacity-80">
                  {caseId}
                </span>
              </Link>
            )
          },
        },
        {
            accessorKey: "caseinformation.CaseID_Manual",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case ID Manual"}/>
            ),
        },
        {
            accessorKey: "caseinformation.ErfDoc",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"ERF"}/>
            ),
            cell: ({ getValue }) => getValue() && <Button variant={"outline"} className={"border-none"} onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}${getValue()}`)}><File/></Button>
        },
        {
            accessorKey: "CaseSubject",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case Subject"}/>
            ),
        },
        {
            accessorKey: "CustomerAccount",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Customer Company"}/>
            ),
        },
        {
            accessorKey: "SerialNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Serial No"}/>
            ),
        },
        {
            accessorKey: "ProductNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product No"}/>
            ),
        },
        {
            accessorKey: "ProductName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Name"}/>
            ),
        },
        {
            accessorKey: "caseinformation.asset_information.WarrantyOTCCode.WarrantyCondition",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Warranty Type"}/>
            ),
            cell: ({ getValue }) => {
                const value = getValue()
                const labelWarranty = {
                    InWarranty: "In Warranty",
                    OutWarranty: "Out Of Warranty"
                }
                return labelWarranty[value]
            }
        },
        {
            accessorKey: "caseinformation.CaseType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case Type"}/>
            ),
        },
        {
            accessorKey: "CreatedOn",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Created On"}/>
            ),
        },
        {
            accessorKey: "caseinformation.CaseID_Manual_Date",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case ID Manual Date"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            accessorKey: "Primary",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Customer Name"}/>
            ),
        },
        {
            accessorKey: "CreatedName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Created Name"}/>
            ),
        },
        {
            accessorKey: "Owner",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Owner"}/>
            ),
        },
        {
            accessorKey: "CaseStatus",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Case Status"}/>
            ),
            cell: ({ getValue }) => {
                const rawStatus = getValue()
                const color = {
                    Close: "bg-red-300/80 ",
                    Cancel: "bg-amber-300/80 ",
                }[rawStatus] ?? "bg-emerald-300/80"
                return  (
                    <div className={`h-5 flex justify-center items-center rounded ${color}`}>
                        {STATUS_ENUM_TO_LABEL[rawStatus] ?? rawStatus}
                    </div>
                )
            } 
        },
    ]
}

const getToday = () => {
const today = new Date();
return today.toISOString().split("T")[0];
};

const getOneYearAgo = () => {
const d = new Date();
d.setFullYear(d.getFullYear() - 1);
return d.toISOString().split("T")[0];
};

export function CaseTable() {
    const { user } = useAuth();
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [openClose, setOpenClose] = React.useState("All");
    const [startDate, setStartDate] = React.useState(getOneYearAgo);
    const [endDate, setEndDate] = React.useState(getToday);
    const [refresh, setRefresh] = React.useState(false) 
    const [Sorting, setSorting] = React.useState([
        {
            id: "CreatedOn", 
            desc: true
        }])

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const fetchCase = React.useCallback(async () => {
    const isAgreeAllResource = user?.role === 'admin' || user?.role === 'apo' || user?.role === 'cm' || user?.role === 'spv';
    const savedTeamId = localStorage.getItem("activeTeamId");
    const params = new URLSearchParams();
    const baseurl = `/api/case-information`;
        if (openClose !== "All") {
        params.append("CaseStatus", openClose);
        }
        if (!isAgreeAllResource) {
        params.append("resource", savedTeamId);
        }

        if (startDate) {
        params.append("startDate", startDate);
        }

        if (endDate) {
        params.append("endDate", endDate);
        }
        const url = params.toString() ? `${baseurl}?${params.toString()}` : baseurl;
        setLoading(true)
        setError(null)

        try {
        const res = await ApiCustomer.get(url);
        setData(res.data.data)
        } catch (error) {
            toast.error("Failed to fetch Case data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [user, startDate, endDate, openClose])

    React.useEffect(() => {
        fetchCase()
    }, [fetchCase, refresh])

    const columns = React.useMemo(
            () => caseColums(),
        [fetchCase]
     )

    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">View All The Case</h2>}
                data={data}
                columns={columns}
                cellName={"h-9"}
                loading={loading}
                sorting={Sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search case..." loading={loading} handleRefresh={handleRefresh}>
                         {user?.role === 'admin' || user?.role === 'fd' ||  user?.role === 'celead' ||  user?.role === 'spv' ? 
                            <ExportExcel caseData={data} resource={user?.resource} isAdmin={user?.role === 'admin' || user?.role === 'spv'}/>
                        : null}

                        <DataTableFacetedFilter
                            title="All Product Name"
                            column={table.getColumn("SerialNumber")}
                        />
                        <DataTableFacetedFilter
                            title="All Product Number"
                            column={table.getColumn("ProductNumber")}
                        />
                        <DataTableFacetedFilter
                            title="All Serial Number"
                            column={table.getColumn("SerialNumber")}
                        />
                        <DataTableFacetedFilter
                            title="All Created Name"
                            column={table.getColumn("CreatedName")}
                        />
                        <DataTableFacetedFilter
                            title="All Owner"
                            column={table.getColumn("Owner")}
                        />
                        <DataTableFacetedFilter
                            title="All Case Status"
                            column={table.getColumn("CaseStatus")}
                        />
                        <CaseImport/>
                        <CaseTemplateButton/>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Created Date (From)</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 text-sm border rounded-lg"/>  
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Created Date (To)</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 text-sm border rounded-lg"/>
                        </div>
                    </DataTableToolbar>
                )}
            />
        </div>
    )
}
