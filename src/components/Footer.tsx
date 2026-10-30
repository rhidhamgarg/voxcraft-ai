"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, Globe, Share2, MessageSquare } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on full dashboard and studio viewports
  if (pathname === "/dashboard" || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-surface-800 bg-surface-950/80 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">VoxCraft AI</span>
            </div>
            <p className="text-sm text-surface-400 max-w-sm mb-6 leading-relaxed">
              Next-generation generative voice synthesis, instant voice cloning, and audio AI powered by Kokoro-82M neural model.
            </p>
            <div className="flex items-center gap-3 text-surface-400">
              <a href="#" className="p-2 rounded-lg bg-surface-900 hover:text-white hover:bg-surface-800 transition-colors" title="Global Community">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-surface-900 hover:text-white hover:bg-surface-800 transition-colors" title="Social Channels">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-surface-900 hover:text-white hover:bg-surface-800 transition-colors" title="Developer Discussions">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-300 mb-4">Audio Suite</h4>
            <ul className="space-y-2.5 text-sm text-surface-400">
              <li><Link href="/studio" className="hover:text-white transition-colors">Text to Speech</Link></li>
              <li><Link href="/studio/cloning" className="hover:text-white transition-colors">Voice Cloning (IVC)</Link></li>
              <li><Link href="/studio/voices" className="hover:text-white transition-colors">Voice Library (17k+)</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Figma Dashboard</Link></li>
            </ul>
          </div>

          {/* Developers & APIs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-300 mb-4">Developers</h4>
            <ul className="space-y-2.5 text-sm text-surface-400">
              <li><Link href="/studio" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">WebSocket Streaming</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Live Analytics</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-300 mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-surface-400">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Enterprise Metrics</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-surface-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500 font-mono">
          <p>© 2026 VoxCraft AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-surface-400">Privacy Policy</a>
            <a href="#" className="hover:text-surface-400">Terms of Service</a>
            <a href="#" className="hover:text-surface-400">Security Architecture</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
