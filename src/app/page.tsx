"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Volume2,
  Zap,
  Layers,
  Coins,
  Play,
  Pause,
  Download,
  Loader2,
  ArrowRight,
  MicVocal,
  Radio,
  Clock,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { Voice } from "@/types";

import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

interface GenerationItem {
  id: string;
  text: string;
  voiceName: string;
  audioUrl: string;
  duration: number;
  timestamp: string;
}

export default function DashboardOverviewPage() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [selectedVoice, setSelectedVoice] = React.useState<Voice>(DEFAULT_VOICES[0]);
  const [promptText, setPromptText] = React.useState(
    "Welcome to VoxCraft AI. Creating hyper-realistic, human-grade voices has never been simpler."
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioElement, setAudioElement] = React.useState<HTMLAudioElement | null>(null);
  const [recentGenerations, setRecentGenerations] = React.useState<GenerationItem[]>([]);

  // GSAP Entrance Animations
  useGsapContext(
    () => {
      const tl = gsap.timeline({ defaults: { ease: MOTION.ease.smooth } });
      tl.fromTo(
        ".gsap-header",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45 }
      )
        .fromTo(
          ".gsap-stat-card",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
          "-=0.25"
        )
        .fromTo(
          ".gsap-main-grid",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.2"
        )
        .fromTo(
          ".gsap-workflow-card",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 },
          "-=0.2"
        );
    },
    containerRef,
    []
  );

  // Fetch recent history on mount
  React.useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.generations) && data.generations.length > 0) {
            setRecentGenerations(
              data.generations.slice(0, 5).map((g: any) => ({
                id: g.id,
                text: g.textPrompt || g.text || "Generated speech sample",
                voiceName: g.voiceName || "Kokoro Voice",
                audioUrl: g.audioUrl || `/api/audio/${g.id}/download`,
                duration: g.durationSeconds || 2.4,
                timestamp: new Date(g.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }))
            );
          }
        }
      } catch (e) {
        console.error("Failed to fetch history:", e);
      }
    }
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: promptText,
          voiceId: selectedVoice.id,
          speed: 1.0,
          format: "mp3",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await res.json();
      setCurrentAudioUrl(data.audioUrl);

      // Play audio automatically
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(data.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);

      // Prepend to recent list
      const newItem: GenerationItem = {
        id: data.id || `gen-${Date.now()}`,
        text: promptText,
        voiceName: selectedVoice.name,
        audioUrl: data.audioUrl,
        duration: data.durationSeconds || 2.5,
        timestamp: "Just now",
      };
      setRecentGenerations((prev) => [newItem, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error(err);
      alert("Error generating speech. Ensure Kokoro microservice is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayToggle = (url: string) => {
    if (audioElement && isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }
    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setAudioElement(audio);
    setIsPlaying(true);
  };

  return (
    <div ref={containerRef}>
      <PageContainer>
        {/* Header bar */}
        <div className="gsap-header flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tighter text-foreground">
              Voice Studio Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
              Generate lifelike neural audio with Kokoro-82M open weights and local 24kHz synthesis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/studio/voices">
                <Volume2 className="mr-1.5 h-3.5 w-3.5 text-steelblue" />
                Voice Catalog
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/studio">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Open Full Studio
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Activity Log</TabsTrigger>
            <TabsTrigger value="models">Active Models</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top 4 Stat Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="gsap-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total Generated
                  </CardDescription>
                  <CardAction>
                    <Badge variant="steel" className="gap-1 font-mono text-[10px]">
                      <TrendingUp className="h-3 w-3 text-steelblue" />
                      +18.2%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tighter">
                    48,250
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 tracking-snug">Characters synthesised</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0">
                  128 audio tracks exported
                </CardFooter>
              </Card>

              <Card className="gsap-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Kokoro Latency
                  </CardDescription>
                  <CardAction>
                    <Badge variant="steel" className="gap-1 font-mono text-[10px]">
                      <Zap className="h-3 w-3 text-steelblue" />
                      Sub-second
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tighter">
                    840 ms
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 tracking-snug">Mean inference time</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0">
                  24kHz HiFi-GAN Vocoder
                </CardFooter>
              </Card>

              <Card className="gsap-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Active Voices
                  </CardDescription>
                  <CardAction>
                    <Badge variant="subtle" className="gap-1 font-mono text-[10px]">
                      <Layers className="h-3 w-3 text-slate" />
                      v0.19
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tighter">
                    18 Voices
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 tracking-snug">Curated neural models</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0">
                  Zero per-minute cost
                </CardFooter>
              </Card>

              <Card className="gsap-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Remaining Credits
                  </CardDescription>
                  <CardAction>
                    <Badge variant="ivory" className="gap-1 font-mono text-[10px]">
                      <Coins className="h-3 w-3 text-silver" />
                      Active
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tighter">
                    12,500
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 tracking-snug">Characters available</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0">
                  Renews automatically in 18d
                </CardFooter>
              </Card>
            </div>

            {/* Main Grid: Playground & Activity */}
            <div className="gsap-main-grid grid gap-6 lg:grid-cols-12">
            {/* Quick Speech Playground */}
            <Card className="lg:col-span-7 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-heading font-semibold tracking-tight">
                      Quick TTS Playground
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      Test prompts directly with the Kokoro neural vocoder.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Model: Kokoro-82M
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Voice Selection Chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Select Voice</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_VOICES.slice(0, 5).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVoice(v)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          selectedVoice.id === v.id
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
                        }`}
                      >
                        <Radio className="h-3 w-3" />
                        <span>{v.name}</span>
                        <span className="opacity-70 text-[10px]">({v.accent})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text prompt area */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Input Text Prompt</span>
                    <span className="font-mono">{promptText.length} chars</span>
                  </div>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    className="w-full rounded-md border border-input bg-transparent p-3 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Active Audio Output Player */}
                {currentAudioUrl && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30 animate-in fade-in-50">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handlePlayToggle(currentAudioUrl)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">Generated Speech</span>
                        <span className="text-[11px] text-muted-foreground">
                          {selectedVoice.name} · 24kHz Audio
                        </span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
                      <a href={currentAudioUrl} download="speech.mp3">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Sub-second latency (0.8s) · Local microservice
                </span>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !promptText.trim()}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Synthesising...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Audio
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Generations Activity Feed */}
            <Card className="lg:col-span-5 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-heading font-semibold tracking-tight">
                      Recent Generations
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      Latest speech files created in your studio.
                    </CardDescription>
                  </div>
                  <Link
                    href="/studio"
                    className="text-xs text-primary hover:underline font-medium tracking-snug flex items-center gap-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {recentGenerations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <Volume2 className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-heading font-medium tracking-tight">No generations recorded yet</p>
                    <p className="text-xs leading-relaxed mt-0.5">Type a prompt in the playground to create your first track.</p>
                  </div>
                ) : (
                  recentGenerations.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 rounded-full bg-muted/60"
                          onClick={() => handlePlayToggle(item.audioUrl)}
                        >
                          <Play className="h-3.5 w-3.5 ml-0.5 text-foreground" />
                        </Button>
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs font-medium text-foreground tracking-snug truncate max-w-[200px]">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                            <span>{item.voiceName}</span>
                            <span>·</span>
                            <span>{item.duration}s</span>
                            <span>·</span>
                            <span>{item.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                        <a href={item.audioUrl} download={`${item.id}.mp3`}>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>

              <CardFooter className="border-t border-border/40 pt-4">
                <Button asChild variant="outline" className="w-full text-xs font-medium tracking-snug">
                  <Link href="/studio">Open TTS Studio</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Platform Workflows */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/studio" className="group gsap-workflow-card">
              <Card className="h-full hover:border-foreground/30 transition-all group-hover:shadow-xs">
                <CardHeader>
                  <Sparkles className="h-5 w-5 text-ivory mb-2" />
                  <CardTitle className="text-sm font-heading font-semibold tracking-tight">TTS Studio</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Full vocal parameter control, speech pacing, emotion tags and instant preview.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/studio/voices" className="group gsap-workflow-card">
              <Card className="h-full hover:border-foreground/30 transition-all group-hover:shadow-xs">
                <CardHeader>
                  <Volume2 className="h-5 w-5 text-steelblue mb-2" />
                  <CardTitle className="text-sm font-heading font-semibold tracking-tight">Voice Catalog</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Browse 18 curated high-fidelity neural voices across styles and accents.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/studio/cloning" className="group gsap-workflow-card">
              <Card className="h-full hover:border-foreground/30 transition-all group-hover:shadow-xs">
                <CardHeader>
                  <MicVocal className="h-5 w-5 text-slate mb-2" />
                  <CardTitle className="text-sm font-heading font-semibold tracking-tight">Voice Cloning</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Synthesise custom voice embeddings from a 15-second audio sample.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/pricing" className="group gsap-workflow-card">
              <Card className="h-full hover:border-foreground/30 transition-all group-hover:shadow-xs">
                <CardHeader>
                  <CreditCard className="h-5 w-5 text-silver mb-2" />
                  <CardTitle className="text-sm font-heading font-semibold tracking-tight">Plans & Scaling</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Explore credit packs, commercial rights, and dedicated GPU worker clusters.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-heading font-semibold tracking-tight">
                Full Synthesis Activity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Audit log of all neural speech synthesis requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGenerations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-muted"
                        onClick={() => handlePlayToggle(item.audioUrl)}
                      >
                        <Play className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                      <div>
                        <p className="text-xs font-medium tracking-snug">{item.text}</p>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Voice: {item.voiceName} · Latency: 0.84s · {item.timestamp}
                        </span>
                      </div>
                    </div>
                    <Badge variant="steel" className="font-mono text-[10px]">
                      200 OK
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Badge variant="steel" className="w-fit text-[10px] mb-1">
                  Active
                </Badge>
                <CardTitle className="text-sm font-heading font-semibold tracking-tight">Kokoro-82M</CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                  82 million parameter Apache-2.0 open-weights model running locally at 24kHz.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit text-[10px] mb-1">
                  Standby
                </Badge>
                <CardTitle className="text-sm font-heading font-semibold tracking-tight">Deepgram Aura</CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Ultra-low latency streaming cloud fallback for conversational voice agents.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit text-[10px] mb-1">
                  Standby
                </Badge>
                <CardTitle className="text-sm font-heading font-semibold tracking-tight">OpenAI TTS-1-HD</CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Enterprise-grade multi-lingual neural speech generation provider.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
    </div>
  );
}
