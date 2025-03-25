import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from 'react-router'
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
import { SelectBarRelated } from './sc-select'
import { FileSymlinkIcon, Lock, UserPen } from 'lucide-react'
import { CalendarDays } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeftFromLine } from 'lucide-react'
import { SquareArrowOutUpRight } from 'lucide-react'
import { Save } from 'lucide-react'
import { FileSymlink } from 'lucide-react'
import { RotateCw } from 'lucide-react'
import { StepBack } from 'lucide-react'


const workorder = [
  {
    workordernumber: "WO-027816939",
    caseid: "54165182991",
    serviceaccount: "Icon Plus",
    substatus: "Waiting",
    systemstatus: "Open",
    priority: "WO Priority",
    workorder: "In-Country",
    primaryincident: "Depot Repair",
    duedate: "21/03/2025 00.53",
    orion: "-",
    owner : "Jokowi",
    created: "Widodo",
  },
]

const partsorder = [
  {
    name: "Budiono",
    orderstatus: "-",
    workorder: "-",
    customerselfrepair: "-",
    owner: "Budiono",
    createdon: "W-",
    ordercloseddate: "-",
    createdby: "-",
  },
]

export const ServiceCase = () => {
  return (
    <Card className="mt-2 rounded-none h-[160px]">
      <CardHeader>
        <CardTitle className="text-xl ">5ABC98S1L</CardTitle>
        <CardTitle className="text-sm">Case . Case</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs>
          <TabsList className="bg-white w-[1250px]">
            <TabsTrigger value="case_info" className="cursor-pointer">Case Information</TabsTrigger>
            <TabsTrigger value="customer,add,entitement" className="cursor-pointer white">Customer, Asset & Entitement</TabsTrigger>
            <TabsTrigger value="ci_notes" className="cursor-pointer">Notes & Information</TabsTrigger>
            <TabsTrigger value="ci_activitas" className="cursor-pointer">Activities</TabsTrigger>
            <TabsTrigger value="ci_actions" className="cursor-pointer">Costumer Interactions</TabsTrigger>
            <TabsTrigger value="ci_wo" className="cursor-pointer">Work Order Validation</TabsTrigger>
            <TabsTrigger value="ci_orders" className="cursor-pointer">Orders</TabsTrigger>
            <TabsTrigger value="ci_salles" className="cursor-pointer">Sales Offer</TabsTrigger>
            <TabsTrigger value="ci_knowledge" className="cursor-pointer">Knowledge & Attachments</TabsTrigger>
            <SelectBarRelated></SelectBarRelated>
          </TabsList>

        <TabsContent value="case_info">
          <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Uknown</span>
            <CardContent className="grid gap-5.5 grid-flow-col grid-rows-6">
        
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Case ID</span>
              <span className='ml-40'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Incoming Channel</span>
              <span className='ml-20'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Case Status</span>
              <span className='ml-33'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Case Priority</span>
              <span className='ml-30.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Customer Severity</span>
              <span className='ml-20'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Created ON</span>
              <span className='ml-32.5'>...</span>
              <CalendarDays className='h-5 ml-11  '></CalendarDays>
              <span className='ml-9'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Case Closed Date</span>
              <span className='ml-23'>...</span>
              <CalendarDays className='h-5 ml-14'></CalendarDays>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Submitted To Base</span>
              <span className='ml-20'>...</span>
              <CalendarDays className='h-5 ml-14'></CalendarDays>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Case Subject</span>
              <span className='ml-31.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Business Segment</span>
              <span className='ml-21.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Case Type</span>
              <span className='ml-36.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>HPI Segment</span>
              <span className='ml-30.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Updated Customer Tracking Number</span>
              <span className='ml-28'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Email Status</span>
              <span className='ml-74'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>KCI For Case?</span>
              <span className='ml-72'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Customer Tracking Number</span>
              <span className='ml-45'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Alternate Customer Tracking Number</span>
              <span className='ml-26.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Irrelevant</span>
              <span className='ml-79'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="mt-5 flex-col">
          <span className='ml-5 font-bold text-xl'>Global Trade Check</span>
            <CardContent className="grid gap-6 grid-flow-col grid-rows-3">
        
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Global Trade Status</span>
              <span className='ml-18'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Embargoed Country</span>
              <span className='ml-16.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>GT Override Reason</span>
              <span className='ml-17.5'>...</span>
            </div>

            <div className='ml-12 font-bold flex'>
              <span>GT Details</span>
              <span className='ml-36'>...</span>
            </div>

            <div className='ml-12 font-bold flex'>
              <span>Screening ID</span>
              <span className='ml-31'>...</span>
            </div>

            <div className='ml-5 font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>GT Active Listening</span>
              <span className='ml-19'>...</span>
            </div>

            <div className='mr-15 font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>GT AL Comments</span>
              <span className='ml-25'>...</span>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent  value="customer,add,entitement">
         <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Customer Information</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-6">
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Customer Account</span>
              <span className='ml-30'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Is Partner</span>
              <span className='ml-47'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>HIPAA</span>
              <span className='ml-53'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>PIN</span>
              <span className='ml-58.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Customer Time Zone</span>
              <span className='ml-26.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Primary Contact</span>
              <span className='ml-35'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Primary Email</span>
              <span className='ml-35'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Phone</span>
              <span className='ml-49.5'>...</span>
            </div>
  
            <div className='font-bold flex'>
              <span className='ml-7'>Secondary Contact</span>
              <span className='ml-26'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Country</span>
              <span className='ml-46'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Submitted By</span>
              <span className='ml-36'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Partner & Customer</span>
              <span className='ml-24'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Region</span>
              <span className='ml-58'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Parent Company</span>
              <span className='ml-40'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Parent Company Non-Latin</span>
              <span className='ml-20'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Account Tier</span>
              <span className='ml-47.5'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="flex-col mt-5">
          <span className='ml-5 font-bold text-xl'>Asset Information</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-4">
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Asset</span>
              <span className='ml-56'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Serial Number</span>
              <span className='ml-39'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Product Name</span>
              <span className='ml-39'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Device Properties</span>
              <span className='ml-33'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className=' size-5 mr-2'></Lock>
              <span>Product Number</span>
              <span className='ml-30'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>HW Profit Center</span>
              <span className='ml-29'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>HWPC Code</span>
              <span className='ml-38.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>Asset Location</span>
              <span className='ml-34'>...</span>
            </div>
  
            <div className='font-bold flex'>
              <span className='ml-8'>SNIC - Count</span>
              <span className='ml-44'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>MV Product Description </span>
              <span className='ml-24'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="flex-col mt-5">
          <span className='ml-5 font-bold text-xl'>SLA Information</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Latest Start Date (Cust Time)</span>
              <span className='ml-35'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Guaranteed Fix Date(Cust Time)</span>
              <span className='ml-29'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Case Priority Index</span>
              <span className='ml-53.5'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Coverage Window Used</span>
              <span className='ml-30'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className=' size-5 mr-2'></Lock>
              <span>Coverage Window Value</span>
              <span className='ml-29'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>Case Priority Rule</span>
              <span className='ml-41.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>Response Time Value</span>
              <span className='ml-35'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>Repair Time Value</span>
              <span className='ml-41'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="flex-col mt-5">
          <span className='ml-5 font-bold text-xl'>Entitlement Information</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
            <div className='ml-7 font-bold flex'>
              <span>Case Entitlement</span>
              <span className='ml-48'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Entitlement Status</span>
              <span className='ml-45'>...</span>
            </div>

            <div className='ml-7 font-bold flex'>
              <span>Selected Entitlement Offer </span>
              <span className='ml-30'>...</span>
            </div>

            <div className='ml-2 font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Start Date</span>
              <span className='ml-38'>...</span>
              <CalendarDays className='w-5 ml-5'></CalendarDays>
            </div>

            <div className='ml-2 font-bold flex'>
            <Lock className=' size-5 mr-2'></Lock>
              <span>End Date</span>
              <span className='ml-40'>...</span>
              <CalendarDays className='w-5 ml-5' ></CalendarDays>
            </div>

            <div className='ml-2 font-bold flex'>
              <Lock className=' size-5 mr-2'></Lock>
              <span>Days Left</span>
              <span className='ml-40'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>OTC Code</span>
              <span className='ml-51'>...</span>
            </div>

            <div className='ml-7 font-bold flex'>
              <span>Entitlement Override</span>
              <span className='ml-30'>...</span>
            </div>

            <div className='ml-7 font-bold flex'>
              <span>Authorizing Employee</span>
              <span className='ml-28'>...</span>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ci_notes" >
        <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Customer Issue Description & System Information</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-4">
            
            <div className='ml-7'>
              <textarea className='border-2 border-black w-[370px] resize-none'></textarea>
            </div>

            <div className='ml-7 font-bold flex'>
              <span>Related Device</span>
              <span className='ml-47.5'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Device Manufacturer</span>
              <span className='ml-36'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Device Model</span>
              <span className='ml-50'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Program/Category</span>
              <span className='ml-38.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Operating System</span>
              <span className='ml-40.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Version</span>
              <span className='ml-60'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Remote Diag Code</span>
              <span className='ml-39.5'>...</span>
            </div>
  
            <div className='font-bold flex'>
              <span>Application Information</span>
              <span className='ml-35'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Provider / Platform</span>
              <span className='ml-44'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Software Version</span>
              <span className='ml-49'>...</span>
            </div>
            </CardContent>
          </Card>

        <Card className="mt-5 flex-col">
          <span className='ml-5 font-bold text-xl'>Case Notes</span>
            <CardContent className="grid grid-col grid-rows-5 gap-6">

            <div className='font-bold flex jus'>
              <span>Log Type</span>
              <span className='ml-72'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Action Type</span>
              <span className='ml-67'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Template </span>
              <span className='ml-72'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Visible Externally</span>
              <span className='ml-57'>...</span>
            </div>

            <div className='font-bold flex '>
              <span>Number of Minutes Spent</span>
              <span className='ml-40.5'>...</span>
            </div>

            <div className='flex'>
              <span className='font-bold'>Notes</span>
              <textarea className='ml-79 w-80 h-40 resize-none p-2 border-2 border-black '></textarea>
            </div>

            <div className='absolute ml-180'>
            <textarea className='w-120 h-100 resize-none p-2 border-2 border-black'></textarea>

            </div>

            </CardContent>
          </Card>

        <Card className="mt-5 flex-col">
          <span className='ml-5 font-bold text-xl'>Symptom Codes</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-4">

            <div className='font-bold flex'>
              <span>Keyword Search</span>
              <Input type="search" className="w-100 ml-27 border-2 border-black"></Input>
            </div>

            <div className='font-bold flex'>
              <span>Top Category</span>
              <span className='ml-32'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Sub Category</span>
              <span className='ml-32'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Spesific Symptom</span>
              <span className='ml-24'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='mr-60'>Quality Codes</span>
              <span className=''>Add Existing QA Code</span>
            </div>
            </CardContent>
          </Card>

          <Card className="mt-5 flex-col">
          <span className='ml-5 font-bold text-xl'>Case Resolution</span>
          <CardContent className="grid gap-5 grid-flow-col grid-rows-3">

            <div className='font-bold flex'>
              <span className='ml-7'>Case Resolution Code</span>
              <span className='ml-32'>...</span>
            </div>
            
            <div className='font-bold flex'>
              <span className='ml-7'>Auto Close</span>
              <span className='ml-52'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Case Ready for Closure</span>
              <span className='ml-29.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Ready for Close Days</span>
              <span className='ml-32'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Ready for Closure Date</span>
              <span className='ml-28.5'>...</span>
            </div>

            <div className='font-bold flex'>
            <Lock className='size-5 mr-2'></Lock>
              <span>Pending Customer Action</span>
              <span className='ml-24'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Customer Requested Close Date</span>
              <span className='ml-30'>...</span>
            </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="ci_activitas" >
          <Card className="mt-7">
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="ci_actions" >
          <Card className="mt-7">
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_wo" >
          <Card className="mt-7">
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_orders" >
        <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Shipment Information</span>
            <CardContent className="grid gap-5 grid-flow-col grid-rows-3">
        
            <div className='font-bold flex'>
              <span className='ml-7'>Shipment Country</span>
              <span className='ml-40'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Shipment State</span>
              <span className='ml-45.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Major Account Id</span>
              <span className='ml-41.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Exception Order</span>
              <span className='ml-40'>...</span>
            </div>

            <div className='font-bold flex'>
              <span >SBD Ovveride</span>
              <span className='ml-44.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Currency</span>
              <span className='ml-53.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Promo Code</span>
              <span className='ml-40'>...</span>
            </div>
            </CardContent>
          </Card>

        <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Work Order</span>
            <CardContent className="grid gap-5">
        
            <div className='font-bold flex'>
              <span>Incident Type</span>
              <span className='ml-50'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Work Order Description</span>
              <span className='ml-30.5'>...</span>
            </div>

              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Work Order Number</TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Service Account</TableHead>
                  <TableHead >Sub-Status</TableHead>
                  <TableHead>System Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Primary Incident</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Orion</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workorder.map((work) => (
                  <TableRow key={work.workordernumber}>
                    <TableCell className="font-medium">
                      <Link to="/Work">
                      {work.workordernumber}
                      </Link>
                      </TableCell>
                    <TableCell>{work.caseid}</TableCell>
                    <TableCell>{work.serviceaccount}</TableCell>
                    <TableCell>{work.substatus}</TableCell>
                    <TableCell>{work.systemstatus}</TableCell>
                    <TableCell>{work.priority}</TableCell>
                    <TableCell>{work.workorder}</TableCell>
                    <TableCell>{work.primaryincident}</TableCell>
                    <TableCell>{work.duedate}</TableCell>
                    <TableCell>{work.orion}</TableCell>
                    <TableCell>{work.owner}</TableCell>
                    <TableCell>{work.created}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>

        <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Parts Order </span>
            <CardContent className="grid gap-5">
  
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Customer Self Repair (CSR)</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Order Closed Date</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partsorder.map((parts) => (
                  <TableRow key={parts.name}>
                    <TableCell className="font-medium">{parts.name}</TableCell>
                    <TableCell>{parts.orderstatus}</TableCell>
                    <TableCell>{parts.workorder}</TableCell>
                    <TableCell>{parts.customerselfrepair}</TableCell>
                    <TableCell>{parts.owner}</TableCell>
                    <TableCell>{parts.createdon}</TableCell>
                    <TableCell>{parts.ordercloseddate}</TableCell>
                    <TableCell>{parts.createdby}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>

        <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Service Order </span>
            <CardContent className="grid gap-5">
  
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Order Refere</TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Service Status</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Submit</TableHead>
                  <TableHead>Date and Time</TableHead>
                  <TableHead>EMEA</TableHead>
                  <TableHead>Custom Owner</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created On</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">No data available</TableCell>
                  </TableRow>
              </TableBody>
            </Table>
            </CardContent>
          </Card>

        <Card className="flex-col mt-7">
          <span className='ml-5 font-bold text-xl'>Material Order </span>
            <CardContent className="grid gap-5">
  
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
                      <Link to="/material_order">
                       MO-8292819129 for WO-027816939
                      </Link>
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
            </CardContent>
          </Card>

        </TabsContent>


        <TabsContent value="ci_salles" >
          <Card className="mt-7">
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_knowledge" >
          <Card className="mt-7">
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_related" >
          <Card className="mt-7">
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
