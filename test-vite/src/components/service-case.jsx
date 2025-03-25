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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { 
  ArrowLeftFromLine,
  SquareArrowOutUpRight,
  Save,
  FileSymlink,
  RotateCw,
  StepBack,
  CalendarDays,
  Lock,
  UserPen
 } from 'lucide-react'


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


export const TabsService = () => {
  return (
    <div className='border-1 flex items-center'>
      <Button variant="outline" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
         <ArrowLeftFromLine></ArrowLeftFromLine>
      </Button>

      <Button variant="outline" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <SquareArrowOutUpRight></SquareArrowOutUpRight>
      </Button>

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
         <Save></Save>
         <span className='text-md'>Save</span>
      </Button>

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
         <FileSymlink></FileSymlink>
         <span className='text-md'>Save & Close</span>
      </Button>

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <RotateCw></RotateCw>
         <span className='text-md'>Refresh</span>
      </Button>    

       <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Complaint</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>CSR</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Service Order</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Work Order</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Sales Offer</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Close Case</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Pick</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Queue Details</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <UserPen></UserPen>
         <span className='text-md'>Assign</span>
      </Button>    

      <Button variant="link" className="rounded-none px-0 py-0 has-[>svg]:px-1.5 flex gap-0.5">
        <StepBack></StepBack>
         <span className='text-md'>Add to Queue</span>
      </Button>    
    </div>
  )
}


export const ServiceCase = ({ caseDetails }) => {
  return (
    <Card className="mt-2 rounded-none p-0 border-0">
      <CardHeader className="p-0">
        <Tabs defaultValue="case_info"> 
          <CardContent className="flex flex-col gap-3 border-2 w-full p-4">
            <CardTitle className="text-xl block">
              {caseDetails.CaseID}
              <p className="text-sm ">Case . Case</p>
            </CardTitle>
           
            <TabsList className="bg-white">
              <TabsTrigger variant="underline" value="case_info" className=" ">Case Information</TabsTrigger>
              <TabsTrigger variant="underline" value="customer,add,entitement" className="">Customer, Asset & Entitement</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_notes" className="">Notes & Information</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_activitas" className="">Activities</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_actions" className="">Costumer Interactions</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_wo" className="">Work Order Validation</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_orders" className="">Orders</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_salles" className="">Sales Offer</TabsTrigger>
              <TabsTrigger variant="underline" value="ci_knowledge" className="">Knowledge & Attachments</TabsTrigger>
              <SelectBarRelated></SelectBarRelated>
            </TabsList>
          </CardContent>
      
        <TabsContent value="case_info" >
          <Card className="flex-row">
            <CardContent className="grid gap-10  grid-cols-6 p-3 ">
              
                <CardTitle className='flex font-medium'><Lock className='size-4'/>Case ID</CardTitle>
                <CardTitle className="">{caseDetails.CaseID}</CardTitle>
              

              
                <CardTitle  className="font-medium" >Case Subject</CardTitle>
                <CardTitle className="col-span-3">{caseDetails.CaseSubject}</CardTitle>
              

              
                <CardTitle   className='flex font-medium'><Lock className='size-4'/>Incoming Channel</CardTitle>
                <CardTitle>{caseDetails.IncomingChannel}</CardTitle>
              

             
                <CardTitle className='font-medium'>Business Segment</CardTitle>
                <CardTitle >...</CardTitle>
              
              
              
                <CardTitle className='ml-4 font-medium'>Email Status</CardTitle>
                <CardTitle>...</CardTitle>
              

              
                <CardTitle className='ml-4 font-medium'>Case Status</CardTitle>
                <CardTitle>{caseDetails.CaseStatus}</CardTitle>
              

              
                <CardTitle   className='font-medium'>Case Type</CardTitle>
                <CardTitle>{caseDetails.CaseType}</CardTitle>
              

              
                <CardTitle   className='ml-4 font-medium '>KCI For Case?</CardTitle>
                <CardTitle>{caseDetails.KCI_Flag ? 'Yes' : 'No'}</CardTitle>
              

              
                <CardTitle   className='ml-4 font-medium'>Case Priority</CardTitle>
                <CardTitle>{caseDetails.CasePriority}</CardTitle>
              

              
                <CardTitle className='font-medium '>HPI Segment</CardTitle>
                <CardTitle>...</CardTitle>
              

              
                <CardTitle className='flex font-medium '><Lock className='size-4'/>Customer Tracking Number</CardTitle>
                <CardTitle className="">...</CardTitle>
              

              
                <CardTitle   className='ml-4 font-medium'>Customer Severity</CardTitle>
                <CardTitle className="">{caseDetails.CustomerSeverity}</CardTitle>
              

              
                <CardTitle className="font-medium">Update Customer Tracking Number</CardTitle>
                <CardTitle className='col-span-3'>...</CardTitle>
              

              
                
                <CardTitle   className='flex font-medium'><Lock className='size-4'/>Created ON</CardTitle>
                <CardTitle className="col-span-3 flex gap-[5em]">{caseDetails.CreatedOn}<CalendarDays className='size-4 '/>...</CardTitle>
                
                
              

             
                <CardTitle   className='ml-4 font-medium '>Alternate Customer Tracking Number</CardTitle>
                <CardTitle>...</CardTitle>
              

              
                
                <CardTitle   className='flex font-medium'><Lock className='size-4'/>Case Closed Date</CardTitle>
                <CardTitle className="flex col-span-3 gap-[5em]">...<CalendarDays className='size-4 '/>...</CardTitle>
              

              
                <CardTitle   className='flex font-medium'><Lock className='size-4'/>Irrelevant</CardTitle>
                <CardTitle>...</CardTitle>
              

                        

              
                
                <CardTitle   className='flex font-medium'><Lock className='size-4'/>Submitted To Base</CardTitle>
                <CardTitle className="flex col-span-3 gap-[5em]">...<CalendarDays className='size-4 '/>...</CardTitle>
              

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
      </CardHeader>
    </Card>
  )
}
