"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  MicVocal,
  Music2,
  CreditCard,
  Radio,
  Cpu,
  Layers,
  Sliders,
  Settings,
  ChevronDown,
  Volume2,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNavItems = [
  {
    title: "Overview",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "TTS Studio",
    url: "/studio",
    icon: Sparkles,
    badge: "Kokoro",
  },
  {
    title: "Voice Library",
    url: "/studio/voices",
    icon: Volume2,
    badge: "18",
  },
  {
    title: "Voice Cloning",
    url: "/studio/cloning",
    icon: MicVocal,
    badge: "Neural",
  },
  {
    title: "Pricing & Plans",
    url: "/pricing",
    icon: CreditCard,
    badge: null,
  },
];

const secondaryNavItems = [
  {
    title: "Audio Vocoder (24kHz)",
    url: "/studio",
    icon: Cpu,
  },
  {
    title: "Speech Latency: <1s",
    url: "/studio",
    icon: Zap,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <Radio className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm leading-tight text-sidebar-foreground truncate flex items-center gap-1.5">
                VoxCraft AI
                <span className="text-[10px] px-1 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Kokoro-82M Studio
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Studio Platform</SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname === item.url || pathname.startsWith(`${item.url}/`);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-muted text-muted-foreground border border-border/60">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Engine & Telemetry</SidebarGroupLabel>
          <SidebarMenu>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={false}
                    className="text-xs text-muted-foreground"
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-1 py-1 rounded-md">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
              VC
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                Creator Account
              </span>
              <span className="text-[10px] text-muted-foreground truncate font-mono">
                12,500 chars left
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
