"use client"

import * as React from "react"
import Swal from "sweetalert2"
import { toast } from "sonner"
import ApiCustomer from "@/api"
import { ContactEdit } from "../model/MastertabelEdit/ContactEdit"
import { DataTableToolbar } from "./config/data-table-toolbar"
import { DataTableColumnHeader } from "./config/data-table-column-header"
import { DataTablePagination } from "./config/data-table-pagination"
import { DataTableFacetedFilter } from "./config/data-table-faceted-filter"
import { DataTable } from "./config/data-table"
import { Button } from "../ui/button"
import { Trash } from "lucide-react"
import { ConfirmDialog } from "../model/config/ConfirmDialog"

 function contactColumns(opts){
  return [
    {
      id: "no",
      header: () => <div className="text-center">No</div>,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex
        const pageSize = table.getState().pagination.pageSize
        return (
          <div className="text-center">
            {pageIndex * pageSize + row.index + 1}
          </div>
        )
      },
    },
    {
      accessorKey: "ContactID",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact ID" />
      ),
    },
    {
      accessorKey: "Company",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "Salutation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Salutation" />
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "FirstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="First Name" />
      ),
    },
    {
      accessorKey: "LastName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Name" />
      ),
    },
    {
      accessorKey: "Email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "PreferredLanguage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Language" />
      ),
      filterFn: "equalsString",
    },
    { accessorKey: "Phone", header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" /> },
    { accessorKey: "Mobile", header: ({ column }) => <DataTableColumnHeader column={column} title="Mobile" /> },
    { accessorKey: "WorkPhone", header: ({ column }) => <DataTableColumnHeader column={column} title="Work Phone" /> },
    { accessorKey: "WorkExtension", header: ({ column }) => <DataTableColumnHeader column={column} title="Work Ext" /> },
    { accessorKey: "OtherPhone", header: ({ column }) => <DataTableColumnHeader column={column} title="Other Phone" /> },
    { accessorKey: "OtherExtension", header: ({ column }) => <DataTableColumnHeader column={column} title="Other Ext" /> },
    { accessorKey: "Fax", header: ({ column }) => <DataTableColumnHeader column={column} title="Fax" /> },
    { accessorKey: "AddressLine1", header: ({ column }) => <DataTableColumnHeader column={column} title="Address 1" /> },
    { accessorKey: "AddressLine2", header: ({ column }) => <DataTableColumnHeader column={column} title="Address 2" /> },
    {
      accessorKey: "Country",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Country" />
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "StateProvince",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State" />
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "City",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="City" />
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "ZipPostalCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Zip" />
      ),
      filterFn: "equalsString",
    },

    { accessorKey: "PIC_Name", header: ({ column }) => <DataTableColumnHeader column={column} title="PIC Name" /> },
    { accessorKey: "PIC_Email", header: ({ column }) => <DataTableColumnHeader column={column} title="PIC Email" /> },
    { accessorKey: "PIC_Phone", header: ({ column }) => <DataTableColumnHeader column={column} title="PIC Phone" /> },

    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const id = row.original.ContactID
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


export function ContactTable() {
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

  const fetchContacts = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await ApiCustomer.get(`/api/contact-information`)
      setData(res.data.data || [])
    } catch (err) {
      toast.error("Failed to fetch contact data")
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [])    

  React.useEffect(() => {
    fetchContacts()
  }, [fetchContacts, refresh])

  const handleDeleteContact = React.useCallback(async () => {
    if (!selectedId) return
    setIsDeleting(true)
    try {
      const res =  await ApiCustomer.delete(`/api/contact-information/${selectedId}`);
      toast.success("Contact deleted successfully")
      fetchContacts()
      setIsDialogOpen(false)
      setSeletectedId(null)
    }catch (err) {
      toast.error("Failed to delete contact")
    }finally {
      setIsDeleting(false)
    }
  },[selectedId, fetchContacts])

  const columns = React.useMemo(
    () =>
      contactColumns({
        onEdit: (id) => <ContactEdit contactID={id} onUpdate={fetchContacts} />,
        onDelete: (id) => <Button variant={"outline"} className={"text-red-500 hover:text-red-700"}
        onClick={() => {
          setIsDialogOpen(true)
          setSeletectedId(id)
        }}>
        <Trash/>
        </Button>,
      }),
    [fetchContacts]
  )
  return (
    <div className="p-4 grid  grid-cols-1 w-full rounded-2xl">
      <DataTable
        contact
        title={<h2 className="text-xl sm:text-2xl font-bold">📊 Contact Management</h2>}
        data={data}
        columns={columns}
        loading={loading}
        sorting={sorting}
        setSorting={setSorting}
        handleRefresh={handleRefresh}
        error={error}
        toolbar={(table) => (
          <DataTableToolbar table={table} searchPlaceholder="🔍 Search contacts..." loading={loading} handleRefresh={handleRefresh}>
            <DataTableFacetedFilter
              title="🏢 Company"
              column={table.getColumn("Company")}
            />
            <DataTableFacetedFilter
              title="🙋 Salutation"
              column={table.getColumn("Salutation")}
            />
            <DataTableFacetedFilter
              title="🌐 Language"
              column={table.getColumn("PreferredLanguage")}
            />
            <DataTableFacetedFilter
              title="🌍 Country"
              column={table.getColumn("Country")}
            />
            <DataTableFacetedFilter
              title="🗺 State"
              column={table.getColumn("StateProvince")}
            />
            <DataTableFacetedFilter
              title="🏙 City"
              column={table.getColumn("City")}
            />
            <DataTableFacetedFilter
              title="📮 Zip"
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
        onConfirm={handleDeleteContact}
        title={"Delete Contact"}
        description="Are you sure you want to delete this contact?"
        />
    </div>
  )
}


