"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Volume2,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Mic2,
  Library,
  Zap,
  Globe2,
  Shield,
  Layers,
  ChevronRight,
  Headphones,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { Voice } from "@/types";

export default function HomePage() {
  const [activeVoice, setActiveVoice] = useState<Voice>(DEFAULT_VOICES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"creative" | "agents" | "api">("creative");

  const toggleSample = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Top Notification Announcement */}
      <div className="pt-6 px-4 flex justify-center">
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium glass-panel-subtle hover:border-brand-500/50 text-surface-300 transition-all hover:scale-[1.02]"
        >
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
          <span className="text-white font-semibold">Vox-4 Ultra Released:</span>
          <span>Contextual emotion, inline speech tags & 90+ languages</span>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Bringing <span className="gradient-text">technology</span> to life
          </h1>
          <p className="text-base sm:text-xl text-surface-400 max-w-2xl mx-auto leading-relaxed">
            Generate human-grade AI speech, clone authentic voices from seconds of audio, and deploy real-time conversational voice agents with sub-250ms latency.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/studio"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white gradient-brand hover:brightness-110 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Studio for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/studio/voices"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-surface-200 glass-panel hover:text-white hover:border-surface-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Library className="w-4 h-4 text-brand-400" />
            <span>Explore 17,500+ Voices</span>
          </Link>
        </div>

        {/* Live Audio Playground Sandbox */}
        <div className="pt-6 max-w-3xl mx-auto">
          <div className="glass-panel p-6 rounded-3xl border border-surface-700/80 shadow-2xl space-y-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Interactive Speech Sandbox</span>
              </div>
              <span className="text-xs text-surface-400">Model: Vox-4 Ultra</span>
            </div>

            {/* Script sample quote */}
            <div className="p-4 rounded-2xl bg-surface-950/60 border border-surface-800/80">
              <p className="text-sm sm:text-base text-surface-200 leading-relaxed font-sans">
                "{activeVoice.sampleText}"
              </p>
            </div>

            {/* Voice switcher chips & Player */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {DEFAULT_VOICES.slice(0, 4).map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setActiveVoice(voice);
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activeVoice.id === voice.id
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                        : "bg-surface-900 text-surface-400 hover:text-white border border-surface-800"
                    }`}
                  >
                    {voice.name.split(" ")[0]} ({voice.category.slice(0, 4)})
                  </button>
                ))}
              </div>

              <button
                onClick={toggleSample}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white gradient-brand hover:brightness-110 shadow-md shadow-brand-500/20 transition-all self-end sm:self-auto"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                <span>{isPlaying ? "Playing Sample..." : "Listen to Sample"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Enterprise Logos */}
      <section className="max-w-6xl mx-auto px-4 text-center space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 font-mono">
          Trusted by next-generation studios, creators, and platforms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
          <span className="text-lg font-bold text-white tracking-widest font-mono">DUOLINGO</span>
          <span className="text-lg font-bold text-white tracking-widest font-mono">NVIDIA</span>
          <span className="text-lg font-bold text-white tracking-widest font-mono">DISNEY</span>
          <span className="text-lg font-bold text-white tracking-widest font-mono">PERPLEXITY</span>
          <span className="text-lg font-bold text-white tracking-widest font-mono">RAZORPAY</span>
        </div>
      </section>

      {/* Product Suite Deep-Dive Tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One Research Engine. Endless Applications.
          </h2>
          <p className="text-sm sm:text-base text-surface-400 max-w-xl mx-auto">
            From expressive creator media to autonomous conversational AI agents.
          </p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: TTS Studio */}
          <div className="glass-panel p-6 rounded-3xl border border-surface-700/80 space-y-4 hover:border-brand-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Text to Speech Studio</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Transform written text into nuanced speech. Control vocal stability, pacing, style exaggeration, and insert emotional markup like whispers and laughs.
            </p>
            <Link href="/studio" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300">
              <span>Open TTS Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Voice Cloning */}
          <div className="glass-panel p-6 rounded-3xl border border-surface-700/80 space-y-4 hover:border-brand-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Mic2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Voice Cloning</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Upload a 15-second microphone sample to extract zero-shot latent acoustic embeddings. Replicate your voice instantly with full privacy verification.
            </p>
            <Link href="/studio/cloning" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              <span>Try Voice Cloning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3: Realtime API */}
          <div className="glass-panel p-6 rounded-3xl border border-surface-700/80 space-y-4 hover:border-brand-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Sub-250ms Audio API</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Real-time WebSocket audio streaming engineered for interactive conversational bots, call center agents, NPC game dialog, and dynamic localization.
            </p>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              <span>View API Tiers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-surface-700/80 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Built for Production Reliability</h2>
            <p className="text-xs sm:text-sm text-surface-400">Enterprise security, multi-language coverage, and low-latency infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Globe2 className="w-4 h-4 text-brand-400" />
                <span>90+ Language Coverage</span>
              </div>
              <p className="text-xs text-surface-400">Native phoneme accuracy across European, Asian, and Middle Eastern dialects.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Sliders className="w-4 h-4 text-brand-400" />
                <span>Micro-Prosody Control</span>
              </div>
              <p className="text-xs text-surface-400">Granular sliders for stability, similarity boost, style exaggeration, and playback speed.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>Biometric Voice CAPTCHA</span>
              </div>
              <p className="text-xs text-surface-400">Mandatory vocal consent verification ensures ethical cloning without deepfake abuse.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Headphones className="w-4 h-4 text-brand-400" />
                <span>44.1kHz PCM Studio Audio</span>
              </div>
              <p className="text-xs text-surface-400">Uncompressed broadcast-ready audio output for television, audiobooks, and film.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Deduplicated Audio Cache</span>
              </div>
              <p className="text-xs text-surface-400">Intelligent hash caching reduces API expenses by serving repeated clips from zero-cost storage.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Worldwide Commercial Rights</span>
              </div>
              <p className="text-xs text-surface-400">Every paid tier includes perpetual commercial monetization rights across all platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-brand-500/40 bg-gradient-to-b from-brand-950/40 via-surface-900/60 to-surface-950/80 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to bring your words to life?
          </h2>
          <p className="text-sm text-surface-300 max-w-xl mx-auto leading-relaxed">
            Start synthesizing with 10,000 free credits today. No credit card required.
          </p>
          <div className="pt-2">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white gradient-brand hover:brightness-110 shadow-lg shadow-brand-500/30 transition-all text-sm sm:text-base"
            >
              <span>Launch VoxCraft Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
