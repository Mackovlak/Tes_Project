import React from "react";
import { Button } from "@/components/ui/button";
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
import { Car, Lock } from "lucide-react";
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
import { Link } from "react-router";



export const ServiceMaterial = () => {
  return (
    <Card className="mt-2 rounded-none h-[160px]">
      <CardHeader>
        <CardTitle className="text-xl ">MO-8292819129 for WO-027816939</CardTitle>
        <CardTitle className="text-sm">Material Order . Information</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs>
          <TabsList className="bg-white w-[760px]">
            <TabsTrigger value="mo_information" className="cursor-pointer">
              MO Information
            </TabsTrigger>
            <TabsTrigger
              value="mo_items"
              className="cursor-pointer white">
            MO Items & Message
            </TabsTrigger>
            <TabsTrigger value="entitlement_sla" className="cursor-pointer">
            Entitlement & SLA
            </TabsTrigger>
            <TabsTrigger value="billing_quotation" className="cursor-pointer">
            Billing & Quotation
            </TabsTrigger>
            <TabsTrigger value="notes_attaechment" className="cursor-pointer">
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
                    <TableRow>
                      <TableCell className="font-medium">
                       <Link to="/mo_detail">MO-8292819129-1</Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        Shipped
                      </TableCell>
                      <TableCell className="font-medium">
                        available
                      </TableCell>
                    </TableRow>
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
  );
};
