import ApiCustomer from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { File } from 'lucide-react'
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

export const ErfCase = () => {
  const [caseData, setCaseData] = useState([])  
  const [selectedFiles, setSelectedFiles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5 

  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const response = await ApiCustomer.get('/api/case-information')
      const data = response.data.data.filter(c => c.CaseStatus == 'Close' && c.caseinformation?.ErfDoc === null)
      setCaseData(data)
      return data
    } catch (err) {
      console.log("THIS THING GIVE ME ERROR", err)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function uploadFiles(files) {
    if (files.length === 0) return;
    // Precompute once
    const CASE_IDS = new Set(caseData.map((e) => String(e.CaseID)));
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    const validFiles = [...files].filter((f) => {
      const base = f.name.replace(/\.[^.]+$/, ""); // "ABC123.png" -> "ABC123"

      if (!CASE_IDS.has(base)) {
        toast.warning(`Tidak menemukan Case ID untuk ${f.name}`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        toast.warning(`${f.name} lebih dari 5MB, tidak bisa diupload`);
        return false;
      }
      return true;
    });

    const formData = new FormData();
    for (let file of validFiles) {
      formData.append("files", file);
    }

    const res = await ApiCustomer.post("/api/case-information/erf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(res.data);

    if (res.data.success) {
      toast.info(`Upload ERF Successs`)
    }else {
      toast.warning("Gagal upload ERF")
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(caseData.length / PAGE_SIZE)
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return caseData.slice(start, start + PAGE_SIZE)
  }, [caseData, currentPage])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  const [activeTab, setActiveTab] = useState("Main");
  return (
    <div className='bg-slate-200 p-5 h-full dark:bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%'>
      <Tabs defaultValue="Main" onValueChange={(value) => {window.location.hash = value.toLowerCase()}}>
        <TabsList className={"dark:bg-gray-700"}>
          <TabsTrigger value="Main" className={"dark:data-[state=active]:bg-gray-500"}>Main</TabsTrigger>
          <TabsTrigger value="Pending" className={"dark:data-[state=active]:bg-gray-500"}>Pending</TabsTrigger>
        </TabsList>
        <TabsContent value="Main" >
          <Card id="erf-main-upload" className={"dark:bg-gray-700 dark:border-2 dark:border-b-slate-500 dark:border-t-slate-600 dark:border-l-slate-600 dark:border-r-slate-500 dark:border-r-6"}>
            <CardHeader>
              <h2 className="text-lg font-semibold">Upload Multiple ERF Files</h2>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                You can upload multiple ERF files. Maximum file size per file: 10MB.
              </p>
              <Input type="file" className={"dark:border-b-slate-400 dark:rounded-none dark:text-gray-400"} multiple onChange={(e) => setSelectedFiles(e.target.files)} />
              <button
                onClick={() => uploadFiles(selectedFiles)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2"
              >
                Submit
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Pending">
          <Card className="rounded-2xl border border-slate-200 shadow-md
                      bg-white/95 dark:bg-slate-900/90 dark:border-slate-700">
            <CardHeader>
              <h2 className="text-lg font-semibold">Closed Cases</h2>
            </CardHeader>
            <CardContent>
              <Table id="erf-pending-table" className="min-w-full border-collapse text-xs sm:text-sm">
                <TableHeader className="sticky top-0 bg-gray-200/95 dark:bg-slate-800/95">
                  <TableRow className="text-sm text-gray-700 uppercase bg-gray-200 dark:bg-slate-800 dark:text-slate-100">
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Case ID</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Created On</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Case Subject</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">ErfDoc</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Company</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Primary</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Serial Number</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Product Number</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Product Name</TableHead>
                    <TableHead className="p-2 text-center border border-slate-200 dark:border-slate-700 cursor-pointer">Case Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-4">No closed cases found.</TableCell>
                    </TableRow>
                  ) : (
                    currentPageData.map((c) => (
                      <TableRow key={c.CaseID} className={"text-center hover:bg-blue-50/70 dark:hover:bg-slate-700"}>
                        <TableCell
                          className="p-2 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-sky-300 cursor-pointer hover:underline"
                          onClick={() => navigate(`/app/case/${c.CaseID}`)}
                        >
                          {c.CaseID}
                        </TableCell>
                        <TableCell className="p-2 border  whitespace-break-spaces">{c.CreatedOn}</TableCell>
                        <TableCell className="p-2 border whitespace-break-spaces ">{c.CaseSubject}</TableCell>
                        <TableCell className="p-2 border">
                          {c.caseinformation?.ErfDoc && (
                            <Button onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}${c.caseinformation.ErfDoc}`)}>
                              <File />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="p-2 border whitespace-break-spaces">{c.CustomerAccount}</TableCell>
                        <TableCell className="p-2 border whitespace-break-spaces">{c.Primary}</TableCell>
                        <TableCell className="p-2 border whitespace-break-spaces">{c.SerialNumber}</TableCell>
                        <TableCell className="p-2 border whitespace-break-spaces">{c.ProductNumber}</TableCell>
                        <TableCell className="p-2 border whitespace-break-spaces">{c.ProductName}</TableCell>
                        <TableCell
                          className={cn(
                            "bg-emerald-300 ",
                            c.CaseStatus === "Close"
                              ? "bg-red-300 dark:bg-red-600"
                              : c.CaseStatus === "InActive"
                                ? "bg-sky-300"
                                : ""
                          )}
                        >
                          {c.CaseStatus}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <Pagination className="flex justify-start mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(currentPage - 1)
                        }}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(i + 1)
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(currentPage + 1)
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}