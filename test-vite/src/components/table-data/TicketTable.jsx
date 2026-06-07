import ApiCustomer from "@/api";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { DataTable } from "./config/data-table";
import { DataTableToolbar } from "./config/data-table-toolbar";
import { DataTableColumnHeader } from "./config/data-table-column-header";

function TicketColumns(opts) {
  return [
    {
      id: "no",
      header: () => <div className="text-center">No</div>,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="text-center">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
    },
    {
        accessorKey: "ContactID",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"ContacId"}/>
        ),
    },
    {
        accessorKey: "contact_information.FirstName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"FirstName"}/>
        ),
    },
    {
        accessorKey: "contact_information.LastName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"LastName"}/>
        ),
    },
    {
        accessorKey: "contact_information.Email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"Email"}/>
        ),
    },
    {
        accessorKey: "Subject",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"Subject"}/>
        ),
    },
    {
        accessorKey: "Type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"Type"}/>
        ),
    },
    {
        accessorKey: "TicketNumber",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"TicketNumber"}/>
        ),
    },
    {
        accessorKey: "Status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={"Status"}/>
        ),
    },
  ];
}
export function TicketTable() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const [refresh, setRefresh] = React.useState(false);

  function handleRefresh() {
    setRefresh((prev) => !prev);
  }
  const fetchTicket = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiCustomer.get(`/api/tickets`);
      setData(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch Symptom Code data");
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket, refresh]);

  const columns   = React.useMemo(() => TicketColumns(), []);
  console.log("lets see the data", data);
  return (
    <div className="p-4 grid grid-cols-1 w-full rounded-2xl">
      <DataTable
        title={
          <h2 className="text-xl sm:text-2xl font-bold">
            Ticket Table 
          </h2>
        }
        data={data}
        columns={columns}
        sorting={sorting}
        setSorting={setSorting}
        handleRefresh={handleRefresh}
        cellClassName={"h-9"}
        loading={loading}
        error={error}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder=" Search Ticket..."
            loading={loading}
            handleRefresh={handleRefresh}
          >
          </DataTableToolbar>
        )}
      />
    </div>
  );
}
