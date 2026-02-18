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
import { AssetEdit } from "../model/MastertabelEdit/AssetEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { Trash } from "lucide-react"

function assetColums(opts) {
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
            accessorKey: "SerialNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Serial Number"}/>
            ),
        },
        {
            accessorKey: "product_information.ProductName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Name"}/>
            ),
        },
        {
            accessorKey: "ProductNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Number"}/>
            ),
        },
        {
            accessorKey: "product_information.ProductLine",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Product Line"}/>
            ),
        },
        {
            id: "siteAccount",
            accessorFn: (row) => row.site_account?.Company ?? "",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Site Account"}/>
            ),
        },
        {
            id: "Contact",
           accessorFn: (row) => {
           const first = row.contact_information?.FirstName ?? ""
           const last  = row.contact_information?.LastName ?? ""
           return `${first} ${last}`.trim()
          },
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Contact"}/>
            ),
            cell: ({ row }) => {
                const item = row.original
                return (
                    <span>{item.contact_information?.FirstName} {item.contact_information?.LastName}</span>
                )
            }
        },
        {
            accessorKey: "Warranty_Status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Warranty Status"}/>
            ),
        },
        {
            accessorKey: "EOW_Date",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"EOW Date"}/>
            ),
            cell: ({ getValue }) => formatDate(getValue())
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const id = row.original.AssetID
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

export function AssetTable() {
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
    const fetchAsset = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
      const LIMIT = 1000;
      const first = await ApiCustomer.get(`/api/asset-information?page=1&limit=${LIMIT}`);
      const firstData = first?.data?.data || [];
      const totalPages = first?.data?.totalPages ?? 1;

      let all = [...firstData];
      for (let p = 2; p <= totalPages; p++) {
        const res = await ApiCustomer.get(`/api/asset-information?page=${p}&limit=${LIMIT}`);
        all = all.concat(res?.data?.data || []);
      }
      if (totalPages === 1 && Array.isArray(first?.data) && !first?.data?.data) {
        all = first.data;
      }
      setData(all)
        } catch (error) {
            toast.error("Failed to fetch Asset data")
            setError("Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }, [])


    React.useEffect(() => {
        fetchAsset()
    }, [fetchAsset, refresh])

  const handleDeleteAsset = React.useCallback(async () => {
    if (!selectedId) return
    setIsDeleting(true)
    try {
      const response = await ApiCustomer.delete(`/api/asset-information/${selectedId}`)
        toast.success("Asset deleted successfully")
        fetchAsset() 
        setIsDialogOpen(false)
        setSeletectedId(null)
    } catch (error) {
      toast.error("Failed to delete Asset")
    } finally {
      setIsDeleting(false)
    }
  }, [selectedId, fetchAsset])
    const columns = React.useMemo(
        () => 
            assetColums({
                onEdit: (id) => <AssetEdit assetId={id} onUpdate={fetchAsset}/>,
                onDelete: (id) =>
                   <Button 
                     variant="outline" 
                     className="text-red-500 hover:text-red-700" 
                     onClick={() => {
                       setIsDialogOpen(true) 
                       setSeletectedId(id)
                     }} >
                     <Trash />
                   </Button>
            }),
        [fetchAsset]
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                title={<h2 className="text-xl sm:text-2xl font-bold">📦 Asset Information</h2>}
                data={data}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                toolbar={(table) => (
                    <DataTableToolbar table={table} searchPlaceholder="🔍 Search asset..." loading={loading} handleRefresh={handleRefresh}>
                        <DataTableFacetedFilter
                            title="All Serial Number"
                            column={table.getColumn("SerialNumber")}
                        />
                        <DataTableFacetedFilter
                            title="All Product Number"
                            column={table.getColumn("ProductNumber")}
                        />
                        <DataTableFacetedFilter
                            title="All Contact"
                            column={table.getColumn("Contact")}
                        />
                    </DataTableToolbar>
                )}
            />

              <ConfirmDialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSeletectedId(null)
                  }}
                  title="Are you absolutely sure?"
                  description="This action cannot be undone. This will permanently delete your account."
                  confirmLabel="Delete Asset"
                  confirming={isDeleting} 
                  onConfirm={handleDeleteAsset}
              />
        </div>
    )
}
