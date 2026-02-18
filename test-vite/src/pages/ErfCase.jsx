import ApiCustomer from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { File, RefreshCw } from 'lucide-react'
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { useAuth } from '@/context/auth-context'
import { DataTable } from '@/components/table-data/config/data-table'
import { DataTableToolbar } from '@/components/table-data/config/data-table-toolbar'
import { DataTableColumnHeader } from '@/components/table-data/config/data-table-column-header'
import { ErfUploader } from '@/components/erfNew'
import { Link } from "react-router"

function getErfColumns() {
  return [
    {
      accessorKey: "CaseID",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Case ID"} />
      ),
      cell: ({ row, getValue }) => {
        const caseId = getValue()
        const href = `/app/case/${caseId}`
        return (
          <Link to={href} className="block w-full py-1">
            <span className="text-blue-600 dark:text-sky-300 hover:underline">
              {caseId}
            </span>
          </Link>
        )
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "CreatedOn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Created On"} />
      ),
      // Optional: Format date if needed
      cell: ({ getValue }) => <span className="whitespace-break-spaces">{getValue()}</span>
    },
    {
      accessorKey: "CaseSubject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Case Subject"} />
      ),
      cell: ({ getValue }) => <span className="whitespace-break-spaces">{getValue()}</span>
    },
    {
      accessorKey: "caseinformation.ErfDoc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"ErfDoc"} />
      ),
      cell: ({ getValue }) =>
        getValue() && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              window.open(`${import.meta.env.VITE_API_BASE_URL}${getValue()}`)
            }
          >
            <File className="h-4 w-4" />
          </Button>
        ),
    },
    {
      accessorKey: "CustomerAccount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Company"} />
      ),
    },
    {
      accessorKey: "Primary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Primary"} />
      ),
    },
    {
      accessorKey: "SerialNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Serial No"} />
      ),
    },
    {
      accessorKey: "ProductNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Product No"} />
      ),
    },
    {
      accessorKey: "ProductName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Product Name"} />
      ),
    },
    {
      accessorKey: "CaseStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Case Status"} />
      ),
      cell: ({ getValue }) => {
        const status = getValue()
        let colorClass = "bg-emerald-300/80" // Default (Active/etc)

        if (status === "Close") {
          colorClass = "bg-red-300/80 dark:bg-red-600/80"
        } else if (status === "InActive") {
          colorClass = "bg-sky-300/80"
        }

        return (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded px-2 py-1",
              colorClass
            )}
          >
            {status}
          </div>
        )
      },
    },
  ]
}

export const ErfCase = () => {
  const [caseData, setCaseData] = useState([]);
  const [files, setFiles] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [erfCase, setErfCase] = useState([]);

  const columns = React.useMemo(() => getErfColumns(), [])
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState([])

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Main");

  const [reload, setReload] = useState(false)
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ApiCustomer.get("/api/case-information");
      const data = response.data.data;
      setCaseData(data);
      setPendingData(
        data.filter(
          (c) => c?.CaseStatus == "Close" && c?.caseinformation.ErfDoc == null && c.caseinformation.createdByUser.ResourceId == user.resource,
        ),
      );
      setErfCase(data.filter((c) => c?.caseinformation.ErfDoc !== null));
      return data;
    } catch (err) {
      toast.error("Failed to fetch case data");
    } finally {
      setLoading(false);
    }
  };

  function togglerelog(){
    setReload(p => !p)
  }

  useEffect(() => {
    fetchData();
  }, [reload]);

  return (
    <div className="bg-slate-200 p-5 h-full dark:bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
      <Tabs
        defaultValue="Main"
        onValueChange={(value) => {
          window.location.hash = value.toLowerCase();
          setActiveTab(value);
        }}
      >
        <TabsList className={"dark:bg-gray-700 w-full"}>
          <TabsTrigger
            value="Main"
        variant={"underline"}
    size={"lg"}
            className={"dark:data-[state=active]:bg-gray-500 items-center justify-center text-center"}
          >
            Main
          </TabsTrigger>
          <TabsTrigger
            value="Pending"
        variant={"underline"}
    size={"lg"}
            className={"dark:data-[state=active]:bg-gray-500 items-center justify-center text-center"}
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="ErfCase"
        variant={"underline"}
    size={"lg"}
            className={"dark:data-[state=active]:bg-gray-500 items-center justify-center text-center"}
          >
            ErfCase
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Main">
          <Card
            id="erf-main-upload"
            className={
              "dark:bg-gray-700 dark:border-2 dark:border-b-slate-500 dark:border-t-slate-600 dark:border-l-slate-600 dark:border-r-slate-500 dark:border-r-6"
            }
          >
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Upload Multiple ERF Files
              </h2>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                You can upload multiple ERF files. Maximum file size per file:
                10MB.
              </p>

         <ErfUploader caseData={caseData} files={files} setFiles={setFiles} onUploaded={() => fetchData} user={user}/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Pending">
    <div className="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 shadow-md p-2 grid grid-cols-1">
            <DataTable
              title={<h2 className="text-xl font-bold p-2">Pending ERF Cases</h2>}
              data={pendingData}
              cellName={'p-2'}
              columns={columns}
              loading={loading}
              sorting={sorting}
              setSorting={setSorting}
              handleRefresh={togglerelog}
              toolbar={(table) => (
                <DataTableToolbar table={table} searchPlaceholder="🔍 Search erf cases..." loading={loading} handleRefresh={togglerelog}/>
              )}
            />
          </div>
        </TabsContent>
        <TabsContent value="ErfCase">
    <div className="rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 shadow-md p-2 grid grid-cols-1">
            <DataTable
              title={<h2 className="text-xl font-bold p-2">Completed ERF Cases</h2>}
              data={erfCase}
              cellName={'p-2'}
              columns={columns}
              loading={loading}
              sorting={sorting}
              setSorting={setSorting}
              handleRefresh={togglerelog}
              toolbar={(table) => (
                <DataTableToolbar table={table} searchPlaceholder="🔍 Search erf cases..." loading={loading} handleRefresh={togglerelog}/>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
