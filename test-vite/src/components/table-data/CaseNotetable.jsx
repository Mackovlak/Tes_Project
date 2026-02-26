import * as React from "react"
import { DataTableColumnHeader } from "./config/data-table-column-header"
import { DataTable } from "./config/data-table"
import { DataTableToolbar } from "./config/data-table-toolbar"
import { formatDate } from "@/lib/utils"
import { parseNoteText } from "@/lib/utils.jsx"
import { format } from "date-fns"

function getErfColumns() {
  return [
    {
      accessorKey: "CreatedOn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Created On"} />
      ),
      cell: ({ getValue }) => <span className="whitespace-break-spaces">{format(new Date(getValue()), "yyyy-MM-dd HH:mm")}</span>
    },
    {
      accessorKey: "createdByUser.Name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Created By"} />
      ),
      cell: ({ getValue }) => <span className="whitespace-break-spaces">{getValue()}</span>
    },
    {
      accessorKey: "LogType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Log Type"} />
      ),
    },
    {
      accessorKey: "ActionType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Action Type"} />
      ),
    },
    {
      accessorKey: "createdByUser.Role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Role"} />
      ),
    },
    {
      accessorKey: "Note",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Note"} />
      ),
      cell: ({ getValue }) => <span className="whitespace-break-spaces">{parseNoteText(getValue())}</span>
    },
  ]
}

export const CaseNotetable = ({notesList}) => {
  const columns = React.useMemo(() => getErfColumns(), [])
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState([])
  return (
            <DataTable
              data={notesList}
              cellName={' p-1 lg:p-2'}
              columns={columns}
              loading={loading}
              sorting={sorting}
              setSorting={setSorting}
              potraitName={"max-h-50 lg:max-h-50 2xl:max-h-140"}
              paginationDisabled
            />
  )
}

