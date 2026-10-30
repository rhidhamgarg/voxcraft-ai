"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Sparkles, Cpu, Bell, ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "./breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search voices, generations, models..."
            className="h-8 w-64 rounded-md border border-input bg-muted/40 pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Engine status */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge
            variant="steel"
            className="h-7 gap-1.5 px-2.5 text-[11px] font-medium"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-steelblue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-steelblue"></span>
            </span>
            Kokoro 82M: Online
          </Badge>
        </div>

        {/* Studio Quick Action */}
        <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Link href="/studio">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Launch</span> Studio
          </Link>
        </Button>

        {/* User profile avatar */}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            VC
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
