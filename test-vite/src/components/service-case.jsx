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
import { Lock } from 'lucide-react'
import { CalendarDays } from 'lucide-react'

export const ServiceCase = ({ caseDetails }) => {
  return (
    <Card className="mt-2 rounded-b-md">
      <CardHeader>
        <CardTitle className="text-xl">{caseDetails.CaseID}</CardTitle>
        <CardTitle className="text-sm">Case . Case</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="case_info"> 
          <TabsList className="bg-white">
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

        <TabsContent value="case_info" >
          <Card className="flex-row">

            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-8 ">
            <CardHeader className="flex-row">
              <Lock className='size-4'></Lock>
              <CardTitle   className='h-5 mr-38'>Case ID</CardTitle>
              <CardTitle>{caseDetails.CaseID}</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <Lock className='size-4'></Lock>
              <CardTitle   className='h-5 mr-18.5'>Incoming Channel</CardTitle>
              <CardTitle>{caseDetails.IncomingChannel}</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <CardTitle   className='h-5 ml-5 mr-31.5'>Case Status</CardTitle>
              <CardTitle>{caseDetails.CaseStatus}</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <CardTitle   className='h-5 ml-5 mr-29.5'>Case Priority</CardTitle>
              <CardTitle>{caseDetails.CasePriority}</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <CardTitle   className='h-5 ml-5 mr-19'>Customer Severity</CardTitle>
              <CardTitle>{caseDetails.CustomerSeverity}</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <Lock className='size-4'></Lock>
              <CardTitle   className='h-5 mr-30'>Created ON</CardTitle>
              <CardTitle>{caseDetails.CreatedOn}</CardTitle>
              <CalendarDays className='size-4 ml-5 mr-5'></CalendarDays>
              <CardTitle>...</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <Lock className='size-4'></Lock>
              <CardTitle   className='h-5 mr-20'>Case Closed Date</CardTitle>
              <CardTitle>...</CardTitle>
              <CalendarDays className='size-4 ml-5 mr-5'></CalendarDays>
              <CardTitle>...</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <Lock className='size-4'></Lock>
              <CardTitle   className='h-5 mr-17.5'>Submitted To Base</CardTitle>
              <CardTitle>...</CardTitle>
              <CalendarDays className='size-4 ml-5 mr-5'></CalendarDays>
              <CardTitle>...</CardTitle>
            </CardHeader>

            </CardContent>

            <CardContent className="grid gap-4.5 grid-flow-col grid-rows-5">

            <CardHeader className="flex-row">
              <CardTitle   className='h-5 mr-38'>Case Subject</CardTitle>
              <CardTitle>{caseDetails.CaseSubject}</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
              <CardTitle   className='h-5 mr-28.5'>Business Segment</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
              <CardTitle   className='h-5 mr-43'>Case Type</CardTitle>
              <CardTitle>{caseDetails.CaseType}</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
              <CardTitle   className='h-5 mr-37.5'>HPI Segment</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
              <CardTitle  className='whitespace-break-spaces break-words h-5'>Update Customer Tracking Number</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            <CardHeader className="flex-row">
              <CardTitle   className='h-5 ml-5 mr-38'>Email Status</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
              <CardTitle   className='h-5 ml-5 mr-36'>KCI For Case?</CardTitle>
              <CardTitle>{caseDetails.KCI_Flag ? 'Yes' : 'No'}</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
            <Lock className='size-4'></Lock>
              <CardTitle   className='h-5'>Customer Tracking Number</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
              <CardTitle   className='h-5 ml-5'>Alternate Customer Tracking Number</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            
            <CardHeader className="flex-row">
            <Lock className='size-4'></Lock>
              <CardTitle   className='h-5 mr-41'>Irrelevant</CardTitle>
              <CardTitle>...</CardTitle>
            </CardHeader>

            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent  value="customer,add,entitement">
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="ci_notes" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_activitas" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="ci_actions" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_wo" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_orders" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_salles" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_knowledge" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>


        <TabsContent value="ci_related" >
          <Card>
            <CardHeader>Hello Word</CardHeader>
          </Card>
        </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
