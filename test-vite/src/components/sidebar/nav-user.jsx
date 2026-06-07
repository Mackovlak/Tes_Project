"use client"

import { useNavigate } from "react-router"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import Swal from "sweetalert2"
import { useSheet } from "@/context/sheet-context"

export function NavUser({
  user
}) {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/app/profiles");
  };

  const { isMobile } = useSidebar()

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const logout = () => {
    localStorage.removeItem('token');
  
    Swal.fire({
      title: "Success",
      text: "User has been logged out",
      icon: "success",
      allowOutsideClick: false,
      timer: 1500, 
      showConfirmButton: false
    }).then(() => {
      window.location.href = '/lorem'; 
    });
  };
  
  const { setSheetOpen } = useSheet();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-white dark:bg-gray-700 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={`${API_BASE}${user.avatar}` || "/default-avatar.png"} alt={user.name} />
                <AvatarFallback className="bg-cyan-700 rounded-lg text-white font-semibold">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={`${API_BASE}${user.avatar}` || "/default-avatar.png"} alt={user.name} />
                  <AvatarFallback className="bg-cyan-700 rounded-lg text-white font-semibold">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem onClick={goToProfile}  className="cursor-pointer"> */}
              {/*   <BadgeCheck /> */}
              {/*   Account */}
              {/* </DropdownMenuItem> */}
              {/* <DropdownMenuItem> */}
              {/*   <CreditCard /> */}
              {/*   Billing */}
              {/* </DropdownMenuItem> */}
              <DropdownMenuItem>
                <Bell />
                HomePage
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className={"cursor-pointer bg-red-300 dark:bg-gray-700 "}>
            <span  className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </span>

            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
