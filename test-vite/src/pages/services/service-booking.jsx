import React from 'react'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { SelectBarRelated } from '../../components/sc-select'
import { CalendarDays,  Lock, PlusCircle } from 'lucide-react'

'use client'

import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import ApiCustomer from "@/api";
import debounce from 'lodash.debounce';
import Swal from 'sweetalert2';
import DatePicker from '../../components/date-picker';
import { TabsBooking } from '../../components/tests/tab';

import { getUserFromToken } from "@/lib/utils/auth";
import CaseField from '@/components/CaseField';
import { toast } from 'sonner';

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


export function ServiceBooking ({BookingId , woid}) {  
  
  const { bookingid } = useParams();
  const [tab, setTab] = useState("book_info");
  const [bookingData, setBookingData] = useState(null);
  const [resourceName, setResourceName] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [subkTechnicianName, setSubkTechnicianName] = useState("");
  const [subkTechnicianId, setSubkTechnicianId] = useState(null);
  
  const [subkTechnicianLearnerName, setSubkTechnicianLearnerName] = useState("");
  const [subkTechnicianLearnerId, setSubkTechnicianLearnerId] = useState(null);
  

  const [bookingStatus, setBookingStatus] = useState("");
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [requestedDateTimeCustomer, setRequestedDateTimeCustomer] = useState("");
  const [guaranteedFixTimeCustomer, setGuaranteedFixTimeCustomer] = useState("");

  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [ceScheduleChange, setCeScheduleChange] = useState(false);

  const [startTimeCustomerTime, setStartTimeCustomerTime] = useState("");
  const [endTimeCustomerTime, setEndTimeCustomerTime] = useState("");
  const [estimatedArrivalTimeCustomerTime, setEstimatedArrivalTimeCustomerTime] = useState("");
  const [actualArrivalTimeCustomerTime, setActualArrivalTimeCustomerTime] = useState("");

  const [startTimeUserTime, setStartTimeUserTime] = useState("");
  const [endTimeUserTime, setEndTimeUserTime] = useState("");
  const [durationInMinutesUserTime, setDurationInMinutesUserTime] = useState(0);
  const [estimatedArrivalTimeUserTime, setEstimatedArrivalTimeUserTime] = useState("");
  const [actualArrivalTimeUserTime, setActualArrivalTimeUserTime] = useState("");

  const [scheduleJeopardy, setScheduleJeopardy] = useState(false);
  const [scheduleJeopardyTime, setScheduleJeopardyTime] = useState("");

  const [totalBillableDurationInMinutes, setTotalBillableDurationInMinutes] = useState(0);
  const [totalInProgressDurationInMinutes, setTotalInProgressDurationInMinutes] = useState(0);
  const [totalBreakDurationInMinutes, setTotalBreakDurationInMinutes] = useState(0);  

  const [searchResultsResource, setSearchResultsResource] = useState([]);
  const [searchResultsAccount, setSearchResultsAccount] = useState([]);
  const [searchResultsSubkTechnician, setSearchResultsSubkTechnician] = useState([]);
  const [searchResultsSubkTechnicianLearner, setSearchResultsSubkTechnicianLearner] = useState([]);

  const [bookingDetailsData, setBookingDetailsData] = useState({
    resourceId: "",
    ResourceAccountId: "",
  });

  const [changedBy, setChangedBy] = useState(1);

  

  useEffect(() => {
    async function fetchBooking() {
      if (bookingid == ""){
         Swal.fire({
      title: 'Memuat data booking...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
      };
      try {
        const response = await ApiCustomer.get(`/api/bookings/${bookingid}`);
        const data = response.data; // <- Harusnya langsung .data, BUKAN .data.booking
        setBookingData(response.data);
        
        // Set field-field yang kamu butuhkan
        setResourceName(data?.bookingDetails?.[0]?.resource?.Name || "");
        setResourceId(data?.bookingDetails?.[0]?.resource?.ResourceId || "");
        setAccountName(data?.bookingDetails?.[0]?.resourceaccount?.Name || "");
        setAccountId(data?.bookingDetails?.[0]?.resourceaccount?.ResourceAccountId || "");
        setSubkTechnicianName(data?.bookingDetails?.[0]?.subkTechnician?.Name || "");
        setSubkTechnicianId(data?.bookingDetails?.[0]?.subkTechnician?.SubkTechnicianId || "");
        
        setBookingStatus(data?.BookingStatus || "");
        setWorkOrderNumber(data?.workorder?.WorkOrderNumber || "");
        setRequestedDateTimeCustomer(new Date(data?.workorder?.RequestedDateTimeCustomer || ""));
        setGuaranteedFixTimeCustomer(new Date(data?.workorder?.GuaranteedFixTimeCustomer || ""));
        
        setDoNotDisturb(data?.DoNotDisturb || false);
        setCeScheduleChange(data?.CeScheduleChange || false);
        
        setStartTimeCustomerTime(formatDateForInput(data?.bookingDetails?.[0]?.StartTimeCustomerTime || ""));
        setEndTimeCustomerTime(formatDateForInput(data?.bookingDetails?.[0]?.EndTimeCustomerTime || ""));
        setEstimatedArrivalTimeCustomerTime(formatDateForInput(data?.bookingDetails?.[0]?.EstimatedArrivalTimeCustomerTime || ""));
        setActualArrivalTimeCustomerTime(formatDateForInput(data?.bookingDetails?.[0]?.ActualArrivalTimeCustomerTime || ""));
        
        setStartTimeUserTime(formatDateForInput(data?.bookingDetails?.[0]?.StartTimeUserTime || ""));
        setEndTimeUserTime(formatDateForInput(data?.bookingDetails?.[0]?.EndTimeUserTime || ""));
        setDurationInMinutesUserTime(data?.bookingDetails?.[0]?.DurationInMinutesUserTime || 0);
        setEstimatedArrivalTimeUserTime(formatDateForInput(data?.bookingDetails?.[0]?.EstimatedArrivalTimeUserTime || ""));
        setActualArrivalTimeUserTime(formatDateForInput(data?.bookingDetails?.[0]?.ActualArrivalTimeUserTime || ""));

        setScheduleJeopardy(data?.ScheduleJeopardy || false);
        setScheduleJeopardyTime(formatDateForInput(data?.ScheduleJeopardyTime || ""));
        
        setTotalBillableDurationInMinutes(data?.TotalBillableDurationInMinutes || 0);
        setTotalInProgressDurationInMinutes(data?.TotalInProgressDurationInMinutes || 0);
        setTotalBreakDurationInMinutes(data?.TotalBreakDurationInMinutes || 0);
      } catch (error) {
        Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data',
        text: error.message || 'Terjadi kesalahan saat mengambil data.',
      });
      }finally {
        Swal.close();
      }
    }
    
    if (bookingid) {
      fetchBooking();
    }
  }, []);

  if (!bookingData) {
     Swal.fire({
      title: 'Memuat data booking...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  const handleUpdate = async () => {
    Swal.fire({
    title: 'Saving...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
    const updatedBookingData = {
      ...bookingData, // keep all original fields
      ResourceId: resourceId,
      ResourceAccountId: accountId,
      SubkTechnicianId: subkTechnicianId,
      StartTimeCustomerTime: startTimeCustomerTime || null,
      EndTimeCustomerTime: endTimeCustomerTime || null,
      EstimatedArrivalTimeCustomerTime: estimatedArrivalTimeCustomerTime || null,
      ActualArrivalTimeCustomerTime: actualArrivalTimeCustomerTime || null,
      StartTimeUserTime: startTimeUserTime || null,
      EndTimeUserTime: endTimeUserTime || null,
      DurationInMinutesUserTime: durationInMinutesUserTime || null,
      EstimatedArrivalTimeUserTime: estimatedArrivalTimeUserTime || null,
      ActualArrivalTimeUserTime: actualArrivalTimeUserTime || null,
    };
    await setBookingData(updatedBookingData);
    try {
      await ApiCustomer.patch(`/api/bookings/${bookingid}`, {
        ChangedBy: changedBy,
        BookingStatus: bookingStatus,
        DoNotDisturb: doNotDisturb,
        CeScheduleChange: ceScheduleChange,
        ScheduleJeopardy: scheduleJeopardy,
        ScheduleJeopardyTime: scheduleJeopardyTime ? new Date(scheduleJeopardyTime) : null,
        TotalBillableDurationInMinutes: totalBillableDurationInMinutes,
        TotalInProgressDurationInMinutes: totalInProgressDurationInMinutes,
        TotalBreakDurationInMinutes: totalBreakDurationInMinutes,
        bookingDetailsData: updatedBookingData,
        bookingDetails2Data: bookingDetailsData
      });

      Swal.fire({
        title: 'Success',
        icon: "success",
        text: "Booking telah berhasil di simpan",
      }).then(() => {
        window.location.href = `/work/${bookingData.WOID}`
      })
    } catch (error) {
      toast.error("Error updating booking:", error);
    }
  };

  const handleSearchResource = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResultsResource([]);
      return;
    }
  
    try {
      const response = await ApiCustomer.get(`/api/resources`, {
        params: { keyword }
      });
      setSearchResultsResource(response.data.data);
    } catch (error) {
      toast.error("Error fetching Subk Technician search:", error);
    }
  }, 500); 

  
  const fetchResourceAccount = async (resourceId) => {
    try {
      const response = await ApiCustomer.get(`/api/resourceAccounts?resourceId=${resourceId}`);
      const data = response.data.data
      setAccountName(data.Name);
      setAccountId(data.ResourceAccountId);

      setBookingDetailsData((prev) =>({
        ...prev,
        ResourceAccountId: data.ResourceAccountId                            
      }))
    } catch (error) {
      toast.error("Error fetching Subk Technician search:", error);
    }
  }
  
  const handleSearchAccount = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResultsAccount([]);
      return;
    }
  
    try {
      const response = await ApiCustomer.get(`/api/accounts`, {
        params: { keyword }
      });
      setSearchResultsAccount(response.data);
    } catch (error) {
      toast.error("Error fetching Subk Technician search:", error);
    }
  }, 500); 


  const handleSearchSubkTechnician = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResultsSubkTechnician([]);
      return;
    }
  
    try {
      const response = await ApiCustomer.get(`/api/user?resource=${resourceId}`);
      setSearchResultsSubkTechnician(response.data.data);
    } catch (error) {
      toast.error("Error fetching Subk Technician search:", error);
    }
  }, 500); 
  

  const handleSearchSubkTechnicianLearner = debounce(async (keyword) => {
    if (!keyword) {
      setSearchResultsSubkTechnicianLearner([]);
      return;
    }
  
    try {
      const response = await ApiCustomer.get(`/api/subktechnicianslearner`, {
        params: { keyword }
      });
      setSearchResultsSubkTechnicianLearner(response.data);
    } catch (error) {
      toast.error("Error fetching Subk Technician search:", error);
    }
  }, 500); // 500ms delay

  return (
    <div className=''>
      <TabsBooking
        handleUpdate={handleUpdate}
        bookingData={bookingData}
      />
    <Card className="mt-2 rounded-none">
      {/* <Button onClick={handleUpdate}>Save</Button> */}
      
      <Tabs value={tab} onValueChange={setTab}>
        <CardHeader className={"flex flex-col border-2 p-2 gap-3 w-full"}>
          <CardTitle className="text-xl ">
            New Bookable Resource Booking
          </CardTitle>
          <CardTitle className="text-sm">
            Bookable Resource Booking . Information
          </CardTitle>
          <TabsList className="bg-white ">
            <TabsTrigger
              variant={"underline"}
              value="book_info"
              className="cursor-pointer"
            >
              Booking Information
            </TabsTrigger>
            <TabsTrigger
              variant={"underline"}
              value="field_service"
              className="cursor-pointer white"
            >
              Field Service
            </TabsTrigger>
            <TabsTrigger
              variant={"underline"}
              value="timeline"
              className="cursor-pointer"
            >
              Timeline
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="book_info" className="gap-2 p-0 m-0 space-y-2 columns-3 ">
          <Card className="h-full break-inside-avoid ">
            <CardContent className="grid items-center h-full grid-cols-3 gap-x-10 gap-y-4">
              <CaseField label={"Name"} icon span={2}>
                <Input
                  variant={"invisible"}
                  value={
                    resourceId !== "" ||
                    bookingData?.bookingDetails?.[0]?.resource?.resourceId !==
                      ""
                      ? resourceName
                      : "---"
                  }
                />
              </CaseField>
              <CaseField label={"Resource"} span={2} star>
                <Input
                  variant={"invisible"}
                  value={resourceName}
                  onChange={(e) => {
                    setResourceName(e.target.value);
                    handleSearchResource(e.target.value);
                  }}
                />
                {searchResultsResource.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 overflow-y-auto transition-all duration-200 bg-white border rounded shadow-lg max-h-60">
                    {searchResultsResource.map((res) => (
                      <li
                        key={res.ResourceId}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setResourceName(res.Name);
                          setResourceId(res.ResourceId);
                          setSearchResultsResource([]); // Clear suggestions
                          setBookingDetailsData((prev) => ({
                            ...prev,
                            resourceId: res.ResourceId,
                          }));

                          fetchResourceAccount(res.ResourceId);
                        }}
                      >
                        {res.Name}
                      </li>
                    ))}
                  </ul>
                )}
              </CaseField>
              <div className="grid grid-cols-3 col-span-3 p-3 ring-1">
                <CaseField label={"Account"} icon span={2}>
                  <Input
                    variant={"invisible"}
                    value={accountName}
                    onChange={(e) => {
                      setAccountName(e.target.value);
                    }}
                  />
                  {searchResultsAccount.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border">
                      {searchResultsAccount.map((acc) => (
                        <li
                          key={acc.id}
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => {
                            setAccountName(acc.Name);
                            setAccountId(acc.ResourceAccountId);
                            setSearchResultsAccount([]); // Clear suggestions
                            setBookingDetailsData((prev) => ({
                              ...prev,
                              ResourceAccountId: acc.ResourceAccountId,
                            }));
                          }}
                        >
                          {acc.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </CaseField>
              </div>
              <CaseField label={"Subk Technician Name"} span={2} star>
                <Input
                  variant={"invisible"}
                  value={subkTechnicianName}
                  onChange={(e) => {
                    setSubkTechnicianName(e.target.value);
                    handleSearchSubkTechnician(e.target.value);
                  }}
                />
                {searchResultsSubkTechnician.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border">
                    {searchResultsSubkTechnician.map((tech) => (
                      <li
                        key={tech.SubkTechnicianId}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSubkTechnicianName(tech.Name);
                          setSubkTechnicianId(tech.SubkTechnicianId);
                          setSearchResultsSubkTechnician([]); // Clear suggestions
                        }}
                      >
                        {tech.Name}
                      </li>
                    ))}
                  </ul>
                )}
              </CaseField>
              <CaseField label={"Subk Technician Learner ID"} span={2}>
                <Input
                  variant={"invisible"}
                  value={subkTechnicianId}
                  onChange={(e) => setSubkTechnicianId(e.target.value)}
                />
                {searchResultsSubkTechnicianLearner.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border">
                    {searchResultsSubkTechnicianLearner.map((learn) => (
                      <li
                        key={learn.id}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSubkTechnicianLearnerName(learn.name);
                          setSubkTechnicianLearnerId(learn.id);
                          setSearchResultsSubkTechnicianLearner([]); // Clear suggestions
                        }}
                      >
                        {learn.name}
                      </li>
                    ))}
                  </ul>
                )}
              </CaseField>
              <CaseField label={"Booking Status"} span={2} star>
                <Input
                  variant={"invisible"}
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value)}
                />
              </CaseField>
              <CaseField label={"Work Order"} icon span={2}>
                <Input variant={"invisible"} value={workOrderNumber} readOnly />
              </CaseField>
              <div className="grid items-center grid-cols-3 col-span-3 p-3 ring-1 gap-2">
                <CaseField
                  label={"Requested Date Time (costumer)"}
                  icon
                  span={2}
                >
                  <DatePicker
                    value={requestedDateTimeCustomer}
                    onChange={
                      setRequestedDateTimeCustomer
                    }
                    />
                </CaseField>
                <CaseField
                  label={"Guaranteed Fix Time (costumer)"}
                  icon
                  span={2}
                >
                  <DatePicker
                    value={guaranteedFixTimeCustomer}
                    onChange={setGuaranteedFixTimeCustomer}
                    />
                </CaseField>
              </div>
              <CaseField
                label={"Do not Distrub"}
                span={2}
                childClass={" justify-center place-content-center flex"}
              >
                <Select
                  className=""
                  value={doNotDisturb ? 'yes' : 'no'}
                  onValueChange={(value) => setDoNotDisturb(value === 'yes')}
                >
                  <SelectTrigger className={'w-full'}>
                    <SelectValue placeholder='---' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='yes'>Yes</SelectItem>
                    <SelectItem value='no'>No</SelectItem>
                  </SelectContent>
                </Select>
              </CaseField>
              <CaseField
                label={"Ce Schedule Change"}
                span={2}
                childClass={" justify-center place-content-center flex"}
              >
                <Select
                  className=""
                  value={ceScheduleChange ? 'yes' : 'no'}
                  onValueChange={(value) => setCeScheduleChange(value === 'yes')}
                >
                  <SelectTrigger className={'w-full'}>
                    <SelectValue placeholder='---' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='yes'>Yes</SelectItem>
                    <SelectItem value='no'>No</SelectItem>
                  </SelectContent>
                </Select>
              </CaseField>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid h-fit ">
            <CardHeader>
              <CardTitle className="text-lg ">
                Booking Dates in User Time
              </CardTitle>
              <hr />
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6">
              <CaseField label={"Start Time"} span={2} star>
                <DatePicker
                  value={
                    startTimeUserTime ? new Date(startTimeUserTime) : ""
                  }
                  onChange={
                    setStartTimeUserTime
                  }
                ></DatePicker>
              </CaseField>
              <CaseField label={"End Time"} span={2} star>
                <DatePicker
                  
                  value={endTimeUserTime ? new Date(endTimeUserTime) : ""}
                  onChange={
                    setEndTimeUserTime
                  }
                ></DatePicker>
              </CaseField>
              <CaseField label={"Duration"} span={2} star>
                <Input
                  type="number"
                  value={durationInMinutesUserTime}
                  onChange={(e) => setDurationInMinutesUserTime(e.target.value)}
                />
              </CaseField>
              <CaseField label={"Estimated Arrival Time"} span={2} star>
                <DatePicker
                  
                  value={
                    estimatedArrivalTimeUserTime
                      ? new Date(estimatedArrivalTimeUserTime)
                      : ""
                  }
                  onChange={
                    setEstimatedArrivalTimeUserTime
                  }
                ></DatePicker>
              </CaseField>
              <CaseField label={"Actual Arrival Time"} span={2} star>
                <DatePicker
                  
                  value={
                    actualArrivalTimeUserTime
                      ? new Date (actualArrivalTimeUserTime)
                      : ""
                  }
                  onChange={
                    setActualArrivalTimeUserTime
                  }
                ></DatePicker>
              </CaseField>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid h-fit ">
            <CardHeader>
              <CardTitle className="text-lg ">Timestamp</CardTitle>
              <hr />
            </CardHeader>
           
          </Card>

          <Card className="break-inside-avoid h-fit ">
            <CardHeader>
              <CardTitle className="text-lg ">SLA Jeopardy</CardTitle>
              <hr />
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6">
              <CaseField label={'Schedule Jeopardy'} span={2}>
              <Input
                  type="text"
                  value={scheduleJeopardy}
                  onChange={(e) => setScheduleJeopardy(e.target.value)}
                />
              </CaseField>
              <CaseField label={'Schedule Jeopardy Time'} span={2}>
                <DatePicker value={
                    scheduleJeopardyTime
                      ? new Date(scheduleJeopardyTime)
                      : ""
                  }
                  onChange={setScheduleJeopardyTime}></DatePicker>
              </CaseField> 
            </CardContent>
          </Card>

          <Card className="break-inside-avoid h-fit ">
            <CardHeader>
              <CardTitle className="text-lg ">
                Booking Dates in Customer Time Zone
              </CardTitle>
              <hr />
            </CardHeader>
            <CardContent className="grid items-center grid-cols-3 gap-6">
              <CaseField label={'Start Time (Customer)'} span={2} star>
                <DatePicker 
                  value={startTimeCustomerTime ? new Date(startTimeCustomerTime) : ""}
                  onChange={setStartTimeCustomerTime}
                />
              </CaseField>
              <CaseField label={'End TIme (Customer)'} span={2} star>
                <DatePicker 
                  value={endTimeCustomerTime ? new Date(endTimeCustomerTime) : ""}
                  onChange={setEndTimeCustomerTime}
                />
              </CaseField>
              <CaseField label={'Estimated Arrival Time (Customer)'} span={2} star>
                <DatePicker 
                  value={estimatedArrivalTimeCustomerTime ? new Date(estimatedArrivalTimeCustomerTime) : ""}
                  onChange={setEstimatedArrivalTimeCustomerTime}
                />
              </CaseField>
              <CaseField label={'Actual Arrival Time (Customer)'} span={2} star>
                <DatePicker 
                  value={actualArrivalTimeCustomerTime ? new Date(actualArrivalTimeCustomerTime) : ""}
                  onChange={setActualArrivalTimeCustomerTime}
                />
              </CaseField>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid h-fit ">
            <CardHeader>
              <CardTitle className="text-lg ">Total Duration</CardTitle>
              <hr />
            </CardHeader>
            <CardContent className="grid items-center grid-cols-3 gap-5 ">
              <CaseField label={'Total Duration'} span={2}>
                <Input
                    type="number"
                    value={totalBillableDurationInMinutes}
                    onChange={(e) =>
                      setTotalBillableDurationInMinutes(e.target.value)
                    }
                  />
              </CaseField>
              <CaseField label={'Total Duration in Progress'} span={2}>
                <Input
                  type="number"
                  value={totalInProgressDurationInMinutes}
                  onChange={(e) =>
                    setTotalInProgressDurationInMinutes(e.target.value)
                  }
                />
              </CaseField>
              <CaseField label={'Total Break Duration'} span={2}>
                <Input
                  type="number"
                  value={totalBreakDurationInMinutes}
                  onChange={(e) =>
                    setTotalBreakDurationInMinutes(e.target.value)
                  }
                />
              </CaseField>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field_service">
          <Card className="flex-col ">
            <CardContent className="grid gap-5.5">
              <div className="flex font-bold">
                <Lock className="mr-2 size-5"></Lock>
                <span>Field Service</span>
                <span className="ml-40">...</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="flex-col mt-7 w-[500px]">
            <CardContent className="grid gap-5.5">
              <div className="flex font-bold">
                <Lock className="mr-2 size-5"></Lock>
                <span>Timeline</span>
                <span className="ml-40">...</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
    </div>
  );
}

// Fungsi pengecekan format dan isi dari RequestedDateTimeCustomer
const CheckRequestedDateTimeCustomer = async (WOID) => {
  try {
    const res = await ApiCustomer.get(`/api/work-order/${WOID}`);
    const woData = res.data.data;

    const rawDateTime = woData?.RequestedDateTimeCustomer;

    // Convert to Date object
    const parsedDate = new Date(rawDateTime);

    if (!rawDateTime || 
      !(parsedDate  instanceof Date) || 
      isNaN(parsedDate.getTime())) {
      await Swal.fire({
        icon: 'warning',
        title: "Gagal membuat booking",
        text: "RequestedDateTimeCustomer belum diisi.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      return false;
    }

    const formatted = formatDateForInput(rawDateTime);

    const isValidFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(formatted);
    if (!isValidFormat) {
      await Swal.fire({
        icon: 'warning',
        title: "Gagal membuat booking",
        text: "Format RequestedDateTimeCustomer tidak valid.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      window.location.reload();
      return false;
    }

    const dateObj = new Date(rawDateTime);
    if (isNaN(dateObj.getTime())) {
      await Swal.fire({
        icon: 'warning',
        title: "Gagal membuat booking",
        text: "Nilai RequestedDateTimeCustomer tidak valid.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      });
      window.location.reload();
      return false;
    }

    return true;
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: "Terjadi kesalahan",
      text: "Kesalahan saat validasi RequestedDateTimeCustomer.",
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    });
    window.location.reload();
    return false;
  }
};


export function NewBookableResourceBooking({ CaseID, WOID, CreatedBy, RequestedDateTimeCustomer}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      
      const isValid = await CheckRequestedDateTimeCustomer(WOID);
      
      if (!isValid) return;
      //getLogistic
      const getCaseDetail = await ApiCustomer.get(`/api/case-information/${CaseID}`)
      const getLogistic = await ApiCustomer.get(`/api/user?role=lg`)
      
      const selectedLogistic = getLogistic.data.data.find(user => user.Username === 'logis');
      const caseDetails = getCaseDetail.data.data
      
      const data = {
        WOID: WOID,
        CreatedBy: CreatedBy,
        user: getUserFromToken(),
        caseinfo: caseDetails
      }
      

      /**
       * TODO : CHANGE TIS HIST
      */


      const response = await ApiCustomer.post('/api/bookings', data);
      const updateWorkLog = await ApiCustomer.post("/api/actionlog",{
        CaseId: `${CaseID}`,
        ReferenceId: `${data.WOID}`,
        model: "Work",
        dataOld: "OPEN_UNSCHEDULED",
        dataNew: "OPEN_SCHEDULED",
        changedBy: data.user.id,
        logDescription: `Edit : change status from OPEN_UNSCHEDULED to OPEN_SCHEDULED`
      })
      if (response.status === 201) {
        const { BookingId } = response.data;
        navigate(`/app/bookings/${BookingId}`);
      }
    } catch (error) {
      toast.error('Gagal membuat booking:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-blue-600 hover:text-blue-800 cursor-pointer dark:text-white dark:bg-gradient-to-b dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%">
          <PlusCircle className="mr-2" />
          Tambah Booking Baru
        </Button>
      </DialogTrigger>
      {/* <Label className="text-red-400">*</Label> */}
      <DialogContent className="dark:text-white dark:bg-gradient-to-l dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 dark:border-b-slate-600 ">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
          <DialogDescription>
            Booking baru akan dibuat dan Anda akan diarahkan ke halaman edit booking.
          </DialogDescription>
        </DialogHeader>
        <h1>Anda yakin ingin menambahkan booking baru?</h1>
        <DialogFooter>
          <Button onClick={handleCreateBooking} disabled={loading} className="dark:text-white dark:bg-gradient-to-b dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%">
            {loading ? 'Membuat...' : 'Ya, Tambah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
