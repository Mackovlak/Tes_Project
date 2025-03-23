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
import { FileSymlinkIcon,  Lock,} from 'lucide-react'
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

export const ServiceBooking = () => {
  return (
    <Card className="mt-2 rounded-none h-[160px]">
      <CardHeader>
        <CardTitle className="text-xl ">New Bookable Resource Booking</CardTitle>
        <CardTitle className="text-sm">Bookable Resource Booking . Information</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs>
          <TabsList className="bg-white w-[300px]">
            <TabsTrigger value="book_info" className="cursor-pointer">Booking Information</TabsTrigger>
            <TabsTrigger value="field_service" className="cursor-pointer white">Field Service</TabsTrigger>
            <TabsTrigger value="timeline" className="cursor-pointer">Timeline</TabsTrigger>

          </TabsList>

        <TabsContent value="book_info" className="grid grid-cols-3">
          <Card className="flex-col mt-7 w-[500px]">
            <CardContent className="grid gap-5.5">
        
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Name</span>
              <span className='ml-50'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Resource</span>
              <span className='ml-44'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Account</span>
              <span className='ml-45.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Subk Technician Name</span>
              <span className='ml-30.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Subk Technician Learner ID</span>
              <span className='ml-22.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Booking Status</span>
              <span className='ml-33'>...</span>
            </div>

            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Work Order</span>
              <span className='ml-40'>...</span>
            </div>

          <Card className="rounded-md p-2"> 
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Requested Date Time (Customer)</span>
              <span className='ml-20'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>Guaranteed Fix Time (Customer)</span>
              <span className='ml-21'>...</span>
            </div>
          </Card>

            <div className='font-bold flex'>
              <span className='ml-7'>Do not Disturb</span>
              <span className='ml-30'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-7'>CE Schedule Change</span>
              <span className='ml-20'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="mt-7 w-[350px] ml-25">
          <span className='ml-5 font-bold text-xl'>Booking Dates in User Time</span>
            <CardContent className="grid gap-6 ">
        
            <div className='font-bold flex'>
              <span className='ml-3'>Start Time </span>
              <span className='ml-40'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-3'>End Time</span>
              <span className='ml-42'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-3'>Duration</span>
              <span className='ml-43'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-3'>Estimated Arrival Time</span>
              <span className='ml-17.5'>...</span>
            </div>

            <div className='font-bold flex'>
              <span className='ml-3'>Actual Arrival Time</span>
              <span className='ml-24'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="mt-7 w-[370px] ml-13  ">
          <span className='ml-5 font-bold text-xl'>Booking Dates in Customer Time Zone</span>
            <CardContent className="grid gap-6">
            <div className='font-bold flex'>
              <span >Start Time (Customer)</span>
              <span className='ml-20 mr-9'>...</span>
              <CalendarDays></CalendarDays>
            </div>

            <div className='font-bold flex'>
              <span>End Time (Customer)</span>
              <span className='ml-22 mr-9'>...</span>
              <CalendarDays></CalendarDays>
            </div>

            <div className='font-bold flex'>
              <span>Estimated Arrival Time (Customer)</span>
              <span className=' mr-6'>...</span>
              <CalendarDays></CalendarDays>
            </div>

            <div className='font-bold flex'>
              <span>Actual Arrival Time (Customer)</span>
              <span className='ml-10 mr-10'>...</span>
              <CalendarDays></CalendarDays>
            </div>
            </CardContent>
          </Card>

          
          <Card className="flex-col mt-5 w-[500px] h-25">
          <span className='ml-5 font-bold text-xl'>Timestamp</span>
            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-4">
            {/* <Table>
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
            </Table> */}

            </CardContent>
          </Card>

          <Card className="flex-col mt-5 w-[350px] ml-25">
          <span className='ml-5 font-bold text-xl'>SLA Jeopardy</span>
            <CardContent className="grid gap-4.5">
            <div className='font-bold flex'>
              <span>Schedule Jeopardy</span>
              <span className='ml-35'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>ScheduleJeopardyTim</span>
              <span className='ml-29'>...</span>
            </div>
            </CardContent>
          </Card>

          <Card className="flex-col mt-5 w-[370px] ml-13">
          <span className='ml-5 font-bold text-xl'>Total Duration</span>
            <CardContent className="grid gap-4.5 ">
            <div className='font-bold flex'>
              <span>Total Billable Duration</span>
              <span className='ml-37'>...</span>
            </div>

            <div className='font-bold flex'>
              <span>Total Duration in Progress</span>
              <span className='ml-30'>...</span>
            </div>

            <div className=' font-bold flex'>
              <span>Total Break Duration</span>
              <span className='ml-40'>...</span>
            </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field_service">
          <Card className="flex-col mt-7 w-[500px]">
            <CardContent className="grid gap-5.5">
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Field Service</span>
              <span className='ml-40'>...</span>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="flex-col mt-7 w-[500px]">
            <CardContent className="grid gap-5.5">
            <div className='font-bold flex'>
              <Lock className='size-5 mr-2'></Lock>
              <span>Timeline</span>
              <span className='ml-40'>...</span>
            </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
