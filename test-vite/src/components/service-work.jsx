import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
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
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectBarRelated } from "./sc-select";
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
import { KeyRound } from "lucide-react";


export const ServiceWork = () => {
  return (
    <Card className="mt-2 rounded-none h-[160px]">
      <CardHeader>
        <CardTitle className="text-xl ">WO-027816939</CardTitle>
        <CardTitle className="text-sm">Work Order . Work Order</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs>
          <TabsList className="bg-white w-[760px]">
            <TabsTrigger value="wo_summary" className="cursor-pointer">
              WO Summary
            </TabsTrigger>
            <TabsTrigger
              value="wo_details"
              className="cursor-pointer white"
            >
              WO Details
            </TabsTrigger>
            <TabsTrigger value="wo_bookings" className="cursor-pointer">
              WO Bookings
            </TabsTrigger>
            <TabsTrigger value="wo_Notes_Timeline" className="cursor-pointer">
              WO Notes/Timeline
            </TabsTrigger>
            <TabsTrigger value="wo_Closure_Details" className="cursor-pointer">
              WO Closure Details
            </TabsTrigger>
            <TabsTrigger value="Quick_WO_Input" className="cursor-pointer">
              Quick WO Input
            </TabsTrigger>
            <SelectBarRelated></SelectBarRelated>
          </TabsList>

          <TabsContent value="wo_summary">
           <div className="flex gap-4">
            <Card className="w-[850px] mt-7 rounded-md">
              <span className="ml-5 font-bold text-xl">General</span>
              <CardContent className="grid gap-5 grid-flow-col grid-rows-9 h-115">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Incoming Channel</span>
                  <span className="ml-40">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Work Order Number</span>
                  <span className="ml-35.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Work Order Type</span>
                  <span className="ml-42">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Priority</span>
                  <span className="ml-60">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">System Status</span>
                  <span className="ml-48">...</span>
                </div>

                <div className="font-bold flex">
                  <KeyRound className="size-5 mr-2"></KeyRound>
                  <span>Sub-Status</span>
                  <span className="ml-54">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Bookable Resource Booking</span>
                  <span className="ml-22">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Service Offer ID</span>
                  <span className="ml-45">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Service Description</span>
                  <span className="ml-39">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Patner Case Id</span>
                  <span className="ml-50">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Patner Status</span>
                  <span className="ml-52">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Preferred Day</span>
                  <span className="ml-51">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Preferred Time</span>
                  <span className="ml-49">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Black Badged/Special Access</span>
                  <span className="ml-23">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Recommended Resource</span>
                  <span className="ml-31">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Shipment Country</span>
                  <span className="ml-42.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Shipment State</span>
                  <span className="ml-48">...</span>
                </div>
              </CardContent>
            </Card>

            <div>
              <Card className="mt-7.5 rounded-sm h-19 w-96">
                <CardContent className="grid">
                  <div className="font-bold flex">
                    <span>Currently Worked By</span>
                    <span className="ml-18">...</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-3 rounded-md w-96">
                <span className="ml-5 font-bold text-xl">
                Entitlement and Modifier
                </span>
                <CardContent className="grid gap-5 grid-rows-3">
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Entitlement</span>
                    <span className="ml-40">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Offer</span>
                    <span className="ml-52">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>OTC Code</span>
                    <span className="ml-43.5">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Authorizing Employee</span>
                    <span className="ml-20">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Coverage Window Used</span>
                    <span className="ml-17">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Coverage Window Value</span>
                    <span className="ml-16">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Response Time Value</span>
                    <span className="ml-22.5">...</span>
                  </div>

                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Repair Time Value</span>
                    <span className="ml-28.5">...</span>
                  </div>
                  
                  <div className="font-bold flex">
                    <Lock className="size-5 mr-2"></Lock>
                    <span>Case Priority Index</span>
                    <span className="ml-27">...</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            </div>

            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">
                Service Delivery Address
              </span>
              <CardContent className="grid ">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Service Delivery Address</span>
                  <span className="ml-39">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">
                SLA in Customer Time Zone
              </span>
              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>SLA in Customer Time Zone</span>
                  <span className="ml-33">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">
                Part Order Information
              </span>
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
              <span className="ml-5 font-bold text-xl">
              Material Order Information
              </span>
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
              <span className="ml-5 font-bold text-xl">
              Primary Incident
              </span>
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
              <span className="ml-5 font-bold text-xl">
                WO Details
              </span>
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
                  <CalendarDays></CalendarDays>
                </div>

                <div className="font-bold flex">
                  <span>Guaranteed Fix Time (Customer)</span>
                  <span className="ml-51 mr-10">...</span>
                  <CalendarDays></CalendarDays>
                </div>

                <div className="font-bold flex">
                  <span>Due Date (Customer) </span>
                  <span className="ml-72.5 mr-10">...</span>
                  <CalendarDays></CalendarDays>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <span className="ml-5 font-bold text-xl">Booking</span>
              <CardContent className="grid">
                <Button variant="link" className="w-50 ml-250 ">
                  <Link to="/bookings">
                    + New Bookable Resource
                  </Link>
                </Button>
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
              <span className="ml-5 font-bold text-xl">
              Resolution Notes
              </span>
              <CardContent className="grid">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Resolution Notes/Diagnostics</span>
                  <span className="ml-30">...</span>
                </div>
              </CardContent>
            </Card>

          <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">
              Labor Types
              </span>
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
              <span className="ml-5 font-bold text-xl">
              Follow-Up
              </span>
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
              <span className="ml-5 font-bold text-xl">
              Closure Data
              </span>
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
              <span className="ml-5 font-bold text-xl">
              Closure Codes
              </span>
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
          <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">General</span>
              <CardContent className="grid gap-5 grid-flow-col grid-rows-4">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Incoming Channel</span>
                  <span className="ml-40">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Work Order Number</span>
                  <span className="ml-35.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Work Order Type</span>
                  <span className="ml-42">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>System Status</span>
                  <span className="ml-48.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Sub Status</span>
                  <span className="ml-55">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Partner Status</span>
                  <span className="ml-48.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Work Order Description</span>
                  <span className="ml-30.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Work Order Instruction</span>
                  <span className="ml-32">...</span>
                </div>
              </CardContent>
            </Card>

          <Card className="flex-col mt-7">
              <span className="ml-5 font-bold text-xl">Service Delivery Address</span>
              <CardContent className="grid gap-5 grid-flow-col grid-rows-9">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Choose Address</span>
                  <span className="ml-45">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Company Name</span>
                  <span className="ml-45">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Contact First Name</span>
                  <span className="ml-39">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Contact Last Name</span>
                  <span className="ml-40">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Phone Number</span>
                  <span className="ml-47">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Email Address</span>
                  <span className="ml-49">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Address Line1</span>
                  <span className="ml-49">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Address Line2</span>
                  <span className="ml-49">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Address Line3</span>
                  <span className="ml-49">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>City</span>
                  <span className="ml-70">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>State Or Province</span>
                  <span className="ml-44.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Country/Region</span>
                  <span className="ml-47">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Postal Code</span>
                  <span className="ml-55">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Timezone</span>
                  <span className="ml-59">...</span>
                </div>
      
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Service Territory</span>
                  <span className="ml-46.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Bussiness Segment</span>
                  <span className="ml-42">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Longitude</span>
                  <span className="ml-58.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Latitude</span>
                  <span className="ml-62">...</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7 ">
              <span className="ml-5 font-bold text-xl">SLA in Customer Time Zone</span>
              <CardContent className="grid gap-5 grid-flow-col grid-rows-7">
                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>SLA Jeopardy</span>
                  <span className="ml-66">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Due Date (Customer)</span>
                  <span className="ml-52">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Coverage Window</span>
                  <span className="ml-57">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Response</span>
                  <span className="ml-74">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">OTC Code</span>
                  <span className="ml-73.5">...</span>
                </div>

                <div className="font-bold flex">
                  <span className="ml-7">Requested Date Time (Customer)</span>
                  <span className="ml-30">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Guaranteed Fix Time (Customer)</span>
                  <span className="ml-31">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Early Start Date Time (Customer)</span>
                  <span className="ml-32">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Latest Start Date Time (Customer)</span>
                  <span className="ml-30">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>SLA Reschedule</span>
                  <span className="ml-64.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Active Schedule Date</span>
                  <span className="ml-54.5">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>SLA Error Description</span>
                  <span className="ml-54">...</span>
                </div>

                <div className="font-bold flex">
                  <Lock className="size-5 mr-2"></Lock>
                  <span>Case Priority Index</span>
                  <span className="ml-59">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
