import Link from "next/link";
import { Volume2, Shield, Cpu, Globe, Share2, MessageSquare } from "lucide-react";

export default function Footer() {
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
              Next-generation generative voice synthesis, instant voice cloning, and audio AI engineered for creators, game studios, and developers.
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
              <li><Link href="/studio" className="hover:text-white transition-colors">Speech to Speech</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">Sound Effects AI</Link></li>
            </ul>
          </div>

          {/* Developers & APIs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-300 mb-4">Developers</h4>
            <ul className="space-y-2.5 text-sm text-surface-400">
              <li><Link href="/studio" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">WebSocket Streaming</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">Python SDK</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">Node.js Client</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Rate Limits & SLAs</Link></li>
            </ul>
          </div>

          {/* Trust & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-300 mb-4">Trust & Safety</h4>
            <ul className="space-y-2.5 text-sm text-surface-400">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> <span>Voice Verification</span></li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-brand-400" /> <span>AI Watermarking</span></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CCPA / GDPR Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-400 gap-4">
          <p>© {new Date().getFullYear()} VoxCraft AI Inc. Built with Next.js, React, Tailwind CSS & Neural Audio Vocoders.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Audio Inference Clusters Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
