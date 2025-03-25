import React from 'react'
import { Button } from './ui/button'
import { ArrowLeftFromLine } from 'lucide-react'
import { SquareArrowOutUpRight } from 'lucide-react'
import { Save } from 'lucide-react'
import { FileSymlink } from 'lucide-react'
import { RotateCw } from 'lucide-react'
import { StepBack, UserPen } from 'lucide-react'

export const ServiceTab = () => {
  return (
    <div className='border-1 flex items-center'>
      <Button variant="link" className="rounded-none">
         <ArrowLeftFromLine></ArrowLeftFromLine>
      </Button>

      <Button variant="link" className="rounded-none">
        <SquareArrowOutUpRight></SquareArrowOutUpRight>
      </Button>

      <Button variant="link" className="rounded-none gap-1">
         <Save></Save>
         <span>Save</span>
      </Button>

      <Button variant="link" className="rounded-none gap-1">
         <FileSymlink></FileSymlink>
         <span>Save & Close</span>
      </Button>

      <Button variant="link" className="rounded-none gap-1">
        <RotateCw></RotateCw>
         <span>Refresh</span>
      </Button>    

       <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Complaint</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>CSR</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Service Order</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Work Order</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Sales Offer</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Close Case</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Pick</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Queue Details</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <UserPen></UserPen>
         <span>Assign</span>
      </Button>    

      <Button variant="link" className="rounded-none gap-1">
        <StepBack></StepBack>
         <span>Add to Queue</span>
      </Button>    
    </div>
  )
}

export const ServiceTabMo = () => {
    return (
      <div className='border-1 flex items-center'>
        <Button variant="link" className="rounded-none">
           <ArrowLeftFromLine></ArrowLeftFromLine>
        </Button>
  
        <Button variant="link" className="rounded-none">
          <SquareArrowOutUpRight></SquareArrowOutUpRight>
        </Button>
  
        <Button variant="link" className="rounded-none gap-1">
           <Save></Save>
           <span>Save</span>
        </Button>
  
        <Button variant="link" className="rounded-none gap-1">
           <FileSymlink></FileSymlink>
           <span>Save & Close</span>
        </Button>
  
        <Button variant="link" className="rounded-none gap-1">
          <RotateCw></RotateCw>
           <span>Refresh</span>
        </Button>    
  
         <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Complaint</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>CSR</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Service Order</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Work Order</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Sales Offer</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Close Case</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Pick</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Queue Details</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <UserPen></UserPen>
           <span>Assign</span>
        </Button>    
  
        <Button variant="link" className="rounded-none gap-1">
          <StepBack></StepBack>
           <span>Add to Queue</span>
        </Button>    
      </div>
    )
  }
  


