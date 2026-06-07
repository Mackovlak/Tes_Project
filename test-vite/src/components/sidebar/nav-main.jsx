  "use client"

  import { ChevronRight } from "lucide-react";
  
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
import { Link } from "react-router";

  export function NavMain({
    items,
  }) {
  
    return (
      <SidebarGroup>
        {/* <SidebarGroupLabel className={'font-bold text-gray-100'}>Master Table</SidebarGroupLabel> */}
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild >
                  <SidebarMenuButton tooltip={item.title} className="dark:bg-transparent dark:hover:bg-slate-500">
                    {item.icon && <item.icon />}
                    <span className="font-medium text-[1rem]">{item.title}</span>
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild disabled={subItem.disabled} className={'text-gray-200 text-[1rem] hover:text-black dark:hover:bg-slate-500 dark:text-white '}>
                          <Link to={subItem.url}>
                          {subItem.icon && <subItem.icon />}
                            <span className="">{subItem.title}</span>
                          </Link>
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
