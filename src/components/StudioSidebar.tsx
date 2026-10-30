"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Mic2, Library, Coins, ArrowUpRight, History, Settings, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

export default function StudioSidebar() {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number>(10000);
  const [tier, setTier] = useState<string>("free");

  useEffect(() => {
    fetch("/api/user/credits")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) {
          setCredits(data.balance);
          setTier(data.tier);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    {
      label: "Text to Speech",
      href: "/studio",
      icon: Sparkles,
      badge: "Core",
    },
    {
      label: "Voice Cloning Lab",
      href: "/studio/cloning",
      icon: Mic2,
      badge: "IVC",
    },
    {
      label: "Voice Library",
      href: "/studio/voices",
      icon: Library,
      badge: "17k+",
    },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-surface-800 flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex">
      <div className="space-y-6">
        {/* Workspace Label */}
        <div className="px-2 pt-1">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-surface-400">Studio Workspace</p>
        </div>

        {/* Primary Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm"
                    : "text-surface-400 hover:text-white hover:bg-surface-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-surface-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-800 text-surface-400 border border-surface-700/50">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Credit Balance & Upgrade Card */}
      <div className="glass-panel p-4 rounded-2xl border border-surface-700/60 bg-gradient-to-b from-surface-900/60 to-surface-950/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium capitalize">{tier} Plan</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-lg font-bold text-white tracking-tight">{formatNumber(credits)}</span>
            <span className="text-[11px] font-mono text-surface-400">/ 10,000</span>
          </div>
          <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full gradient-brand rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (credits / 10000) * 100)}%` }}
            />
          </div>
        </div>

        <Link
          href="/pricing"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white gradient-brand hover:brightness-110 shadow-md shadow-brand-500/20 transition-all"
        >
          <span>Upgrade Tier</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
