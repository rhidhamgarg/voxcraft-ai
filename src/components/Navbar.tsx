"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic2, Sparkles, Volume2, Coins, ArrowRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
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
              Voice Cloning
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </nav>
        )}

        {/* Right CTA / Action Area */}
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-900 border border-surface-700 text-surface-300 hover:border-brand-500/50 transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>10,000 Credits Free</span>
          </Link>

          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-brand hover:brightness-110 shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
