"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "": "Overview",
  studio: "TTS Studio",
  voices: "Voice Library",
  cloning: "Instant Cloning",
  pricing: "Pricing & Plans",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground font-medium">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">VoxCraft</span>
      </Link>
      {segments.length === 0 ? (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-foreground font-semibold">Overview</span>
        </>
      ) : (
        segments.map((segment, index) => {
          const url = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={url}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              {isLast ? (
                <span className="text-foreground font-semibold">{label}</span>
              ) : (
                <Link
                  href={url}
                  className="hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })
      )}
    </nav>
  );
}
