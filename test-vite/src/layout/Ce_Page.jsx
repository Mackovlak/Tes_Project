import ApiCustomer from '@/api';
import { ChartRadialText } from '@/components/sc-chart';
import ToastTester from '@/components/ToastComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/hooks/useSocket';
import { set } from 'lodash';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function Ce_Page() {
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

  const [notfilog, setNotfilog] = useState([])

  const radialchartdata = [
    { name: "Open", value: casevaluedata || 0, fill: "#3B82F6" },
    { name: "In Progress", value: inactivecasevaluedata || 0, fill: "#FACC15" },
    { name: "Closed", value: closecasevaluedata || 0, fill: "#10B981" },
    // { name: "Pending", value: 5, fill: "#F97316" },
  ];

  console.log(radialchartdata, "the data")

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
      const fecthUserData = await ApiCustomer.get(`/api/user/${user.id}`);
      const resFetchUserData = fecthUserData.data.data;
      console.log("Fetch user daya : ", user)
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
      const valuefiltercases = response.data.data.filter(c => c?.CreatedName == user.name);
      const valueFilterOpenCase = response.data.data.filter(c => c?.CaseStatus == 'Open' && c?.CreatedName == user.name)
      const valueFilterInActiveCase = response.data.data.filter(c => c?.CaseStatus == 'InActive' && c?.CreatedName == user.name)
      const valueFilterCloseCase = response.data.data.filter(c => c?.CaseStatus == 'Close' && c?.CreatedName == user.name)
      const filtercases = response.data.data.filter(c => c?.CaseStatus !== 'Close');
      const sortedCases = filtercases.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
      const recentCases = sortedCases.slice(0, 4);
      console.log("Length of the arrays", valuefiltercases);
      setCaseData(recentCases);
      setCasevaluedata(valueFilterOpenCase?.length);
      setInactivecasevaluedata(valueFilterInActiveCase?.length)
      setClosecasevaluedata(valueFilterCloseCase?.length);
      return response.data.data;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data. Silakan coba lagi.',
      });
      console.error('Error fetching case data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  console.log(caseData)
  console.log("THe value ", casevaluedata)
  return (
    <div className="max-h-[calc(100vh-64px)] w-full grid grid-cols-4 grid-rows-2 gap-4 p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Left Column - Profile */}
      <div className="col-span-1 space-y-4">
        <Card className="rounded-xl shadow-lg h-full flex flex-col">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-cyan-300 text-white text-center">
            {/* <div className="flex flex-col items-center">
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt="avatar"
                className="w-20 h-20 rounded-full border-4 border-white shadow-md-mb-10"
              />
            </div> */}
            {!preview.ProfilePhoto && (
              
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-md -mb-10">
                  <span className="text-3xl font-bold">?</span>
                </div>
              </div>
            )}
            {preview.ProfilePhoto && (
              <div className="flex flex-col items-center">
                <img
                  src={preview.ProfilePhoto}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md -mb-10"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-12 text-center flex-1">
            <CardTitle>{user?.name || "User"}</CardTitle>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className='text-sm text-gray-500'>{userData.Phone}</p>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className={user.role === "admin" ? "bg-amber-200" : "bg-gray-200"}
            >
              {user.role}
            </Badge>
            <p className="text-xs text-gray-500">
              Latest Login: {new Date().toLocaleString()}
            </p>
          </CardFooter>
        </Card>
      </div>
    
      {/* Center Column - Chart */}
      <div className="col-span-2 space-y-4" hidden>
        <Card className="rounded-xl shadow-lg p-4 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Cases Overview</CardTitle>
            <CardDescription>Today’s activity</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <ChartRadialText radialchartdata={radialchartdata} />
          </CardContent>
        </Card>
      </div>

      <div className='col-span-2'>
        <Card className={"rounded-xl shadow-lg h-full"}>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Notifications */}
      <div className="col-span-1 space-y-4">
        <Card className="rounded-xl shadow-lg p-4 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            <NotificationCard />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Recent Cases */}
      <div className="col-span-4 space-y-4">
        <Card className="rounded-xl shadow-lg p-4 h-full">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[40vh]" >
            {loading ?
              (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton className="h-20 w-full" />
                ))
              )
              :
              (caseData.map((c) => (
                <>
                  <Card
                    key={c.SerialNumber}
                    className="p-3 border-l-4 hover:scale-95 rounded-lg shadow-sm hover:shadow-lg transition-all border-teal-400 bg-white cursor-pointer"
                    onClick={() => navigate(`/app/case/${c.CaseID}`)}
                  >
                    <div className="space-x-1">
                      <Badge className={`px-2 py-1 rounded-md text-xs font-medium
            ${c.CasePriority === "High" ? "bg-orange-100 text-orange-700" :
                          c.CasePriority === "Critical" ? "bg-red-100 text-red-700" :
                            "bg-gray-200 text-gray-700"}`}>
                        {c?.CasePriority || 'Low'}

                      </Badge>
                      <Badge className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {c.CaseStatus}
                      </Badge>
                      <p className="font-medium truncate">{c.CaseSubject}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <p>{c.CaseID}</p>

                      <span>{c.CreatedOn}</span>
                    </div>
                  </Card>
                </>
              )))}
              <div className="">
                {/* <ToastTester/> */}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
}


export function NotificationCard({ n }) {
  const notif = [
    { id: 1, type: "created", caseId: "C-1023", user: "John Doe", date: "2025-08-24T09:15", description: "New case created" },
    { id: 2, type: "updated", caseId: "C-1021", user: "Jane Smith", date: "2025-08-24T10:30", description: "Case updated" },
    { id: 3, type: "assigned", caseId: "C-1018", user: "System", date: "2025-08-24T11:00", description: "Assigned to you" },
    { id: 4, type: "closed", caseId: "C-1015", user: "Admin", date: "2025-08-24T12:45", description: "Case closed" },
  ];
  const typeColors = {
    created: "bg-blue-100 text-blue-700",
    updated: "bg-yellow-100 text-yellow-700",
    assigned: "bg-purple-100 text-purple-700",
    closed: "bg-green-100 text-green-700",
  };

  return (

    notif.map((i) => (
      <Card className="shadow-md border rounded-xl hover:shadow-lg transition" key={i.caseId}>
        <CardHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[i.type]}`}>
              {i.type}
            </span>
            <span className="text-xs text-gray-400">{new Date(i.date).toLocaleString()}</span>
          </div>
          <CardTitle className="text-sm font-semibold">{i.title || `Case ${i.caseId}`}</CardTitle>
          <CardDescription>{i.description} by {i.user}</CardDescription>
        </CardHeader>
      </Card>
    ))

  );
}