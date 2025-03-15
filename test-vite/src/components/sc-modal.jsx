import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { SelectBar } from "@/components/sc-select";
import { SelectBar1 } from "@/components/sc-select";
import { SelectBar2 } from "@/components/sc-select";
import { SelectBar3 } from "./sc-select";

export function BtnModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white mr-4">
          <Plus></Plus>Create Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>Case Information</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-3">
          <div className="w-55">
            <Label htmlFor="name" className="text-right">
              Case Subject
            </Label>
            <Input id="name" className="col-span-3 border-b-black p-1" />
          </div>
          <div className="">
            <Label htmlFor="name" className="text-right">
              Case Type
            </Label>
            <SelectBar3></SelectBar3>
          </div>
          <div className="flex items-center space-x-2 mt-5">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              KCI For this case?
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">DONE</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BtnModal1() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white mt-0.5">
          New Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] bg-white">
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle className="text-2xl">Contact Information</DialogTitle>
            <DialogTitle className="flex justify-end text-sm mt-2.5">
              Clear All
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogHeader>
          <DialogTitle>Basic Information</DialogTitle>
        </DialogHeader>

        <div className="flex">
          <div className="space-y-0.5">
            <Label htmlFor="current">Salutation</Label>
            <SelectBar1></SelectBar1>
            <Label htmlFor="current" className="mt-2">
              Preferend Language
            </Label>
            <SelectBar2></SelectBar2>
          </div>
          <div className="space-y-0.5 absolute ml-40 w-42.5">
            <Label htmlFor="current">First Name</Label>
            <Input id="current" type="email" className="border-b-black p-1" />
          </div>
          <div className="space-y-0.5 ml-5">
            <Label htmlFor="current">Last Name</Label>
            <Input
              id="current"
              type="email"
              className="border-b-black p-1 w-71"
            />
          </div>
          <div className="space-y-0.5 ml-5">
            <Label htmlFor="new">EXTN</Label>
            <Input id="new" type="text" className="border-b-black p-1 w-73" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle>Phone preferences</DialogTitle>
        </DialogHeader>

        <div className="flex">
          <div className="space-y-0.5">
            <Label htmlFor="current">Phone</Label>
            <Input
              id="current"
              type="email"
              className="border-b-black p-1 w-40"
            />
            <Label htmlFor="current" className="mt-2">
              Other
            </Label>
            <Input
              id="current"
              type="text"
              className="border-b-black p-1 w-40"
            />
          </div>
          <div className="space-y-0.5 ml-3">
            <Label htmlFor="current">Mobile</Label>
            <Input
              id="current"
              type="email"
              className="border-b-black p-1 w-40"
            />
            <Label htmlFor="current" className="mt-2">
              EXTN
            </Label>
            <Input
              id="current"
              type="text"
              className="border-b-black p-1 w-40"
            />
          </div>
          <div className="space-y-0.5 ml-5">
            <Label htmlFor="new">Work</Label>
            <Input id="new" type="text" className="border-b-black p-1 w-71" />
            <Label htmlFor="new" className="mt-2">
              FAX
            </Label>
            <Input id="new" type="text" className="border-b-black p-1" />
          </div>
          <div className="space-y-0.5 ml-5">
            <Label htmlFor="current">EXTN</Label>
            <Input
              id="current"
              type="text"
              className="border-b-black p-1 w-73"
            />
          </div>
          <div className="space-y-0.5"></div>
        </div>

        <DialogHeader>
          <DialogTitle>Address</DialogTitle>
        </DialogHeader>

        <div className="flex">
          <div className="space-y-0.5">
            <Label htmlFor="current">Addres Line 1</Label>
            <Input
              id="current"
              type="email"
              className="border-b-black p-1 w-83"
            />
              <Label htmlFor="current" className="mt-2">Country</Label>
              <SelectBar></SelectBar>
          </div>
          <div className="space-y-0.5 ml-5">
            <Label htmlFor="current">Addres Line 2</Label>
            <Input
              id="current"
              type="email"
              className="border-b-black p-1 w-71"
            />
             <Label htmlFor="new" className="mt-2">Zip/Postal Code</Label>
             <Input id="new" type="text" className="border-b-black p-1" />
          </div>
          <div className="space-y-0.5 ml-5">
            <Label htmlFor="new">City</Label>
            <Input id="new" type="text" className="border-b-black p-1 w-35" />
          </div>
          <div className="space-y-0.5 ml-3">
            <Label htmlFor="current">State/Province</Label>
            <Input
              id="current"
              type="text"
              className="border-b-black p-1 w-35"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BtnModal2() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white mt-0.5">
          New Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white"></DialogContent>
    </Dialog>
  );
}
