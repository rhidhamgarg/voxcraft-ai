"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Sliders,
  Play,
  Loader2,
  Wand2,
  History,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Download,
  Trash2,
  Volume2,
  Radio,
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { Voice, GenerationSettings, GenerationHistoryItem } from "@/types";
import VoiceSelectorModal from "@/components/VoiceSelectorModal";
import AudioWaveformPlayer from "@/components/AudioWaveformPlayer";
import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

export default function StudioPage() {
  const studioRef = useRef<HTMLDivElement>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(DEFAULT_VOICES[0]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [text, setText] = useState<string>(
    "Welcome to VoxCraft AI. [softly] In the silence between words, stories take flight. What will you create today?"
  );
  const [modelId, setModelId] = useState<string>("vox_v4_ultra");
  const [settings, setSettings] = useState<GenerationSettings>({
    stability: 0.5,
    similarity: 0.75,
    styleExaggeration: 0.15,
    speed: 1.0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const characterCount = text.length;
  const maxCharacters = 5000;

  // Read URL search param for voice selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const voiceParam = params.get("voice");
      if (voiceParam) {
        const found = DEFAULT_VOICES.find((v) => v.id === voiceParam);
        if (found) setSelectedVoice(found);
      }
    }
  }, []);

  // Hydrate generation history from API on mount
  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.items) {
          setHistory(res.data.items);
          if (res.data.items.length > 0 && !currentAudioUrl) {
            setCurrentAudioUrl(res.data.items[0].audioUrl);
            setCurrentDuration(res.data.items[0].durationSeconds);
            setSelectedVoice(res.data.items[0].voice);
          }
        }
      })
      .catch(() => {});
  }, [currentAudioUrl]);

  const emotionTags = [
    { label: "Softly", tag: "[softly] " },
    { label: "Whispers", tag: "[whispers] " },
    { label: "Laughs", tag: "[laughs] " },
    { label: "Excited", tag: "[excited] " },
    { label: "Pensive", tag: "[pensive] " },
    { label: "Dramatic Pause", tag: " ... " },
  ];

  const quickVoices = [
    DEFAULT_VOICES.find((v) => v.id === "af_heart") || DEFAULT_VOICES[0],
    DEFAULT_VOICES.find((v) => v.id === "af_bella") || DEFAULT_VOICES[1],
    DEFAULT_VOICES.find((v) => v.id === "af_nicole") || DEFAULT_VOICES[2],
    DEFAULT_VOICES.find((v) => v.id === "am_adam") || DEFAULT_VOICES[7],
    DEFAULT_VOICES.find((v) => v.id === "am_echo") || DEFAULT_VOICES[9],
    DEFAULT_VOICES.find((v) => v.id === "bf_emma") || DEFAULT_VOICES[15],
    DEFAULT_VOICES.find((v) => v.id === "bm_george") || DEFAULT_VOICES[19],
    DEFAULT_VOICES.find((v) => v.id === "bm_daniel") || DEFAULT_VOICES[22],
  ];

  const insertTag = (tag: string) => {
    setText((prev) => prev + tag);
  };

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          settings,
          modelId,
        }),
      });

      const res = await response.json();

      if (res.success && res.data?.audioUrl) {
        const item: GenerationHistoryItem = {
          id: res.data.generationId,
          text,
          voice: selectedVoice,
          settings: { ...settings },
          audioUrl: res.data.audioUrl,
          durationSeconds: res.data.durationSeconds || 3.5,
          characterCount: text.length,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setCurrentAudioUrl(res.data.audioUrl);
        setCurrentDuration(res.data.durationSeconds || 3.5);
        setHistory((prev) => [item, ...prev]);
      }
    } catch (err) {
      console.error("Speech synthesis failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = (item: GenerationHistoryItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  // GSAP Studio Animations
  useGsapContext(
    () => {
      const tl = gsap.timeline({ defaults: { ease: MOTION.ease.smooth } });
      tl.fromTo(
        ".gsap-studio-header",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4 }
      )
        .fromTo(
          ".gsap-studio-editor",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        )
        .fromTo(
          ".gsap-studio-history",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        );
    },
    studioRef,
    []
  );

  return (
    <div ref={studioRef}>
      <PageContainer>
        {/* Header bar */}
        <div className="gsap-studio-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tighter flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Text to Speech Studio</span>
              </h1>
              <Badge variant="steel" className="text-[10px]">
                Free & Unlimited
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
              Select from 23 official Kokoro-82M neural voices or custom clones with sub-second local synthesis.
            </p>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Engine:</span>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="vox_v4_ultra">Kokoro-82M (Local Vocoder 24kHz)</option>
              <option value="vox_v3_multilingual">Vox-3 Multilingual (32+ Languages)</option>
              <option value="vox_turbo_v2">Turbo Realtime (Sub-250ms Latency)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Editor Section (8 cols) */}
          <div className="gsap-studio-editor lg:col-span-8 space-y-6">
            {/* Active Voice Selector Card */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {selectedVoice.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-heading font-semibold tracking-tight">{selectedVoice.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono capitalize">
                          {selectedVoice.category}
                        </Badge>
                        <Badge variant="steel" className="text-[10px]">
                          Free
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground tracking-snug mt-0.5">
                        {selectedVoice.accent} · {selectedVoice.gender} · 24kHz Lossless
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct Voice Dropdown */}
                    <select
                      value={selectedVoice.id}
                      onChange={(e) => {
                        const voice = DEFAULT_VOICES.find((v) => v.id === e.target.value);
                        if (voice) setSelectedVoice(voice);
                      }}
                      className="h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <optgroup label="American Female">
                        {DEFAULT_VOICES.filter((v) => v.accent === "American" && v.gender === "female").map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="American Male">
                        {DEFAULT_VOICES.filter((v) => v.accent === "American" && v.gender === "male").map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="British Female">
                        {DEFAULT_VOICES.filter((v) => v.accent === "British" && v.gender === "female").map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="British Male">
                        {DEFAULT_VOICES.filter((v) => v.accent === "British" && v.gender === "male").map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </optgroup>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="gap-1.5 text-xs h-8 shrink-0"
                    >
                      <span>All 23 Voices</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Quick Switch Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium mr-1">
                    Quick Pick:
                  </span>
                  {quickVoices.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVoice(v)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                        selectedVoice.id === v.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/60"
                      }`}
                    >
                      {v.name.split(" ")[0]} ({v.gender.charAt(0).toUpperCase()})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Script Textarea Card */}
            <Card className="overflow-hidden">
              {/* Emotion Chips Bar */}
              <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap mr-1 flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-primary" /> Emotion Tags:
                </span>
                {emotionTags.map((et) => (
                  <button
                    key={et.label}
                    type="button"
                    onClick={() => insertTag(et.tag)}
                    className="px-2 py-0.5 rounded border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {et.tag.trim()}
                  </button>
                ))}
              </div>

              {/* Input area */}
              <CardContent className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your script here. Use inline markup like [whispers] or [laughs] to guide vocal emotion..."
                  rows={8}
                  className="w-full bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none resize-none"
                />
              </CardContent>

              {/* Bottom Bar inside Card */}
              <CardFooter className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/10">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">
                    {characterCount} / {maxCharacters} chars
                  </span>
                  <span className="flex items-center gap-1 text-steelblue font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Local Generation</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border transition-colors cursor-pointer ${
                      showAdvanced ? "bg-muted text-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showAdvanced ? "Hide Controls" : "Voice Controls"}</span>
                  </button>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || characterCount === 0}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Generate Speech</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Advanced Voice Controls Drawer */}
            {showAdvanced && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-heading font-semibold text-sm tracking-tight">Voice Prosody & Synthesis Settings</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        stability: 0.5,
                        similarity: 0.75,
                        styleExaggeration: 0.15,
                        speed: 1.0,
                      })
                    }
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Pacing & Speed</span>
                      <span className="font-mono text-muted-foreground">{settings.speed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={settings.speed}
                      onChange={(e) =>
                        setSettings({ ...settings, speed: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>0.5x Slow</span>
                      <span>1.0x Normal</span>
                      <span>2.0x Fast</span>
                    </div>
                  </div>

                  {/* Vocal Stability */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Stability (Consistency)</span>
                      <span className="font-mono text-muted-foreground">{Math.round(settings.stability * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={settings.stability}
                      onChange={(e) =>
                        setSettings({ ...settings, stability: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Expressive & Dynamic</span>
                      <span>Even & Steady</span>
                    </div>
                  </div>

                  {/* Clarity / Similarity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Similarity Boost</span>
                      <span className="font-mono text-muted-foreground">{Math.round(settings.similarity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={settings.similarity}
                      onChange={(e) =>
                        setSettings({ ...settings, similarity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Low (Artifact suppression)</span>
                      <span>High (Exact Timbre)</span>
                    </div>
                  </div>

                  {/* Style Exaggeration */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Style Exaggeration</span>
                      <span className="font-mono text-muted-foreground">{Math.round(settings.styleExaggeration * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={settings.styleExaggeration}
                      onChange={(e) =>
                        setSettings({ ...settings, styleExaggeration: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Natural / Flat</span>
                      <span>Dramatic Emphasis</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Generated Audio Player Waveform Card */}
            {currentAudioUrl && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Active Audio Waveform</CardTitle>
                      <CardDescription className="text-xs">
                        {selectedVoice.name} · 24kHz Lossless Audio
                      </CardDescription>
                    </div>
                    <a
                      href={currentAudioUrl}
                      download={`voxcraft-${selectedVoice.id}-${Date.now()}.wav`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download WAV</span>
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <AudioWaveformPlayer
                    audioUrl={currentAudioUrl}
                    title={`${selectedVoice.name} — Generated Speech`}
                    duration={currentDuration}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Generation History (4 cols) */}
          <div className="gsap-studio-history lg:col-span-4 space-y-4">
            <Card>
              <CardHeader className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <span>Recent Generations</span>
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {history.length} items
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-3 space-y-2.5 max-h-[620px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs space-y-1">
                    <p>No generations yet.</p>
                    <p className="text-[11px]">Synthesize speech above to see history here.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentAudioUrl(item.audioUrl);
                        setCurrentDuration(item.durationSeconds);
                        setSelectedVoice(item.voice);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        currentAudioUrl === item.audioUrl
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border hover:border-foreground/30 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-heading font-semibold tracking-tight">{item.voice.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.createdAt}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                        {item.text}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1.5 border-t border-border/40">
                        <span>{item.durationSeconds}s</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPrompt(item);
                            }}
                            className="hover:text-foreground transition-colors p-1"
                            title="Copy prompt"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-steelblue" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={item.audioUrl}
                            download={`${item.voice.name}-${item.id}.wav`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-foreground transition-colors p-1"
                            title="Download audio"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="hover:text-destructive transition-colors p-1"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voice Selection Modal */}
        <VoiceSelectorModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          selectedVoice={selectedVoice}
          onSelectVoice={(voice) => {
            setSelectedVoice(voice);
            setIsVoiceModalOpen(false);
          }}
        />
      </PageContainer>
    </div>
  );
}
