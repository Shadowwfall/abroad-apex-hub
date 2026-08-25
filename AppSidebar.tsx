import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  GraduationCap,
  UserPlus,
  FileText,
  Wallet,
  Users,
  Building2,
  BarChart3,
  History,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Pipeline",
    items: [
      { title: "Students", url: "/students", icon: GraduationCap },
      { title: "Leads", url: "/leads", icon: UserPlus },
      { title: "Applications", url: "/applications", icon: FileText },
    ],
  },
  {
    label: "Casework",
    items: [{ title: "Payments", url: "/payments", icon: Wallet }],
  },

  {
    label: "Administration",
    items: [
      { title: "Staff", url: "/staff", icon: Users },
      { title: "Branches", url: "/branches", icon: Building2 },
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Activity Logs", url: "/activity", icon: History },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
              <div className="grid aspect-square size-8 shrink-0 place-items-center rounded-xl gradient-warm text-primary-foreground font-display text-base font-semibold shadow-[var(--shadow-soft)]">
                A
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                <span className="truncate font-display text-sm font-semibold">
                  APEX Abroad
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Consultancy CRM
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="rounded-xl transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_2px_0_0_var(--color-primary)]"
                      >
                        <Link to={item.url}>
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
