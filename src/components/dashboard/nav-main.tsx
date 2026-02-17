"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Kanban,
  FileText,
  Bell,
  Settings,
  Ticket,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

const platformItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    href: "/dashboard/contacts",
    icon: Users,
  },
  {
    title: "Deals",
    href: "/dashboard/deals",
    icon: Kanban,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Reminders",
    href: "/dashboard/reminders",
    icon: Bell,
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
]

const settingsItems: NavItem[] = [
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function NavMain() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {platformItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="mt-auto">
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
