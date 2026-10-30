"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic2, Sparkles, Volume2, Coins, ArrowRight, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // Hide Navbar completely on the standalone Figma dashboard
  if (pathname === "/dashboard" || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const isStudio = pathname?.startsWith("/studio");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">VoxCraft</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-surface-400 font-mono -mt-0.5">Neural Audio Platform</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        {!isStudio && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-surface-300">
            <Link
              href="/dashboard"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              Figma Dashboard
            </Link>
            <Link
              href="/studio"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              TTS Studio
            </Link>
            <Link
              href="/studio/voices"
              className="hover:text-white transition-colors"
            >
              Voice Library
            </Link>
            <Link
              href="/studio/cloning"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Mic2 className="w-4 h-4 text-emerald-400" />
              Instant Clone
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </nav>
        )}

        {/* Right CTA Area */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Figma UI</span>
          </Link>

          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-95 shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
