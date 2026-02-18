"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { twMerge } from "tailwind-merge"

import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "./data-table-pagination"
import { cn } from "@/lib/utils"


export function DataTable({
  data,
  columns,
  loading,
  error,
  title,
  toolbar,
  className,
  cellName,
  sorting,
  setSorting,
  handleRefresh,
  contact,
  potraitName,
  paginationDisabled = false,
}) {
  const [columnFilters, setColumnFilters] = React.useState([])
  const [globalFilter, setGlobalFilter] = React.useState("")
const tokenGlobalFilter = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim()
  if (!q) return true

  const tokens = q.split(/\s+/).filter(Boolean)

  const haystack = `${row.original.FirstName ?? ""} ${row.original.LastName ?? ""} ${row.original.Email ?? ""} ${row.original.Company ?? ""}`
    .toLowerCase()

  return tokens.every((t) => haystack.includes(t))
}
const filterChange = contact ? tokenGlobalFilter : "includesString"
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,

    globalFilterFn: filterChange,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationDisabled ? undefined : getPaginationRowModel(),

    // for faceted filters (unique values)
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  return (
    <div className={className}>
      {title ? <div className="mb-3">{title}</div> : null}

      {toolbar ? toolbar(table) : "" }

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <Table className=" text-[11px] leading-tight " potrait={cn( "mt-3 rounded-xl border-2 max-h-105 2xl:max-h-195", potraitName)}>
          <TableHeader className="sticky top-0 z-10 bg-muted/70">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header
                      ? header.column.columnDef.header(header.getContext())
                      : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-8  text-xl">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={twMerge("whitespace-nowrap py-0", cellName)}>
                      {cell.column.columnDef.cell
                        ? cell.column.columnDef.cell(cell.getContext())
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-8 text-center">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
     { !paginationDisabled &&
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
     }
    </div>
  )
}

