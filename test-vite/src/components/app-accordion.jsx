import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

import { Button } from './ui/button'

export function AppAccordion() {
  return (
    <div className=" w-full flex flex-col">
      <Button>Account Info</Button>
      <Button>Asset Info</Button>
      <Button>Contact Info</Button>
      <Accordion type="single" collapsible className="w-full ">
          <AccordionItem value="item-1">
          <AccordionTrigger>Account Info</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Contact Info</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other
            components&apos; aesthetic.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Asset Info</AccordionTrigger>
          <AccordionContent>
            Yes. It's animated by default, but you can disable it if you prefer.
          </AccordionContent>
        </AccordionItem>
        </Accordion>
    </div>
  )
}
