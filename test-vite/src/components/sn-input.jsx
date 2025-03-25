import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const SnInput = () => {
  return (
    <Dialog>
    <DialogTrigger asChild>
      <Button variant="link" className="ml-30">Serial Number</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[700px] ">
      <DialogHeader className="flex flex-row justify-between">
        <span className='mt-1 font-bold'>Serial Number</span>
        <Button variant="link">Clear All</Button>
      </DialogHeader>
      <div className="grid gap-4 py-4 grid-flow-col grid-rows-4 ">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Serial No
          </Label>
          <Input id="name"  className="col-span-3"/>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Check P/N
          </Label>
          <Input id="username" className="col-span-3" type="search"/>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Product tower
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Product group
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Product type
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Product line
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
          <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Product no.
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Product name
          </Label>
          <Input id="username" className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}
