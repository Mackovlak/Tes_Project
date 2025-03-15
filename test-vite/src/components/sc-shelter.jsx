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
import { ChevronDown } from 'lucide-react'
import { Checkbox } from "./ui/checkbox";
import { Input } from './ui/input';
import { BtnModal1 } from './sc-modal';
import { BtnModal2 } from './sc-modal';
 
export function ShelterBox() {
  return (
    <Card className="w-257 ml-5 h-30 mb-5 rounded-none">
      <CardHeader>
        <div className='flex gap-2'>
         <Checkbox id="terms" className="border-black border-3 w-5.5 h-5.5 "/>
            <label htmlFor="terms"
             className="text-xl underline font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">PT KAPAL API INDONESIA</label>
        </div>
      </CardHeader>
      <CardContent className="mt-1 bg-neutral-300">
        <div className='mt-1'>
        <p>Deskripsi Perusahaan</p>
        </div>
        <div>
        <ChevronDown className='float-right mb-2'></ChevronDown>
        </div>
      </CardContent>
    </Card>
  )
}

export function ShelterContact() {
    return (
      <Card className="w-257 ml-5 h-30 mb-6 rounded-none">
        <CardHeader>
          <div className='flex justify-between'>
              <label htmlFor="terms"
               className="text-xl mt-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contacts</label>
               <Input placeholder="Search...." className="w-70 h-8 mt-1 mr-110 border-black border-1 rounded-md"></Input>
               <BtnModal1></BtnModal1>
          </div>
        </CardHeader>
        <CardContent className=" bg-neutral-300">
            <div className='flex gap-22 mt-1'>
                <h1>First Name</h1>
                <h1>Last Name</h1>
                <h1>Email</h1>
                <h1>Phone</h1>
                <h1>Country</h1>
                <h1>Source</h1>
                <h1>HP ID</h1>
            </div>
            <div>
                <p>Meisa</p>
            </div>
        </CardContent>
      </Card>
    )
  }

  export function ShelterAsset() {
    return (
      <Card className="w-257 ml-5 h-30 rounded-none">
        <CardHeader>
          <div className='flex justify-between'>
              <label htmlFor="terms"
               className="text-xl mt-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Assets</label>
               <Input placeholder="Search...." className="w-70 h-8 mt-1 mr-120 border-black border-1 rounded-md"></Input>
               <BtnModal2></BtnModal2>
          </div>
        </CardHeader>
        <CardContent className=" bg-neutral-300">
            <div className='flex gap-22 mt-1'>
                <h1>Product Name</h1>
                <h1>Product</h1>
                <h1>Serial Number</h1>
                <h1>Product Line</h1>
                <h1>Source</h1>
            </div>
            <div>
                <p>Hp L300</p>
            </div>
        </CardContent>
      </Card>
    )
  }


