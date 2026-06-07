"use client"

import * as React from "react"
import Swal from "sweetalert2"
import { toast } from "sonner"
import ApiCustomer from "@/api"
import { DataTableToolbar } from "./config/data-table-toolbar"
import { DataTableColumnHeader } from "./config/data-table-column-header"
import { DataTableFacetedFilter } from "./config/data-table-faceted-filter"
import { DataTable } from "./config/data-table"
import { Button } from "../ui/button"
import { ContactEdit } from "../model/MastertabelEdit/ContactEdit"
import { ConfirmDialog } from "../model/config/ConfirmDialog"
import { Trash } from "lucide-react"
import { useServerPageTable } from "./config/data-use-table"

// ─────────────────────────────────────────────────────────────────────────────
// Data Fetchers for Dropdowns
// ─────────────────────────────────────────────────────────────────────────────
function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/contact-information", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

const fetchCompany = makeFetch("Company");
const fetchSalutation = makeFetch("Salutation");
const fetchLanguage = makeFetch("PreferredLanguage");
const fetchCountry = makeFetch("Country");
const fetchState = makeFetch("StateProvince");
const fetchCity = makeFetch("City");
const fetchZip = makeFetch("ZipPostalCode");

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Parsers
// ─────────────────────────────────────────────────────────────────────────────
function contactFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "Company":           p.Company = v; break;
      case "Salutation":        p.Salutation = v; break;
      case "PreferredLanguage": p.PreferredLanguage = v; break;
      case "Country":           p.Country = v; break;
      case "StateProvince":     p.StateProvince = v; break;
      case "City":              p.City = v; break;
      case "ZipPostalCode":     p.ZipPostalCode = v; break;
      default: break;
    }
  }
  return p;
}

function contactSortToParams(s) {
  if (!s[0]) return { sortBy: "FirstName", sortDir: "asc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Columns Definition
// ─────────────────────────────────────────────────────────────────────────────
function contactColumns(opts) {
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
    { accessorKey: "ContactID", id: "ContactID", header: ({ column }) => <DataTableColumnHeader column={column} title="Contact ID" /> },
    { accessorKey: "Company", id: "Company", header: ({ column }) => <DataTableColumnHeader column={column} title="Company" /> },
    { accessorKey: "Salutation", id: "Salutation", header: ({ column }) => <DataTableColumnHeader column={column} title="Salutation" /> },
    { accessorKey: "FirstName", id: "FirstName", header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" /> },
    { accessorKey: "LastName", id: "LastName", header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" /> },
    { accessorKey: "Email", id: "Email", header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> },
    { accessorKey: "PreferredLanguage", id: "PreferredLanguage", header: ({ column }) => <DataTableColumnHeader column={column} title="Language" /> },
    { accessorKey: "Phone", id: "Phone", header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" /> },
    { accessorKey: "Mobile", id: "Mobile", header: ({ column }) => <DataTableColumnHeader column={column} title="Mobile" /> },
    { accessorKey: "Country", id: "Country", header: ({ column }) => <DataTableColumnHeader column={column} title="Country" /> },
    { accessorKey: "StateProvince", id: "StateProvince", header: ({ column }) => <DataTableColumnHeader column={column} title="State" /> },
    { accessorKey: "City", id: "City", header: ({ column }) => <DataTableColumnHeader column={column} title="City" /> },
    { accessorKey: "ZipPostalCode", id: "ZipPostalCode", header: ({ column }) => <DataTableColumnHeader column={column} title="Zip" /> },
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function ContactTable() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [selectedId, setSeletectedId] = React.useState()

  const hook = useServerPageTable({
    url: "/api/contact-information",
    pageSize: 20,
    defaultSorting: [{ id: "FirstName", desc: false }],
    filtersToParams: contactFiltersToParams,
    sortToParams: contactSortToParams,
    globalSearchParam: "search",
  });

  const handleDeleteContact = React.useCallback(async () => {
    if (!selectedId) return
    setIsDeleting(true)
    try {
      await ApiCustomer.delete(`/api/contact-information/${selectedId}`)
      toast.success("Contact deleted successfully")
      hook.refresh()
      setIsDialogOpen(false)
      setSeletectedId(null)
    } catch (error) {
      toast.error("Failed to delete contact")
    } finally {
      setIsDeleting(false)
    }
  }, [selectedId, hook])

  const columns = React.useMemo(
    () =>
      contactColumns({
        onEdit: (id) => <ContactEdit contactID={id} onUpdate={hook.refresh} />,
        onDelete: (id) => (
          <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={() => {
            setIsDialogOpen(true)
            setSeletectedId(id)
          }}>
            <Trash />
          </Button>
        ),
      }),
    [hook.refresh]
  )
console.log('Hook contact',hook)
  return (
    <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
      <DataTable
        title={<h2 className="text-xl sm:text-2xl font-bold">📊 Contact Management</h2>}
        data={hook.data}
        columns={columns}
        sorting={hook.sorting}
        setSorting={hook.setSorting}
        handleRefresh={hook.refresh}
        columnFilters={hook.columnFilters}
        setColumnFilters={hook.setColumnFilters}
        loading={hook.loading}
        error={hook.error}
        globalSearch={hook.globalSearch}
        onGlobalSearchChange={hook.setGlobalSearch}
        serverPagination={{
          pageIndex: hook.pageIndex,
          pageCount: hook.pageCount,
          pageSize: hook.pageSize,
          total: hook.total,
          onPageChange: hook.setPageIndex,
          onPageSizeChange: hook.setPageSize,
        }}
        toolbar={(table, serverProps) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder=" Search contacts..."
            loading={hook.loading}
            handleRefresh={hook.refresh}
            total={hook.total}
            {...serverProps}
          >
            <DataTableFacetedFilter mode="server" title="🏢 Company" column={table.getColumn("Company")} fetchOptions={fetchCompany} />
            <DataTableFacetedFilter mode="server" title="🙋 Salutation" column={table.getColumn("Salutation")} fetchOptions={fetchSalutation} />
            <DataTableFacetedFilter mode="server" title="🌐 Language" column={table.getColumn("PreferredLanguage")} fetchOptions={fetchLanguage} />
            <DataTableFacetedFilter mode="server" title="🌍 Country" column={table.getColumn("Country")} fetchOptions={fetchCountry} />
            <DataTableFacetedFilter mode="server" title="🗺 State" column={table.getColumn("StateProvince")} fetchOptions={fetchState} />
            <DataTableFacetedFilter mode="server" title="🏙 City" column={table.getColumn("City")} fetchOptions={fetchCity} />
            <DataTableFacetedFilter mode="server" title="📮 Zip" column={table.getColumn("ZipPostalCode")} fetchOptions={fetchZip} />
          </DataTableToolbar>
        )}
      />
      <ConfirmDialog
        open={isDialogOpen}
        confirming={isDeleting}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSeletectedId(null);
        }}
        onConfirm={handleDeleteContact}
        title="Delete Contact"
        description="Are you sure want to delete this contact?"
      />
    </div>
  );
}
