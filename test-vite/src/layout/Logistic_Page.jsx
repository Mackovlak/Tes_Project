import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect} from "react";
import ApiCustomer from "@/api";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { NotificationCard } from "@/components/NotificationCard";
import { useNavigate } from "react-router";
import { CaseField } from "@/pages/services/service-case";
import { ExportExcelPart } from "@/components/Export-Excel";
import { Skeleton } from "@/components/ui/skeleton";
import { SOImport, SOTemplateButton } from "../components/importFileComponent/SOUpdate";
import { toast } from "sonner";

export default function Logistik() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [MoData, setMoData] = useState([]);
    const [preview, setPreview] = useState({
        ProfilePhoto: null,
        Signature: null,  
    });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  

  const fetchData = async () => {
        setLoading(true);
        try {
            const fetchMo = await ApiCustomer.get('/api/mo-detaill');
            setMoData(fetchMo.data.data);      
            const fecthUserData = await ApiCustomer.get(`/api/user/${user.id}`)
            const resFetchUserData = fecthUserData.data.data;
            setUserData({
                ...userData,
                Username: resFetchUserData.Username,
                Name: resFetchUserData.Name,
                Email: resFetchUserData.Email,
                Phone: resFetchUserData.Phone || "",
                ProfilePhoto: resFetchUserData.ProfilePhoto,
                Signature: resFetchUserData.Signature,
            })
            setPreview({
                ProfilePhoto: fecthUserData.data.data.ProfilePhoto ? `${import.meta.env.VITE_API_BASE_URL}${fecthUserData.data.data.ProfilePhoto}` : null,
                Signature: fecthUserData.data.data.Signature ? `${import.meta.env.VITE_API_BASE_URL}${fecthUserData.data.data.Signature}` : null,
            });
            const valueFilterPartOrder = fetchMo.data.data.filter(m => {
                const item =  m?.materialorderlineitems?.[0]?.LineItemID
                const itemOwner  = m?.owner?.ResourceId === user?.resource
              return item && itemOwner
            }
          )
          setMoData(valueFilterPartOrder)            
          } catch (err) {
              toast.error("Fetching data: ",err);
          }finally {
              setLoading(false);
          }
    }
    useEffect(() =>{
        fetchData();
    },[])

    const filteredData =
    filterStatus === "All" ? MoData : 
    MoData.filter((m) => m.OrderStatus === filterStatus);
  
   const sortedData = [...filteredData].sort((a,b) => {
    const orderA = a.MOID;
    const orderB = b.MOID;
    return orderB.localeCompare(orderA);
  })
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);


    return (
      <div className="bg-gradient-to-t dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1% h-full" id='dashboard'>
        <div className="grid mt-4 m-5 gap-5 max-h-[calc(100vh-15px)] grid-rows-2 grid-cols-3 ">
            <Card className={"rounded-sm dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-700 dark:to-slate-900"} id='profile'>
                <CardHeader className={"grid grid-cols-2 items-start"}>
                    {!preview.ProfilePhoto && (
                    <div className="flex justify-start">
                        <div className="w-30 h-30 rounded-full border-4 border-white shadow-md text-center">
                        <span className="text-3xl font-bold">?</span>
                        </div>
                    </div>
                    )}
                    {preview.ProfilePhoto && (
                    <div className="flex justify-start">
                        <img
                        src={preview.ProfilePhoto}
                        alt="Profile Preview"
                        className="w-30 h-30 rounded-full border-4 border-white shadow-md text-center"
                        />
                    </div>
                    )}
                    <div className="flex justify-end">
                    <Badge
                        variant={"outline"}
                        >
                        {user.role}
                    </Badge>
                    </div>
                </CardHeader>
                <CardContent className={"ml-4 flex gap-1 flex-col"}>
                    <CardTitle className={"text-xl"}>{user?.name || "User"}</CardTitle>
                    <span className="text-gray-400 dark:text-gray-300">{user?.email}</span> 
                    <span className='text-sm text-gray-500 dark:text-gray-300'>{userData.Phone}</span>
                </CardContent>
                <span className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Latest Login: {new Date().toLocaleString()}
                </span>
            </Card>

             <Card className={"rounded-sm col-span-2 row-span-2 dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-tl dark:from-slate-900 dark:via-slate-700 dark:to-slate-800"} id='sparepart'>
                <CardHeader className={"flex flex-row gap-2 justify-between"}>
                    <CardTitle className={"text-2xl"}>Sparepart</CardTitle>
                    <div className="flex gap-2">
                    <ExportExcelPart/>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="focus:ring-2 focus:ring-blue-400 ring-2 ring-blue-400 p-1 rounded-sm dark:ring-gray-500 "
                    >
                      {["All", "New", "Ordered", "Shipped", "Closed", "BackOrdered", "Cancelled"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
                <CardContent className={"grid gap-5 "}>
                {loading ? Array.from({ length:4 }).map((_,i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-md dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600 dark:border-2"/>
                )) : currentData.map((m) => (
                  <div
                    key={m.MOID}
                    className="rounded-sm hover:bg-gray-50 cursor-pointer border-2 px-2 py-1 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600 dark:border-2 dark:hover:border-purple-600"
                    onClick={() =>
                      navigate(
                        `/app/material-order/${m.MOID}`
                      )
                    }
                    onContextMenu={(e) => {
                      e.preventDefault(); // Stop browser context menu

                      const textToCopy = `${m.SalesOrderNumber} / ${m.RMANumber}`;
                      navigator.clipboard.writeText(textToCopy);

                      // optional toast
                      toast.success("SO & RMA copied!");
                    }}
                  >
                    <CardHeader className="p-1 px-2">
                      <div className="flex flex-row justify-between ">
                      <CardTitle className={"flex flex-row gap-2 items-center"}>
                        {m.MOID} 
                        <Badge className={
                          m.OrderStatus === 'New' ? "text-white bg-green-500" : 
                          m.OrderStatus === 'Shipped' ? "text-white bg-yellow-500" : 
                          m.OrderStatus === 'Ordered' ? "text-white bg-blue-500" :
                          m.OrderStatus === 'Closed' ? "text-white bg-gray-500" :
                          m.OrderStatus === 'BackOrdered' ? "text-white bg-purple-500" :
                          "text-white bg-red-500"} variant="invisible">
                        {m.OrderStatus}
                        </Badge>
                      </CardTitle>
                      <CardTitle className={"text-sm text-gray-500"}>
                        {
                          m.workorder?.caseinformation?.CaseID
                        }
                      </CardTitle>          
                      </div>
                      <hr className="border-1 border-gray-500 rounded-md"/>
                    </CardHeader>
                    <CardContent className="flex justify-between px-2">
                      <div className="space-y-1">
                      <CaseField className={"text-md"}>
                      <span> Part Number - Part Description</span>
                      </CaseField>
                      <CaseField className={"text-md"}>
                        {m.materialorderlineitems?.[0]?.PartNumber} / {m.materialorderlineitems?.[0]?.Description}
                      </CaseField>
                      </div>

                      <div className="flex flex-col items-end text-right gap-1">
                      <CaseField className="flex gap-1 items-center">
                        <span>SO Number - RMA Number</span>
                      </CaseField>
                      <CaseField className="flex gap-1 items-center">
                        {m.SalesOrderNumber} / {m.RMANumber}
                      </CaseField>
                      </div>
                    </CardContent>
                  </div>
                ))
          }
        </CardContent>

        {/* Pagination Controls */}
        <CardFooter className="items-center flex gap-4">
          <button
            className=" px-2 bg-gray-300 rounded disabled:opacity-50 cursor-pointer dark:text-gray-300 dark:bg-gray-500"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className=" px-2 bg-gray-300 rounded disabled:opacity-50 cursor-pointer dark:text-gray-300 dark:bg-gray-500"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </CardFooter>
        </Card>

        <Card className={"rounded-sm dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-tl dark:from-slate-900 dark:via-slate-700 dark:to-slate-800"} id='notifications'>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className={"overflow-y-auto space-y-3"}>
                <NotificationCard />
            </CardContent>
        </Card> 
        </div>
      </div>
    )
}