"use client";

import * as React from "react";
import { DataTableToolbar }       from "./config/data-table-toolbar";
import { DataTableColumnHeader }  from "./config/data-table-column-header";
import { DataTableFacetedFilter } from "./config/data-table-faceted-filter";
import { DataTable }              from "./config/data-table";
import { useServerPageTable }     from "./config/data-use-table";
import { useAuth }                from "@/context/auth-context";
import { STATUS_ENUM_TO_LABEL }   from "@/hooks/useCaseStatus";
import { formatDate }             from "@/lib/utils";
import { File }                   from "lucide-react";
import { Button }                 from "../ui/button";
import { Link }                   from "react-router";
import { ExportExcel }            from "../Export-Excel";
import ApiCustomer                from "@/api";
import DatePicker from "../date-picker";

// ─────────────────────────────────────────────────────────────────────────────
// Case Status options
// Full list — cmdk filters locally so having 40 items is fine.
// ─────────────────────────────────────────────────────────────────────────────

const CASE_STATUS_OPTIONS = [
  { label: "New",                          value: "New" },
  { label: "Open",                         value: "Open" },
  { label: "InActive",                     value: "InActive" },
  { label: "Closed (Cust Pick Up)",        value: "Close" },
  { label: "Cancel (Cust Pick Up)",        value: "Cancel" },
  { label: "Active",                       value: "Active" },
  { label: "Monitor",                      value: "Monitor" },
  { label: "Pending Customer Action",      value: "Pending_Customer_Action" },
  { label: "Quote Requested",              value: "Quote_Requested" },
  { label: "Pending Follow Up",            value: "Pending_Follow_Up" },
  { label: "Pending Order",               value: "Pending_Order" },
  { label: "Escalated",                    value: "Escalated" },
  { label: "Quote Approved",              value: "Quote_Approved" },
  { label: "Quote Rejected",              value: "Quote_Rejected" },
  { label: "Pending Quote",               value: "Pending_Quote" },
  { label: "New → Assign To FD",          value: "NEW_AssignFD" },
  { label: "New → Assign To CE",          value: "NEW_AssignCE" },
  { label: "New → Assign To Leader",      value: "NEW_AssignLeader" },
  { label: "New → Assign To APO",         value: "NEW_AssignAPO" },
  { label: "New → Assign To PS",          value: "NEW_AssignPS" },
  { label: "New → Assign To CM",          value: "NEW_AssignCM" },
  { label: "Assign To FD",                value: "AssignFD" },
  { label: "Assign To CE",                value: "AssignCE" },
  { label: "Assign To APO",               value: "AssignAPO" },
  { label: "Assign To Leader",            value: "AssignLeader" },
  { label: "Assign To PS",                value: "AssignPS" },
  { label: "Assign To CM",                value: "AssignCM" },
  { label: "New Needed POP Document",      value: "NEW_POPDoc" },
  { label: "New Warranty (Warranty Proses)", value: "NEW_Warranty" },
  { label: "Part Request",                value: "PartRequest" },
  { label: "Part Order Logistic",         value: "PartRequestLog" },
  { label: "Part Request Logistic",       value: "PartOrder" },
  { label: "Part Available",              value: "PartAvailable" },
  { label: "Repair Progress",             value: "RepairProgress" },
  { label: "Finish Repair",               value: "FinishRepair" },
  { label: "Cancel Repair",               value: "CancelRepair" },
  { label: "Closed",                      value: "Closed" },
  { label: "Cancelled",                   value: "Cancelled" },
  { label: "Void",                        value: "Void" },
  { label: "Reschedule",                  value: "Reschedule" },
  { label: "DOA Part Return",             value: "DOAPartReturn" },
  { label: "Customer Delay",              value: "Customer_Delay" },
];

// ─────────────────────────────────────────────────────────────────────────────
// makeFetch — factory for dynamic fetchOptions callbacks
//
// Uses the SAME /api/case-information route with mode=distinct.
// No new endpoint, no new file. Just a different mode param.
// Results are cheap: a single distinct+limit query on a related table.
// ─────────────────────────────────────────────────────────────────────────────

function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/case-information", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

// Stable refs so these functions don't re-create on every render.
// Must be defined outside the component — these never change.
const fetchSerialNumber  = makeFetch("SerialNumber");
const fetchProductName   = makeFetch("ProductName");
const fetchProductNumber = makeFetch("ProductNumber");
const fetchOwner         = makeFetch("Owner");
const fetchCreatedBy     = makeFetch("CreatedName");

// ─────────────────────────────────────────────────────────────────────────────
// filtersToParams
// ─────────────────────────────────────────────────────────────────────────────

function caseFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    // Both modes store [value] — read first element
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "CaseStatus":    p.CaseStatus    = v; break;
      case "SerialNumber":  p.SerialNumber  = v; break;
      case "ProductNumber": p.ProductNumber = v; break;
      case "ProductName":   p.ProductName   = v; break;
      case "CreatedName":   p.CreatedName   = v; break;
      case "Owner":         p.Owner         = v; break;
      case "CaseSubject":   p.CaseSubject   = v; break;
      default: break;
    }
  }
  return p;
}

function caseSortToParams(s) {
  if (!s[0]) return { sortBy: "CreatedOn", sortDir: "desc" };
  return { sortBy: s[0].id, sortDir: s[0].desc ? "desc" : "asc" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function caseColumns() {
  return [
    {
      id: "no",
      header: () => <div className="text-center">No</div>,
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return <div className="text-center">{pageIndex * pageSize + row.index + 1}</div>;
      },
    },
    {
      accessorKey: "CaseID",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Case ID" />,
      cell: ({ getValue }) => {
        const id = getValue();
        return (
          <Link to={`/app/case/${id}`} className="block w-full py-1">
            <span className="text-sky-500 hover:opacity-80">{id}</span>
          </Link>
        );
      },
    },
    {
      accessorKey: "caseinformation.CaseID_Manual",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Case ID Manual" />,
    },
    {
      accessorKey: "caseinformation.ErfDoc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ERF" />,
      cell: ({ getValue }) =>
        getValue() && (
          <Button variant="outline" className="border-none"
            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}${getValue()}`)}>
            <File />
          </Button>
        ),
    },
    {
      accessorKey: "CaseSubject",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Case Subject" />,
    },
    {
      accessorKey: "CustomerAccount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Company" />,
    },
    {
      accessorKey: "SerialNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Serial No" />,
    },
    {
      accessorKey: "ProductNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product No" />,
    },
    {
      accessorKey: "ProductName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product Name" />,
    },
    {
      accessorKey: "caseinformation.asset_information.WarrantyOTCCode.WarrantyCondition",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Warranty Type" />,
      cell: ({ getValue }) => {
        const labels = { InWarranty: "In Warranty", OutWarranty: "Out Of Warranty" };
        return labels[getValue()] ?? getValue();
      },
    },
    {
      accessorKey: "caseinformation.CaseType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Case Type" />,
    },
    {
      accessorKey: "CreatedOn",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created On" />,
    },
    {
      accessorKey: "caseinformation.CaseID_Manual_Date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Case ID Manual Date" />,
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: "Primary",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Name" />,
    },
    {
      accessorKey: "CreatedName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created Name" />,
    },
    {
      accessorKey: "Owner",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    },
    {
      accessorKey: "CaseStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Case Status" />,
      cell: ({ getValue }) => {
        const s = getValue();
        const color = { Close: "bg-red-300/80", Cancel: "bg-amber-300/80" }[s] ?? "bg-emerald-300/80";
        return (
          <div className={`h-5 flex justify-center items-center rounded ${color}`}>
            {STATUS_ENUM_TO_LABEL[s] ?? s}
          </div>
        );
      },
    },
  ];
}

const toLocalISODate = (date) => {
  if (!date) return undefined;
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
};

const getToday      = () => new Date().toISOString().split("T")[0];
const getOneYearAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split("T")[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// CaseTable
// ─────────────────────────────────────────────────────────────────────────────

export function CaseTable() {
  const { user } = useAuth();

  const [startDate, setStartDate] = React.useState(getOneYearAgo);
  const [endDate,   setEndDate]   = React.useState(getToday);

const [dateRange, setDateRange] = React.useState(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    return {
      from: oneYearAgo,
      to: today,
    };
  });

  const isPrivileged = ["admin", "apo", "cm", "spv"].includes(user?.role);
  const savedTeamId  = typeof window !== "undefined" ? localStorage.getItem("activeTeamId") : null;

  const extraParams = React.useMemo(() => {
    const startDate = toLocalISODate(dateRange?.from);
    const endDate = toLocalISODate(dateRange?.to);

    return {
    ...(startDate && { startDate }),
    ...(endDate   && { endDate }),
    ...(!isPrivileged && savedTeamId && { resource: savedTeamId }),
    }
  }, [dateRange, isPrivileged, savedTeamId]);

  const hook = useServerPageTable({
    url:               "/api/case-information",
    pageSize:          20,
    defaultSorting:    [{ id: "CreatedOn", desc: true }],
    filtersToParams:   caseFiltersToParams,
    sortToParams:      caseSortToParams,
    extraParams,
    globalSearchParam: "search",
  });

  const exportParams = React.useMemo(() => ({
    ...caseFiltersToParams(hook.columnFilters),
    ...caseSortToParams(hook.sorting),
    ...(hook.globalSearch ? { search: hook.globalSearch } : {}),
    ...extraParams,
  }), [hook.columnFilters, hook.sorting, hook.globalSearch, extraParams]);

  const columns   = React.useMemo(() => caseColumns(), []);
  const canExport = ["admin", "fd", "celead", "spv"].includes(user?.role);

  return (
    <div className="p-4 grid grid-cols-1 w-full  ">
      <DataTable
        title={<h2 className="text-xl sm:text-2xl font-bold"> All The Case</h2>}
        data={hook.data}
        columns={columns}
        cellClassName="py-[7px]"
        loading={hook.loading}
        error={hook.error}
        sorting={hook.sorting}
        setSorting={hook.setSorting}
        columnFilters={hook.columnFilters}
        setColumnFilters={hook.setColumnFilters}
        globalSearch={hook.globalSearch}
        onGlobalSearchChange={hook.setGlobalSearch}
        serverPagination={{
          pageIndex:        hook.pageIndex,
          pageCount:        hook.pageCount,
          pageSize:         hook.pageSize,
          total:            hook.total,
          onPageChange:     hook.setPageIndex,
          onPageSizeChange: hook.setPageSize,
        }}
        toolbar={(table, serverProps) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder=" Search case..."
            loading={hook.loading}
            handleRefresh={hook.refresh}
            excelExport={canExport && 
              <ExportExcel exportParams={exportParams} disabled={hook.loading} />
            }
            total={hook.total}
            {...serverProps}
          >
          <div className="flex items-center gap-2 overflow-x-auto w-full  pb-1">
              <DatePicker 
                  value={dateRange}
                  // onChange={(val) => handleChange("RangeTime",val)}
                  onChange={setDateRange}
                  variant="Date"
                  mode="range"
                  className={"w-fit min-w-fit"}
              />
            <DataTableFacetedFilter
              mode="server"
              title="Case Status"
              column={table.getColumn("CaseStatus")}
              options={CASE_STATUS_OPTIONS}
            />

            <DataTableFacetedFilter
              mode="server"
              title="Serial No"
              column={table.getColumn("SerialNumber")}
              fetchOptions={fetchSerialNumber}
            />
            <DataTableFacetedFilter
              mode="server"
              title="Product Name"
              column={table.getColumn("ProductName")}
              fetchOptions={fetchProductName}
            />
            <DataTableFacetedFilter
              mode="server"
              title="Product No"
              column={table.getColumn("ProductNumber")}
              fetchOptions={fetchProductNumber}
            />
            <DataTableFacetedFilter
              mode="server"
              title="Owner"
              column={table.getColumn("Owner")}
              fetchOptions={fetchOwner}
            />
            <DataTableFacetedFilter
              mode="server"
              title="Created By"
              column={table.getColumn("CreatedName")}
              fetchOptions={fetchCreatedBy}
            />
            {/* Date range — feeds into extraParams, not columnFilters */}
            {/* <div className="flex flex-col gap-1"> */}
            {/*   <span className="text-xs font-medium text-muted-foreground">From</span> */}
            {/*   <input type="date" value={startDate} */}
            {/*     onChange={(e) => setStartDate(e.target.value)} */}
            {/*     className="h-8 px-2 text-xs border rounded-md" /> */}
            {/* </div> */}
            {/* <div className="flex flex-col gap-1"> */}
            {/*   <span className="text-xs font-medium text-muted-foreground">To</span> */}
            {/*   <input type="date" value={endDate} */}
            {/*     onChange={(e) => setEndDate(e.target.value)} */}
            {/*     className="h-8 px-2 text-xs border rounded-md" /> */}
            {/* </div> */}

          
          </div>
          </DataTableToolbar>
        )}
      />
    </div>
  );
}
