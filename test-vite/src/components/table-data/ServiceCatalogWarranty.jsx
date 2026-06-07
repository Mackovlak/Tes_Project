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
import { WarrantyServiceEdit } from "../model/MastertabelEdit/WarrantyServiceEdit"
import { WarrantyServiceAdd } from "../model/MastertabelAdd/WarrantyServiceAdd"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

function warrantyServiceColums(opts) {
    return [
         {
            id: "select",
            header: () => <div className="font-black text-black">Select</div>,
            cell: ({ row, table }) => {
              const checked = row.getIsSelected()
          
              return (
                <input
                  type="radio"
                  name="warrantyService"
                  checked={checked}
                  onChange={() => {
                    table.options.meta?.onSelectRow?.(row.original)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select service ${row.original.Service_offerID}`}
                />
              )
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            accessorKey: "Service_offerID",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Offer ID"}/>
            ),
        },
        {
            accessorKey: "Service_description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Service Description"}/>
            ),
        },
        {
            accessorKey: "CTat_RTime",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Custumer TAT"}/>
            ),
        },
        {
            accessorKey: "Price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Price"}/>
            ),
        },
        {
            accessorKey: "Tax",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Tax"}/>
            ),
        },
        {
            accessorKey: "Total",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Total"}/>
            ),
        },
    ]
}

export function ServiceCatalogWarrantyTable(
  {
    selectedWarrantyServices,
    setSelectedWarrantyServices,
    data,
  }
) {
    // const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [selectedId, setSeletectedId] = React.useState(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [sorting, setSorting] = React.useState([])
    const [refresh, setRefresh] = React.useState(false) 

    function handleRefresh(){
      setRefresh(prev => !prev)
    }

    const columns = React.useMemo(
        () => 
            warrantyServiceColums({
            }),
        []
    )
    return (
        <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
            <DataTable
                data={data}
                cellClassName={' p-1 lg:p-2'}
                columns={columns}
                sorting={sorting}
                setSorting={setSorting}
                handleRefresh={handleRefresh}
                loading={loading}
                error={error}
                containerClassName={"max-h-50 lg:max-h-60 2xl:max-h-140"}
                paginationDisabled 
                enableSingleSelect
                getRowId={(row) => String(row.Service_offerID)}
                selectedRowId={selectedWarrantyServices ? String(selectedWarrantyServices.Service_offerID) : null}
                onSelectedRowChange={(row) => {
                  setSelectedWarrantyServices(row)
                }}
            />
        </div>
    )
}
