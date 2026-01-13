import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect} from "react";
import ApiCustomer from "@/api";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { NotificationCard } from "@/components/NotificationCard";
import { useSocket } from '@/hooks/useSocket';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_ENUM_TO_LABEL } from "@/pages/CaseDetail";

export default function ApoLanding() {
    const { user } = useAuth();
    const [userData, setUserData] = useState([]);
      const [caseData, setCaseData] = useState([]);
      const [loading, setLoading] = useState(false);
      const [casevaluedata, setCasevaluedata] = useState([])
      const [inactivecasevaluedata, setInactivecasevaluedata] = useState([])
      const [closecasevaluedata, setClosecasevaluedata] = useState([])
    const [preview, setPreview] = useState({
        ProfilePhoto: null,
        Signature: null,
    });

      const radialchartdata = [
        { name: "Open", value: casevaluedata || 0, fill: "#3B82F6" },
        { name: "InActive", value: inactivecasevaluedata || 0, fill: "#FACC15" },
        { name: "Closed", value: closecasevaluedata || 0, fill: "#10B981" },
        // { name: "Pending", value: 5, fill: "#F97316" },
      ];
    
    
      useSocket("case:created", (newCase) => {
        console.log("case Created",newCase);
        setCaseData((prev) => [newCase, ...prev]); // prepend
      });
    
      useSocket("case:updated", (updated) => {
        console.log("Case Updated",updated);
        setCaseData((prev) =>
          prev.map((c) => (c.CaseID === updated.CaseID ? updated : c))
        );
      });

    const fetchData = async () => {
      setLoading(true);
        try {
            const response = await ApiCustomer.get('/api/case-information');
            const fecthUserData = await ApiCustomer.get(`/api/user/${user.id}`)
            const resFetchUserData = fecthUserData.data.data;
            console.log("Fetch user data : ", user)
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
             const valuefiltercases = response.data.data.filter(c => c?.caseinformation?.CreatedBy == user.id);
      const valueFilterOpenCase = response.data.data.filter(c => c?.CaseStatus == 'Open' && c?.caseinformation?.CreatedBy == user.id)
      const valueFilterInActiveCase = response.data.data.filter(c => c?.CaseStatus == 'InActive' && c?.caseinformation?.CreatedBy == user.id)
      const valueFilterCloseCase = response.data.data.filter(c => c?.CaseStatus == 'Close' && c?.caseinformation?.CreatedBy == user.id)
      const filtercases = response.data.data.filter(c => c?.CaseStatus !== 'Close' && c?.caseinformation?.Owner == user.id);
      // const rawDate = filtercases[0]?.caseinformation?.ActionLog[0]?.ChangeAt;
      // let newdate;
      // if (rawDate) {
      //   const dateObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
      //   console.log("Readable:", dateObj.toLocaleString("id-ID"));
      //   newdate = dateObj.toLocaleString("id-ID");
      // } else {
      //   console.log("No date available");
      // }
      const sortedCases = filtercases.sort((a, b) => {
          const dateAraw = a.UpdateOn;
        const dateBraw = b.UpdateOn;

        const dateA = dateAraw ? (dateAraw instanceof Date ? dateAraw : new Date(dateAraw)) : new Date(0);
        const dateB = dateBraw ? (dateBraw instanceof Date ? dateBraw : new Date(dateBraw)) : new Date(0);

        return dateB - dateA; // newest first
      });
      const recentCases = sortedCases.slice(0, 4);
      
      setCaseData(recentCases);
      setCasevaluedata(valueFilterOpenCase?.length);
      setInactivecasevaluedata(valueFilterInActiveCase?.length)
      setClosecasevaluedata(valueFilterCloseCase?.length);
      return response.data.data;
        } catch (err) {
            Swal.fire({
                   icon: 'error',
                   title: 'Error',
                   text: 'Gagal memuat data. Silakan coba lagi.',
                 });
                 console.error('Error fetching case data:', err);
                 throw err;
               } finally {
                 setLoading(false);
               }
    }
    useEffect(() => {
        fetchData();
    },[])
   
  const navigate = useNavigate();
    return (
      <div className="bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%" id='dashboard'>
        <div className="grid mt-4 m-5 gap-5 max-h-[calc(100vh-15px)] grid-rows-2 grid-cols-3">
            <Card className={"rounded-sm dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-700 dark:to-slate-900"} id='profile'>
                <CardHeader className={"grid grid-cols-2 items-start "} >
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
                    {/* <div className="flex justify-start">
                        <img  
                            src={user?.avatar || "/default-avatar.png"}
                            alt="avatar"
                            className="w-30 h-30 rounded-full border-4 border-white shadow-md text-center"
                        />
                    </div> */}
                    <div className="flex justify-end">
                    <Badge
                        variant={"outline"}
                        className={user.role === "apo" ? "bg-amber-200 dark:text-gray-700" : "bg-gray-200 dark:text-gray-700"}
                        >
                        {user.role}
                    </Badge>
                    </div>
                </CardHeader>
                <CardContent className={"ml-4 flex gap-1 flex-col "}>
                    <CardTitle className={"text-xl"}>{user?.name || "User"}</CardTitle>
                    <span className="text-gray-400 dark:text-gray-400">{user?.email}</span> 
                    <span className='text-sm text-gray-500 dark:text-gray-400'>{userData.Phone}</span>
                </CardContent>
                <span className="text-xs text-center text-gray-500 dark:text-gray-300">
                    Latest Login: {new Date().toLocaleString()}
                </span>
            </Card>

             <Card className={"rounded-sm col-span-2 row-span-2 dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-700 dark:to-slate-800"} id='recent-case'>
                <CardHeader>
                    <CardTitle className={"text-2xl"}>Recent Cases</CardTitle>
                    <hr className="dark:border-gray-300"/>
                </CardHeader>
                <CardContent className={"grid gap-3 max-h-[calc(100vh-200px)] overflow-y-auto grid-cols-2"}>
                     {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))
              : caseData.map((c) => (
                <Card
                  key={c.CaseID}
                  className="p-3 border-l-4 hover:scale-[0.99] rounded-lg shadow-sm hover:shadow-lg transition-all border-teal-400 bg-white cursor-pointer dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
                  onClick={() => navigate(`/app/case/${c.CaseID}`)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={`px-2 py-1 rounded-md text-xs font-medium
                      ${c.caseinformation.CasePriority === "High"
                          ? "bg-orange-100 text-orange-700"
                          : c.caseinformation.CasePriority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {c?.caseinformation.CasePriority || "Low"}
                    </Badge>
                    <Badge className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {STATUS_ENUM_TO_LABEL[c.CaseStatus]}
                    </Badge>
                  </div>
                  <p className="font-medium truncate mt-1">{c.CaseSubject}</p>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <p className="dark:text-gray-400">{c.CaseID}</p>
                    <span className="dark:text-gray-400">{c.CreatedOn}</span>
                  </div>
                </Card>
              ))}
                </CardContent>
            </Card>

            <Card className={"rounded-sm dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-700 dark:to-slate-900"} id='notifications'>
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