import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectBarRelated } from "../sc-select";
import { Car, Lock, Plus } from "lucide-react";
import { CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Swal from "sweetalert2";

import { TabsServiceWO } from "./tab";
import { TabsServiceMO } from "./tab";
import { TabsServiceMOLineItems } from "./tab";

import { KeyRound } from "lucide-react";

import { useParams } from "react-router";

import ApiCustomer from "@/api";

import { CaseField, QuickWOInput } from "../quick-wo-input";
import { NewBookableResourceBooking } from "../service-booking";
import { getUserFromToken } from "@/lib/utils/auth";

import { useNavigate } from "react-router";
import DatePicker from "../date-picker";

export const ServiceWork = () => {
  const user = getUserFromToken();
  const { woid } = useParams();

  const [workOrders, setWorkOrders] = useState([]);
  const fetchWorkOrders = async () => {
    try {
      const res = await ApiCustomer.get(`/api/work-order/${woid}`);
      setWorkOrders(res.data.data); // adjust based on API response shape
      console.log("Fetch Work Order: ", res);
    } catch (err) {
      console.error("Failed to fetch work orders:", err);
    }
  };

  const [materialOrders, setMaterialOrders] = useState([]);
  const fetchMaterialOrders = async () => {
    try {
      const res = await ApiCustomer.get(`/api/material-order?WOID=${woid}`);
      console.log("Material Order in WO Detail : ", res);
      setMaterialOrders(res.data.data);
    } catch (err) {
      console.error("Failed to fetch Material orders:", err);
    }
  };

  const [caseInformation, setCaseInformation] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      Swal.fire({
        title: "Please wait...",
        text: "Loading Work Order Details...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const resWO = await ApiCustomer.get(`/api/work-order/${woid}`);
        const workOrderData = resWO.data.data;
        setWorkOrders(workOrderData);

        const resMO = await ApiCustomer.get(`/api/material-order?WOID=${woid}`);
        setMaterialOrders(resMO.data.data);

        if (workOrderData?.CaseID) {
          const resCI = await ApiCustomer.get(
            `/api/case-information/${workOrderData.CaseID}`
          );
          setCaseInformation(resCI.data.data);

          const resBooking = await ApiCustomer.get(
            `/api/bookings?WOID=${woid}`
          );
          console.log("Res Booking : ", resBooking.data.data);
          setBookings(resBooking.data.data);
        }

        Swal.close();
      } catch (err) {
        console.error("Fetch error:", err);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while loading data!",
        });
      }
    };

    if (woid) fetchAllData();
  }, [woid]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  // const fetchBookings = async () => {
  //   try {
  //     const response = await ApiCustomer.get('/api/bookings')
  //     setBookings(response.data.data)
  //   } catch (error) {
  //     console.error("Fetch error:", err);
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Oops...',
  //         text: 'Something went wrong while loading data!',
  //       });
  //   }
  // }

  // useEffect(() => {
  // }, [workOrders])

  const [selected, setSelected] = useState("work_order");

  // const location = useLocation();
  // const { ownerUserData, dataFetchCustomerData } = location.state || {};

  const navigate = useNavigate();
  return (
    <>
      {workOrders.SystemStatus === "CLOSED_POSTED" && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-2">
          This work order is <strong>read-only</strong> because it is{" "}
          <strong>Closed</strong>.
        </div>
      )}
      <TabsServiceWO workOrders={workOrders} />
      <Card className="mt-2 rounded-none p-0 border-0">
        <Tabs defaultValue="Quick_WO_Input" className="">
          <CardHeader
            className={"flex flex-col gap-3 border-2 w-full p-2 sticky"}
          >
            <div className="flex justify-between">
              <CardTitle className="text-xl ">
                {woid}
                <span className="text-sm flex items-center">
                  Work Order .
                  <Select
                    onValueChange={setSelected}
                    defaultValue="work_order"
                    className="shadow-xl"
                  >
                    <SelectTrigger className="shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="work_order">work order</SelectItem>
                        <SelectItem value="??">??</SelectItem>
                        <SelectItem value="!!">!!</SelectItem>
                        <SelectItem value="**">**</SelectItem>
                        <SelectItem value="&&">&&</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </span>
              </CardTitle>
              <CardTitle className="flex">
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <h1 className="text-blue-500">
                    {/* {ownerUserData.Name} */}
                  </h1>
                  <p className="text-sm font-light ">Owner</p>
                </div>
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <h1 className="text-blue-500">---</h1>
                  <p className="text-sm font-light ">Queue</p>
                </div>
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <h1 className="text-blue-500">
                    {/* {dataFetchCustomerData.MainAccount?.Salutation} {dataFetchCustomerData.MainAccount?.FirstName} {dataFetchCustomerData.MainAccount?.LastName} */}
                  </h1>
                  <p className="text-sm font-light ">Contact</p>
                </div>
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <Select onValueChange={setSelected} defaultValue="first">
                    <SelectTrigger className="shadow-none border-none text-blue-500 p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <SelectGroup className="p-0">
                        <SelectItem value="first" className="p-0">
                          {/* {dataFetchCustomerData.SiteAccount?.Company} */}
                        </SelectItem>
                        <SelectItem value="??">??</SelectItem>
                        <SelectItem value="!!">!!</SelectItem>
                        <SelectItem value="**">**</SelectItem>
                        <SelectItem value="&&">&&</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-sm font-light ">Site Account</p>
                </div>
              </CardTitle>
            </div>
            <TabsList className="bg-white ">
              <TabsTrigger
                variant="underline"
                value="wo_summary"
                className="cursor-pointer"
              >
                WO Summary
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="wo_details"
                className="cursor-pointer white"
              >
                WO Details
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="wo_bookings"
                className="cursor-pointer"
              >
                WO Bookings
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="wo_Notes_Timeline"
                className="cursor-pointer"
              >
                WO Notes/Timeline
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="wo_Closure_Details"
                className="cursor-pointer"
              >
                WO Closure Details
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="Quick_WO_Input"
                className="cursor-pointer"
              >
                Quick WO Input
              </TabsTrigger>
              <SelectBarRelated></SelectBarRelated>
            </TabsList>
          </CardHeader>

          <TabsContent value="wo_summary">
            <div className="flex gap-4">
              <Card className="flex-1/3  rounded-md">
                <CardHeader>
                  <CardTitle className=" text-lg">General</CardTitle>
                  <hr />
                </CardHeader>
                <CardContent className="grid gap-5 grid-cols-4 items-center ">
                  <div className="p-4 ring-1 col-span-2 grid grid-cols-2 items-center">
                    <CaseField label="Incoming Channel" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                  </div>
                  <CaseField label="Patner Case Id">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Work Order Number" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Patner Status" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Work Order Type">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <div className="p-3 ring-1 col-span-2"></div>
                  <CaseField label="Priority" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Recommended Resource">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="System Status">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Shipment Country" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Sub-Status" icon={KeyRound}>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Shipment State" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Bookable Resource Booking" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField
                    label="Service Offer ID"
                    className={"col-start-1"}
                    icon
                  >
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField
                    label="Service Description"
                    className={"col-start-1"}
                    icon
                  >
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                </CardContent>
              </Card>

              <div className="flex-1 flex flex-col gap-4">
                <Card className="rounded-sm ">
                  <CardContent className="grid grid-cols-4 items-center">
                    <CaseField
                      label="Currently Worked By"
                      className={"col-span-3"}
                    >
                      {" "}
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                  </CardContent>
                </Card>

                <Card className="rounded-md ">
                  <CardHeader>
                    <CardTitle className=" text-lg">
                      Entitlement and Modifier
                    </CardTitle>
                    <hr />
                  </CardHeader>
                  <CardContent className="grid gap-5 grid-cols-2 items-center">
                    <CaseField label="Entitlement" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Offer" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="OTC Code" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Authorizing Employee" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Coverage Window Used" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Coverage Window Value" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Response Time Value" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Repair Time Value" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Case Priority Index" icon>
                      <Input
                        variant={"invisible"}
                        className=""
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="mt-5 flex-col">
              <CardHeader>
                <CardTitle className=" text-lg">
                  Service Delivery Address
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid ">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Service Delivery Address</span>
                  <span className="ml-39">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7 ">
              <CardHeader>
                <CardTitle className=" text-lg">
                  SLA in Customer Time Zone
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-5 auto-rows-auto grid-cols-6 place-content-between">
                <CaseField label="SLA Jeopardy" className={""} icon>
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
                <CaseField
                  label="Requested Date Time (Customer)"
                  className={""}
                >
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="SLA Reschedule" className={""} icon>
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
                <CaseField label="Due Date (Customer)" className={""} icon>
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField
                  label="Guaranteed Fix Time (Customer)"
                  className={""}
                  icon
                >
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="Active Schedule Date" className={""} icon>
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
                <CaseField label="Coverage Window" className={""}>
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
                <CaseField
                  label="Early Start Date Time (Customer)"
                  className={""}
                >
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField
                  label="SLA Error Description"
                  className={"row-span-2 items-start"}
                  childClass={"row-span-2"}
                  icon
                >
                  <textarea
                    className="border-0 ring-0 ring-gray-400 w-[100%] h-[100%] resize-none"
                  ></textarea>
                </CaseField>
                <CaseField label="Response" className={""}>
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
                <CaseField
                  label="Latest Start Date Time (Customer)"
                  className={""}
                >
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="OTC Code" className={""}>
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
                <CaseField
                  label="Case Priority Index"
                  className={"col-start-5"}
                  icon
                >
                  {" "}
                  <Input variant='invisible' placeholder='---'/>{" "}
                </CaseField>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <CardHeader>
                <CardTitle className=" text-lg">
                  {" "}
                  Part Order Information
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>EarliestDateAllPartsAvailable</span>
                  <span className="ml-30">...</span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Ready For Closure Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        No data available
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Low Inventory</span>
                  <span className="ml-57">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <CardHeader>
                <CardTitle className=" text-lg">
                  {" "}
                  Material Order Information
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Order Number</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead>Ready For Closure</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {materialOrders.length > 0 ? (
                      materialOrders.map((material) => (
                        <TableRow key={material.MOID}>
                          <TableCell className="font-medium">
                            <Link to={`/app/material-order/${material.MOID}`}>
                              {material.MOID} on {material.WOID}
                            </Link>
                          </TableCell>
                          <TableCell>{material.CaseID}</TableCell>
                          {/* <TableCell>{work.serviceaccount}</TableCell>
                        <TableCell>{work.substatus}</TableCell>
                        <TableCell>{work.systemstatus}</TableCell>
                        <TableCell>{work.priority}</TableCell>
                        <TableCell>{work.workorder}</TableCell>
                        <TableCell>{work.primaryincident}</TableCell>
                        <TableCell>{work.duedate}</TableCell>
                        <TableCell>{work.orion}</TableCell>
                        <TableCell>{work.owner}</TableCell>
                        <TableCell>{work.created}</TableCell> */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="font-medium">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <CardHeader>
                <CardTitle className=" text-lg"> Primary Incident</CardTitle>
                <hr />
              </CardHeader>

              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Primary Incident</span>
                  <span className="ml-50">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wo_details">
            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">WO Details</span>
              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Customer Account</span>
                  <span className="ml-30">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wo_bookings">
            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">WO Bookings</span>
              <CardContent className="grid gap-5">
                <div className="font-bold flex">
                  <span>Requested Date Time (Customer)</span>
                  <span className="ml-50 mr-10">...</span>
                  <DatePicker></DatePicker>
                </div>

                <div className="font-bold flex">
                  <span>Guaranteed Fix Time (Customer)</span>
                  <span className="ml-51 mr-10">...</span>
                  {/* <DatePicker></DatePicker> */}
                  <DatePicker></DatePicker>
                </div>

                <div className="font-bold flex">
                  <span>Due Date (Customer) </span>
                  <span className="ml-72.5 mr-10">...</span>
                  <DatePicker></DatePicker>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">Booking </span>
              <CardContent className="grid">
                {/* <Button variant="link" className="w-50 ml-250 "> */}
                {/* <Link 
                  to="/bookings"
                  state={{ WOID: workOrders.WOID }}
                >
                    + New Bookable Resource
                  </Link> */}
                <NewBookableResourceBooking
                  WOID={workOrders.WOID}
                  CreatedBy={user.id}
                />
                {/* </Button> */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Resource</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Reschedule</TableHead>
                      <TableHead>Reschedule Reason</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Estimated Arrival Time (ETA)</TableHead>
                      <TableHead>Actual Arrival Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {bookings.length > 0 ? (
                      bookings.map((booking, index) => (
                        <TableRow
                          key={booking.BookingId || index}
                          onClick={() =>
                            navigate(`/app/bookings/${booking.BookingId}`)
                          }
                        >
                          <TableCell>
                            {booking.bookingDetails?.[0].resource?.Name || "-"}
                          </TableCell>
                          <TableCell>
                            {booking.bookingDetails?.[0].resourceaccount
                              ?.Name || "-"}
                          </TableCell>
                          <TableCell>{booking.BookingStatus || "-"}</TableCell>
                          <TableCell>
                            {booking.CeScheduleChange ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            {booking.ScheduleJeopardy ? "Jeopardy" : "-"}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell>{formatDate(booking.CreatedAt)}</TableCell>
                          {/* <TableCell>{formatDate(booking.StartTimeCustomerTime)}</TableCell>
                        <TableCell>{formatDate(booking.EstimatedArrivalTimeCustomerTime)}</TableCell>
                        <TableCell>{formatDate(booking.ActualArrivalTimeCustomerTime)}</TableCell>
                        <TableCell>{formatDate(booking.EndTimeCustomerTime)}</TableCell>
                        <TableCell>{formatDate(booking.CreatedAt)}</TableCell> */}
                          <TableCell>
                            {booking.createdByUser?.Name || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">Actions</span>
              <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
                <div className="font-bold flex">
                  <span className="ml-7">Action Booking</span>
                  <span className="ml-49.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Action Booking Status</span>
                  <span className="ml-37">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Action Date</span>
                  <span className="ml-56.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Action Count</span>
                  <span className="ml-50">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Finished By</span>
                  <span className="ml-53.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Finished on Date</span>
                  <span className="ml-43.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span>Partner Contact</span>
                  <span className="ml-40">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wo_Notes_Timeline">
            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">
                WO Notes / Timeline
              </span>
              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span> WO Notes / Timeline</span>
                  <span className="ml-30">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wo_Closure_Details">
            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">Resolution Notes</span>
              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Resolution Notes/Diagnostics</span>
                  <span className="ml-30">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">Labor Types</span>
              <CardContent className="grid">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Service</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Outside of Bussiness Hours</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Line Order</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        No data available
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">
                Miscellaneous Charges
              </span>
              <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Product ID</span>
                  <span className="ml-50.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Product</span>
                  <span className="ml-55.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Quantity</span>
                  <span className="ml-54">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Total Amount</span>
                  <span className="ml-50">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Line Order</span>
                  <span className="ml-56">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">
                DOA Letter (If DOA Case)
              </span>
              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Product ID</span>
                  <span className="ml-50">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">
                Page Count Information
              </span>
              <CardContent className="grid gap-5 grid-flow-col grid-rows-3">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Meter Read Available</span>
                  <span className="ml-40">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Reason if Not Available</span>
                  <span className="ml-36.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Reason if Not Available</span>
                  <span className="ml-36">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">Follow-Up</span>
              <CardContent className="grid gap-4.5 grid-flow-col grid-rows-4">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Follow Up Required</span>
                  <span className="ml-43">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Follow Up Reason Code</span>
                  <span className="ml-36">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Follow Up Completed </span>
                  <span className="ml-39.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Follow Up Note</span>
                  <span className="ml-51">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">Closure Data</span>
              <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Finished By</span>
                  <span className="ml-62">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Finished on Date (Customer)</span>
                  <span className="ml-30">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Finished on Date </span>
                  <span className="ml-52">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Patner Contact</span>
                  <span className="ml-50">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Workorder Closed Date</span>
                  <span className="ml-34.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Customer Resolution Date</span>
                  <span className="ml-29.5">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">Closure Codes</span>
              <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Delay Codes</span>
                  <span className="ml-50">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Repair Class Codes</span>
                  <span className="ml-38">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Travel Zone </span>
                  <span className="ml-51">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Quick_WO_Input">
            <QuickWOInput WOID={woid} caseInformation={caseInformation} />
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
};

export const ServiceMaterial = () => {
    const { moid } = useParams();
  
    const [materialOrders, setMaterialOrders] = useState([]);
    const [materialLineOrders, setMaterialLineOrders] = useState([]);
  
    const fetchMaterialOrder = async () => {
      try{
        const res = await ApiCustomer.get(`/api/material-order/${moid}`)
        setMaterialOrders(res.data.data)
      }catch(err){
        console.error("Failed to fetch material orders:", err);
      }
    }
    const fetchMaterialLineOrdersInMODetail = async () => {
      try{
        const res = await ApiCustomer.get(`/api/material-order/material-order-line-items?MOID=${moid}`)
        setMaterialLineOrders(res.data.data)
      }catch(err){
        console.error("Failed to fetch material line orders:", err);
      }
    }
  
    useEffect(() => {
      // Menampilkan SweetAlert2 loading indicator sebelum memulai fetch
      Swal.fire({
        title: 'Memuat Data...',
        text: 'Mohon tunggu sebentar...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading(); // Menampilkan indikator loading
        }
      });
  
      // Menjalankan kedua fungsi fetching data secara bersamaan
      Promise.all([fetchMaterialOrder(), fetchMaterialLineOrdersInMODetail()])
        .then(() => {
          Swal.close(); // Menutup SweetAlert2 setelah data berhasil diambil
        })
        .catch((err) => {
          Swal.close(); // Menutup SweetAlert2 jika ada error
          setError("Error fetching data");
        });
    }, []); 
  
    return (
      <div>
        {materialOrders.OrderStatus === 'Closed' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-2">
            This material order is <strong>read-only</strong> because it is <strong>Closed</strong>.
          </div>
        )}
        <TabsServiceMO materialOrders={materialOrders}/>
      <Card className="mt-2 rounded-none h-[160px]">
        <CardHeader>
          <CardTitle className="text-xl ">{materialOrders.MOID} for {materialOrders.WOID}</CardTitle>
          <CardTitle className="text-sm">Material Order . Information</CardTitle>
        </CardHeader>
  
        <CardContent>
          <Tabs>
            <TabsList className="bg-white w-[760px]">
              <TabsTrigger variant={'underline'} value="mo_information" className="cursor-pointer">
                MO Information
              </TabsTrigger>
              <TabsTrigger variant={'underline'}
                value="mo_items"
                className="cursor-pointer white">
              MO Items & Message
              </TabsTrigger>
              <TabsTrigger variant={'underline'} value="entitlement_sla" className="cursor-pointer">
              Entitlement & SLA
              </TabsTrigger>
              <TabsTrigger variant={'underline'} value="billing_quotation" className="cursor-pointer">
              Billing & Quotation
              </TabsTrigger>
              <TabsTrigger variant={'underline'} value="notes_attaechment" className="cursor-pointer">
              Notes & Attachment
              </TabsTrigger>
              <SelectBarRelated></SelectBarRelated>
            </TabsList>
  
            <TabsContent value="mo_information">
              <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">Order Information</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-8 h-115">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Order Number</span>
                    <span className="ml-40">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Service Offer ID</span>
                    <span className="ml-37.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span >Service Description</span>
                    <span className="ml-31">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Order Type</span>
                    <span className="ml-46.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Shipping Priority</span>
                    <span className="ml-35.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>Ready For Closure Date</span>
                    <span className="ml-24">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Case ID</span>
                    <span className="ml-54">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Contact</span>
                    <span className="ml-53">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Delivery Requested Date (Customer Time)</span>
                    <span className="ml-10 mr-16">...</span>
                    <CalendarDays></CalendarDays>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>Collection Requested Date</span>
                    <span className="ml-39 mr-16">...</span>
                    <CalendarDays></CalendarDays>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Promo Code</span>
                    <span className="ml-65">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span >Customer Induced Damage</span>
                    <span className="ml-37.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span >Accidental Damage Protection</span>
                    <span className="ml-32">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Defective Media Retention
                    </span>
                    <span className="ml-39.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span >Notification Number</span>
                    <span className="ml-51">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Sales Order Number</span>
                    <span className="ml-52">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Resource Name</span>
                    <span className="ml-40">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                      <span>Work Order</span>
                      <span className="ml-47">...</span>
                    </div>
  
                    <div className="font-bold flex">
                      <span className="ml-7">Parent Mo</span>
                      <span className="ml-50">...</span>
                    </div>
  
                    <div className="font-bold flex">
                      <Lock className="size-5 mr-2"></Lock>
                      <span>BCP Order</span>
                      <span className="ml-50">...</span>
                    </div>
  
                    <div className="font-bold flex">
                    
                      <span className="ml-7">Material Order Type</span>
                      <span className="ml-32">...</span>
                    </div>
  
                    <div className="font-bold flex">
                      
                      <span className="ml-7">EOT Order Number</span>
                      <span className="ml-34">...</span>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="mo_items">
              <Card className="flex-col mt-7">
                <span className="ml-5 font-bold text-xl">
                   Material Order Line Items 
                </span>
                <CardContent className="grid">
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Mo Line Item</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>ATP</TableHead>
                        <TableHead>Part No</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Promise</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Ship</TableHead>
                        <TableHead>Storage</TableHead>
                        <TableHead>Offered</TableHead>
                      </TableRow>
                    </TableHeader>
  
                    <TableBody>
                      {materialLineOrders.map((lineitem) => (
                        <TableRow key={lineitem.LineItemID}>
                          <TableCell className="font-medium">
                            <Link to={`/mo_detail/${lineitem.LineItemID}`}>
                            {lineitem.MOID} - {lineitem.LineItemID}
                            </Link>
                            </TableCell>
                          {/* <TableCell>{lineitem.CaseID}</TableCell> */}
  
                        </TableRow>
                      ))}
                      {/* <TableRow>
                        <TableCell className="font-medium">
                         <Link to="/mo_detail">MO-8292819129-1</Link>
                        </TableCell>
                        <TableCell className="font-medium">
                          Shipped
                        </TableCell>
                        <TableCell className="font-medium">
                          available
                        </TableCell>
                      </TableRow> */}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
  
              <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">Failure Code</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-2 h-25">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Category 1</span>
                    <span className="ml-40">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Failure code 1</span>
                    <span className="ml-35">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Category 2</span>
                    <span className="ml-42">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Failure code 2</span>
                    <span className="ml-37">...</span>
                  </div>
                </CardContent>
              </Card>
  
              <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">Security Check</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-2 h-10">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Security Check</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>
  
              <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">S4 Messages</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-2 h-10">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>S4 Messages</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="entitlement_sla">
              <Card className="mt-5 flex-col">
                <span className="ml-5 font-bold text-xl">Entitlement & SLA</span>
                <CardContent className="grid gap-5">
                  <div className="font-bold flex">
                    <span>Entitlement & SLA</span>
                    <span className="ml-60">...</span>
                  </div>
                </CardContent>
              </Card>
  
              <Card className="mt-5 flex-col">
                <span className="ml-5 font-bold text-xl">Booking</span>
                <CardContent className="grid">
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Order Number</TableHead>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Order Type</TableHead>
                        <TableHead>Ready For Closure</TableHead>
                      </TableRow>
                    </TableHeader>
  
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          No data available
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
  
              <Card className="mt-5 flex-col">
                <span className="ml-5 font-bold text-xl">Actions</span>
                <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
                  <div className="font-bold flex">
                    <span className="ml-7">Action Booking</span>
                    <span className="ml-49.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Action Booking Status</span>
                    <span className="ml-37">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Action Date</span>
                    <span className="ml-56.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Action Count</span>
                    <span className="ml-50">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Finished By</span>
                    <span className="ml-53.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Finished on Date</span>
                    <span className="ml-43.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span>Partner Contact</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="billing_quotation">
            <Card className="flex-col mt-7">
                <span className="ml-5 font-bold text-xl">
                Billing & Quotation
                </span>
                <CardContent className="grid">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span> Billing & Quotation</span>
                    <span className="ml-30">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="notes_attaechment">
            <Card className="flex-col mt-7">
                <span className="ml-5 font-bold text-xl">
                Notes & Attachment
                </span>
                <CardContent className="grid">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Notes & Attachment</span>
                    <span className="ml-30">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    );
};

export const ServiceMoDetail = () => {
    const { molineid } = useParams(); // Mendapatkan 'molineid' dari URL
    const [moLineItems, setMoLineItems] = useState([]); // State untuk menyimpan data material order line items
  
    const fetchMoLineItems = async () => {
      try {
        // Menampilkan indikator loading menggunakan SweetAlert2
        Swal.fire({
          title: 'Memuat Data...',
          text: 'Mohon tunggu sebentar...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading(); // Menampilkan indikator loading
          },
        });
  
        // Fetch data dari API
        const res = await ApiCustomer.get(`/api/material-order/material-order-line-items/${molineid}`);
        setMoLineItems(res.data.data); // Menyimpan data ke state
  
        // Menutup indikator loading setelah data berhasil diambil
        Swal.close();
      } catch (err) {
        // Menutup indikator loading dan menangani error
        Swal.close();
        console.error('Failed to fetch Material Line Items orders:', err);
      }
    };
  
    useEffect(() => {
      fetchMoLineItems(); // Memanggil fungsi fetch saat komponen pertama kali dirender
    }, [molineid]); 
    return (
      <>
      {moLineItems.Status === 'Closed' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-2">
            This material order line item is <strong>read-only</strong> because it is <strong>Closed</strong>.
          </div>
        )}
        <TabsServiceMOLineItems MOLineDetails={moLineItems}/>
      <Card className="mt-2 rounded-none h-[160px]">
        <CardHeader>
          <CardTitle className="text-xl ">{moLineItems.MOID} - {moLineItems.LineItemID}</CardTitle>
          <CardTitle className="text-sm">Material Order Line Item . Information</CardTitle>
        </CardHeader>
  
        <CardContent>
          <Tabs>
            <TabsList className="bg-white w-[440px] gap-2">
              <TabsTrigger value="mo_details" className="cursor-pointer">
              MO Details
              </TabsTrigger>
              <TabsTrigger
                value="mo_failure"
                className="cursor-pointer white">
               Failure & Return Details
              </TabsTrigger>
              <TabsTrigger value="mo_attachments" className="cursor-pointer">
              Attachments
              </TabsTrigger>
              <SelectBarRelated></SelectBarRelated>
            </TabsList>
  
            <TabsContent value="mo_details">
              <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">MO Order Details</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-8 ">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>MO Order Name</span>
                    <span className="ml-31">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>MO Order Name</span>
                    <span className="ml-30.5">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span >Line Number</span>
                    <span className="ml-37">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Part/Product Number</span>
                    <span className="ml-20">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Description</span>
                    <span className="ml-39">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>RoHS</span>
                    <span className="ml-50">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Returnability Flag</span>
                    <span className="ml-27">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Functional Equivalence</span>
                    <span className="ml-18">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>Media Handling Part</span>
                    <span className="ml-30 ">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Pick Pack Instructions</span>
                    <span className="ml-28">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span  className="ml-7">Collection Instructions</span>
                    <span className="ml-27">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span  className="ml-7">Customer Response</span>
                    <span className="ml-33">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Rejected Reason</span>
                    <span className="ml-39">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7" >Other Reason</span>
                    <span className="ml-44">...</span>
                  </div>
  
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>Part Authorization Reason</span>
                    <span className="ml-20">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span >Part Authorization Detail</span>
                    <span className="ml-23">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Functional Equivalent</span>
                    <span className="ml-30">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>Original Part Number</span>
                    <span className="ml-30">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                      <span>Offered Part Number</span>
                      <span className="ml-31">...</span>
                    </div>
  
                    <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                      <span >Offered Part Description</span>
                      <span className="ml-25">...</span>
                    </div>
  
                    <div className="font-bold flex">
                      <Lock className="size-5 mr-2"></Lock>
                      <span>Main Component</span>
                      <span className="ml-38.5">...</span>
                    </div>
  
                    <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                      <span >Gratis Flag</span>
                      <span className="ml-51.5">...</span>
                    </div>
  
                    <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                      <span>ATP Status</span>
                      <span className="ml-51.5">...</span>
                    </div>
                </CardContent>
              </Card>
  
              <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">Outbound to Customer</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-2 h-10">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Outbound to Customer</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="mo_failure">
            <Card className=" mt-7 rounded-md">
                <span className="ml-5 font-bold text-xl">Failure & Usage Details
                </span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-5 h-70">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Failure Analysis
                    </span>
                    <span className="ml-40">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Failure Code</span>
                    <span className="ml-46">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Additional Failure Code</span>
                    <span className="ml-25">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Serial Number </span>
                    <span className="ml-42">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Part Usage Code
                    </span>
                    <span className="ml-38">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Part Consumption
                    </span>
                    <span className="ml-51">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Part Order Consumption Comment
                    </span>
                    <span className="ml-20">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Removed Part Number
                    </span>
                    <span className="ml-43">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Removed Serial Number
                    </span>
                    <span className="ml-41">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Removed Part Desc
                    </span>
                    <span className="ml-50">...</span>
                  </div>
                </CardContent>
              </Card>
  
              <Card className=" mt-7 rounded-md"> 
                <span className="ml-5 font-bold text-xl">Part Return Details</span>
                <CardContent className="grid gap-5 grid-flow-col grid-rows-5 h-80">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Returnable Code</span>
                    <span className="ml-40">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Return Type Code Identifier</span>
                    <span className="ml-20">...</span>
                  </div>
  
                  <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                    <span>Return_Instructions</span>
                    <span className="ml-35">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Return Tracking Number</span>
                    <span className="ml-25">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">Return Override Flag</span>
                    <span className="ml-32">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Return Ovveride Reason</span>
                    <span className="ml-30">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <span className="ml-7">RMA</span>
                    <span className="ml-66">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>RMA Identifier</span>
                    <span className="ml-48">...</span>
                  </div>
  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Return Deadline</span>
                    <span className="ml-45.5">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="mo_attachments">
              <Card className="mt-5 flex-col">
                <CardContent className="grid gap-5">
                  <span className="font-bold text-xl">Timeline</span>
                  <div className="font-bold flex">
                    <Input placeholder="Search Timeline" className="text-sm font-medium"></Input>
                  </div>
                  <span className="font-bold text-xl">Create a note</span>
                  <div className="">
                      <Input type="text" className="border-1" placeholder="Tittle" ></Input>
                      <textarea placeholder="Note" className="border-1 mt-2 w-full h-20 pl-3 pt-2 resize-none"></textarea>
                      <Button variant="outline" className="mr-3">Add note</Button>
                      <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
  
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      </>
    );
};
  