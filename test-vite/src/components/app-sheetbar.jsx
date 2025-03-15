import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BadgeAlert } from 'lucide-react'
import { Building2 } from 'lucide-react'
import { Contact } from 'lucide-react'
import { PcCase } from 'lucide-react'
import { Boxes } from 'lucide-react'
import { AppAccordion } from './app-accordion'
 
export function SheetBar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="bg-white"><BadgeAlert className='size-5'></BadgeAlert></Button>
      </SheetTrigger>
      <SheetContent className="bg-white w-70">
        <SheetHeader>
          <SheetTitle className="flex justify-center text-2xl mt-5">INFORMATION</SheetTitle>
        </SheetHeader>
        <div className=''>
        <AppAccordion></AppAccordion>
        </div>
        {/* <div>
          <Button variant="secondary" className="p-10 ml-10 w-20 bg-white border-2 drop-shadow-md"><Building2 className='size-10'></Building2></Button>
          <Button variant="secondary" className="p-10 ml-10 w-20 bg-white border-2 drop-shadow-md"><Contact className='size-10'></Contact></Button>
          <Button variant="secondary" className="mt-10 p-10 ml-10 w-20 bg-white border-2 drop-shadow-md"><Boxes className='size-10'></Boxes></Button>
          <Button variant="secondary" className="p-10 ml-10 w-20 bg-white border-2 drop-shadow-md"><PcCase className='size-10'></PcCase></Button>
        </div> */}
        {/* <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div> */}
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  )
}