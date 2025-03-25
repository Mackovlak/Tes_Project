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
import { ArrowDownNarrowWideIcon, Car, Lock, Plus, RotateCw, Search } from "lucide-react";
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

export const ServiceMoDetail = () => {
  return (
    <Card className="mt-2 rounded-none h-[160px]">
      <CardHeader>
        <CardTitle className="text-xl ">MO-8292819129 - 1</CardTitle>
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
  );
};
