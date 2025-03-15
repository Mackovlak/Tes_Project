import React from 'react'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
   
  export function SelectBar() {
    return (
      <Select>
        <SelectTrigger className="w-[330px] border-black">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="Indonesia">Indonesia</SelectItem>
            <SelectItem value="Malaysia">Malaysia</SelectItem>
            <SelectItem value="Singapura">Singapura</SelectItem>
            <SelectItem value="Inggris">Inggris</SelectItem>
            <SelectItem value="Cina">Cina</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  export function SelectBar1() {
    return (
      <Select>
        <SelectTrigger className="w-[150px] border-black">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="Mr. ">Mr. </SelectItem>
            <SelectItem value="Mrs. ">Mrs. </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  export function SelectBar2() {
    return (
      <Select>
        <SelectTrigger className="w-[330px]  border-black">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
            <SelectItem value="Bahasa Indonesia">Bahasa Indonesia</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  export function SelectBar3() {
    return (
      <Select>
        <SelectTrigger className="w-[200px] border-b-black">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="Depot Repair">Depot Repair</SelectItem>
            <SelectItem value="Item2">Item 2</SelectItem>
            <SelectItem value="Item3">Item 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
