import React from "react"
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Inbox, Calendar, Search, Settings, User2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import DatePicker from "../date-picker"
import { STATUS_ENUM_TO_LABEL, STATUS_LABELS } from "@/hooks/useCaseStatus"

export function SearchBar({ filters, setFilters, className, caseData, filterClose, dataTime, onFilterChange}) {
    const items = [
        { title: "SerialNumber", label: "Serial Number" },
        { title: "Company", label: "Company" },
        { title: "Email", label: "Email" },
        { title: "Phone", label: "Phone" },
        { title: "Id", label: "Case ID" },
    ];
    const timeRanges = [
        { key: "within4", label: "1–3" },
        { key: "within8", label: "4–7" },
        { key: "within15", label: "8–15" },
        { key: "over15", label: ">15" },
    ];

    const handleChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };
  const handleReset = () => {
    const empty = {
      SerialNumber: "", Company: "", Email: "", Phone: "", Id: "",
      Status: "", Type: "", Role: "",
      RangeTime: { from: undefined, to: undefined },
      TimeLength: "",
    };
    if (onFilterChange) {
      Object.entries(empty).forEach(([k, v]) => onFilterChange(k, v));
    } else {
      setFilters(empty);
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    if (k === "RangeTime") return v?.from || v?.to;
    return !!v;
  });
    return (
        <Sidebar side="right" variant="sidebar" className={cn("z-10 top-15 h-full", className)}>
            <Tabs defaultValue="search" className="w-full h-full dark:bg-gradient-to-t   dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-13% dark:from-4% ">
                <SidebarHeader className="bg-cyan-700 h-14 dark:bg-slate-800">
                    <TabsList className={'w-full h-full p-1 rounded-none bg-white/10 '}>
                        <TabsTrigger variant={'cleanPill'} value="search" className="w-full justify-center dark:data-[state=active]:bg-gray-500" id='case-search'>Search </TabsTrigger>
                        <TabsTrigger variant={'cleanPill'} value="Time" className="w-full justify-center dark:data-[state=active]:bg-gray-500" id='case-time'>Time </TabsTrigger>
                    </TabsList>
                </SidebarHeader>
                <TabsContent value="search" className={'max-h-[calc(100vh-8rem)] overflow-y-auto'}>
                    <SidebarContent >
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className="flex flex-col gap-3 p-3">
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title} className="flex flex-col gap-3">
                                            <Label className="dark:text-gray-300 font-semibold flex items-center gap-2 text-gray-500 text-md" htmlFor={item.title}>
                                                {item.label}
                                            </Label>
                                            <Input
                                                id={item.title}
                                                value={filters[item.title] || ""}
                                                onChange={(e) => handleChange(item.title, e.target.value)}
                                                placeholder={`Search ${item.label}`}
                                                className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                                            />
                                        </SidebarMenuItem>
                                    ))}

                                    {/* Dropdown filters */}
                                    <SidebarMenuItem className="flex flex-col gap-3">
                                        <Label className="text-gray-500 dark:text-gray-300">Case Status</Label>
                                        <select
                                            value={filters.Status}
                                            onChange={(e) => handleChange("Status", e.target.value)}
                                            className="p-2 rounded-md dark:border-gray-400 dark:border-b-2 dark:rounded-none  dark:text-gray-400"
                                        >
                                            <option value="">All</option>
                                            {STATUS_LABELS.map((status) => (
                                                <option key={status} value={status}>
                                                    {STATUS_ENUM_TO_LABEL[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem className="flex flex-col gap-3">
                                        <Label className="text-gray-500 dark:text-gray-300">Case Type</Label>
                                        <select
                                            value={filters.Type}
                                            onChange={(e) => handleChange("Type", e.target.value)}
                                            className="p-2 rounded-md dark:border-gray-400 dark:border-b-2 dark:rounded-none dark:text-gray-400"
                                        >
                                            <option value="">All</option>
                                            <option value="Bench">Bench</option>
                                            <option value="Onsite">Onsite</option>
                                        </select>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem className="flex flex-col gap-3">
                                        <Label className="text-gray-500 dark:text-gray-300">Case Holder</Label>
                                        <select
                                            value={filters.Role}
                                            onChange={(e) => handleChange("Role", e.target.value)}
                                            className="p-2 rounded-md dark:border-gray-400 dark:border-b-2 dark:rounded-none dark:text-gray-400"
                                        >
                                            <option value="">All</option>
                                            <option value="Owner">Case Owner</option>
                                            <option value="CreatedBy">Case Created</option>
                                        </select>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem className="flex flex-col gap-3">
                                        <Label className="text-gray-500 dark:text-gray-300">Range Time</Label>
                                        <DatePicker 
                                            value={filters.RangeTime}
                                            onChange={(val) => handleChange("RangeTime",val)}
                                            variant="Date"
                                            mode="range"
                                        />
                                    </SidebarMenuItem>
                                </SidebarMenu>
      {hasActiveFilters && (
                    <SidebarMenuItem>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
                        Reset all filters
                      </Button>
                    </SidebarMenuItem>
                  )}
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </TabsContent>

                <TabsContent value="Time" className={"max-h-[calc(100vh-8rem)] overflow-y-auto"}>
                    <SidebarContent className="p-2">
                        {dataTime?.map((e, idx) => ( 
                            <SidebarGroup key={e.status} hidden={e.hide}>
                                <SidebarGroupContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className={'col-span-5'}>
                                                <TableHead className={'text-center font-semibold text-black dark:text-gray-300 text-[15px] ring-4 ring-teal-500 dark:ring-gray-400'} colSpan={5}>
                                                    {STATUS_ENUM_TO_LABEL[e.status]}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className={'border-y-2'}>
                                                <TableHead className={''}> 1-3 </TableHead>
                                                <TableHead className={''}> 4-7  </TableHead>
                                                <TableHead className={''}> 8-15  </TableHead>
                                                <TableHead className={''}> &gt; 15  </TableHead>
                                            </TableRow>
                                            <TableRow>
                                                {["within4","within8","within15","over15"].map((key) => (
                                                    <TableCell
                                                        key={key}
                                                        className={cn(
                                                             "text-center cursor-pointer hover:bg-teal-100 dark:hover:bg-gray-700 ",
                                                             filters.Status === e.status && filters.TimeLength === key && "dark:bg-gray-600 bg-teal-300"
                                                        )}
                                                        onClick={() => {
                                                            const sameClick = filters.Status === e.status && filters.TimeLength === key;
                                                            if (sameClick) {
                                                                handleChange("Status", "");
                                                                handleChange("TimeLength", "");
                                                            }else {
                                                             handleChange("Status", e.status);
                                                             handleChange("TimeLength", key);
                                                            }
                                                        }}
                                                    >
                                                        {dataTime[idx]?.data?.[key]?.length || 0}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </SidebarGroupContent>
                            </SidebarGroup>
                            
                        ))}
                        <SidebarGroup hidden={!filterClose}>
                            <SidebarGroupContent className={'italic text-center text-gray-500 dark:text-gray-400'}>
                                == Closed Case Data Hidden ==
                            </SidebarGroupContent>
                        </SidebarGroup>

                    </SidebarContent>
                </TabsContent>
            </Tabs>

            <SidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}

