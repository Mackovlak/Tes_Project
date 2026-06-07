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
import { useServerPageTable } from "./config/data-use-table"
import { id } from "date-fns/locale"

function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/site_account", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

// Creating fetchers for your specific table filters
const fetchCountry = makeFetch("Country");
const fetchState = makeFetch("StateProvince");
const fetchCity = makeFetch("City");
const fetchZip = makeFetch("ZipPostalCode");

// ─────────────────────────────────────────────────────────────────────────────
// Parameter Parsers
// ─────────────────────────────────────────────────────────────────────────────
function companyFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "Country":       p.Country = v; break;
      case "StateProvince": p.StateProvince = v; break;
      case "City":          p.City = v; break;
      case "ZipPostalCode": p.ZipPostalCode = v; break;
      default: break;
    }
  }
  return p;
}

function companySortToParams(s) {
  if (!s[0]) return { sortBy: "Company", sortDir: "asc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}

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
            id: "Company",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Company"}/>
            ),
           
        },
        {
            accessorKey: "Email",
            id: "Email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Email"}/>
            ),
           
        },
        {
            accessorKey: "PrimaryPhone",
            id: "PrimaryPhone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Primary Phone"}/>
            ),
           
        },
        {
            accessorKey: "WhatsappNo",
            id: "WhatsappNo",
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
            id: "Country",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"Country"}/>
            ),
           
        },
        {
            accessorKey: "StateProvince",
            id: "StateProvince",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"State/Province"}/>
            ),
           
        },
        {
            accessorKey: "City",
            id: "City",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={"City"}/>
            ),
           
        },
        {
            accessorKey: "ZipPostalCode",
            id: "ZipPostalCode",
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

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [selectedId, setSeletectedId] = React.useState()


    const hook = useServerPageTable({
        url: "/api/site_account",
        pageSize: 20,
        defaultSorting: [{ id: "Company", desc: false }],
        filtersToParams: companyFiltersToParams,
        sortToParams: companySortToParams,
        globalSearchParam: "search",
    });

    const handleDeleteCompany = React.useCallback(async () => {
        if (!selectedId) return
        setIsDeleting(true)
        try {
            await ApiCustomer.delete(`/api/site_account/${selectedId}`)
            toast.success("Company deleted successfully")
            hook.refresh()
            setIsDialogOpen(false)
            setSeletectedId(null)
        } catch (error) {
            toast.error("Failed to delete Company")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedId, hook])

    const columns = React.useMemo(
        () => 
            companyColums({
                onEdit: (id) => <CompanyEdit  siteAccountId={id} onUpdate={hook.refresh}/>,
                onDelete: (id) => <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={() => {
                  setIsDialogOpen(true)
                  setSeletectedId(id)
                }}>
                <Trash/>
                </Button>
            }),
        [hook.refresh]
    )
    return (
      <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
        <DataTable
          title={
            <h2 className="text-xl sm:text-2xl font-bold">
              📊 Company Management
            </h2>
          }
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
              searchPlaceholder=" Search company..."
              loading={hook.loading}
              handleRefresh={hook.refresh}
              total={hook.total}
              {...serverProps}
            >
              <DataTableFacetedFilter
                mode="server"
                title="🌍 All Countries"
                column={table.getColumn("Country")}
                fetchOptions={fetchCountry}
              />
              <DataTableFacetedFilter
                mode="server"
                title="🏞 All States"
                column={table.getColumn("StateProvince")}
                fetchOptions={fetchState}
              />
              <DataTableFacetedFilter
                mode="server"
                title="🏙 All Cities"
                column={table.getColumn("City")}
                fetchOptions={fetchCity}
              />
              <DataTableFacetedFilter
                mode="server"
                title="📮 All Zip Codes"
                column={table.getColumn("ZipPostalCode")}
                fetchOptions={fetchZip}
              />
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
          onConfirm={handleDeleteCompany}
          title="Delete Company"
          description="Are you sure want to delete this company?"
        />
      </div>
    );
}
