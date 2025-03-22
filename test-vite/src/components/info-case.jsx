"use client"

import { Maximize2,
  ChevronRight
 } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function InfoCase({
  items,
  items2
}) {
  return (
    <SidebarGroup > 
      <SidebarGroupLabel className="text-xl">Information</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
            <SidebarMenuItem
            key={item.title}
            className="group/collapsible">
                <SidebarMenuButton tooltip={item.title}>
                    {}
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <Maximize2
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    {}
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
        {items2.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
