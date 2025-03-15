import React from 'react'
import { SheetBar } from './components/app-sheetbar'
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { Input } from './components/ui/input'
import {
  Search,
  Sheet
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { BrowserRouter, Routes, Route, Link } from 'react-router'
import Lorem from './Lorem'

import {Outlet} from "react-router"
const App = () => {
  
  return (
    <div>
      <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="border-2 rounded-b-xl flex h-14 items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <Link to="/lorem">
                    <BreadcrumbLink >
                     Login
                    </BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Home Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
            <div className="flex  p-2 items-center gap-2">
              <Search></Search>
              <Input placeholder="Search" className="w-110 mr-45 border-b-black border border-b-2" ></Input>
            </div>
            <SheetBar></SheetBar>
        </header>
        {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div> */}
        <Outlet/>
      </SidebarInset>
    </SidebarProvider>
    </div>
  )
}

export default App
