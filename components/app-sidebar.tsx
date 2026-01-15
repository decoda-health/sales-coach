"use client";

import { LayoutDashboard, Users, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Team", href: "/reps", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center glow-border">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="heading-display text-xl text-foreground">
              Sales Coach
            </h1>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">
              AI Intelligence
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        h-11 px-4 rounded-lg transition-all duration-200
                        ${isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }
                      `}
                    >
                      <a href={item.href} className="flex items-center gap-3">
                        <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-primary" : ""}`} />
                        <span className="font-medium text-[14px]">{item.title}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">AI Coaching</p>
              <p className="text-[10px] text-muted-foreground">Powered by Claude</p>
            </div>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-3 tracking-wider uppercase">
          Version 0.1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
