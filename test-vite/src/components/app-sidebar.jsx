import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Eye,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Pin,
  Search,
  ServerCogIcon,
  ServerIcon,
  Settings2,
  SquareTerminal,
  Table,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavRecent } from "@/components/nav-projects"
import { NavPinned } from "@/components/nav-projects"
import { NavMywork } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

 
import { ScrollArea } from "@/components/ui/scroll-area"

// This is sample data.
const data = {
  user: {
    name: "ME",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "HP Company",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Master",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Company",
          url: "/master/Company_table",
        },
        {
          title: "Assets",
          url: "/master/Assets_table",
        },
        {
          title: "Contact",
          url: "/master/Contact_table",
        },
        {
          title: "Case",
          url: "/master/Case_table",
        },
      ],
    },
    {
      title: "Service",
      url: "#",
      icon: ServerIcon,
      items: [
        {
          title: "Case",
          url: "/Case",
        },
        {
          title: "Work Order",
          url: "#",
        },
        {
          title: "Material Order",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Home",
      url: "/",
      icon: Home,
    },
  ],

  recent: [
    {
      name: "Pinned",
      url: "#",
      icon: PieChart,
    }
  ],

  mywork: [
    {
      name: "My work",
      url: "/search_case",
      icon: Table,
    }
  ],

  pinned: [
    {
      name: "Pinned",
      url: "#",
      icon: Pin
    }
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavRecent recent={data.recent}/>
        <NavPinned pinned={data.pinned}/>
        <NavMywork mywork={data.mywork}/>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
