"use client";

import { useState, useEffect, useRef } from "react";
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
  Globe,
  Cpu,
  Server,
  Key,
  AlertCircle,
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
import { DEFAULT_VOICES, ALL_CATALOG_VOICES } from "@/lib/voice-catalog";
import { Voice, GenerationSettings, GenerationHistoryItem, ProviderId, TTSProviderInfo } from "@/types";
import VoiceSelectorModal from "@/components/VoiceSelectorModal";
import AudioWaveformPlayer from "@/components/AudioWaveformPlayer";
import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

export default function StudioPage() {
  const studioRef = useRef<HTMLDivElement>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<ProviderId>("kokoro");
  const [providers, setProviders] = useState<TTSProviderInfo[]>([]);
  const [allVoices, setAllVoices] = useState<Voice[]>(ALL_CATALOG_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(DEFAULT_VOICES[0]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [text, setText] = useState<string>(
    "Welcome to VoxCraft AI. [softly] In the silence between words, stories take flight. What will you create today?"
  );
  const [modelId, setModelId] = useState<string>("kokoro_82m");
  const [settings, setSettings] = useState<GenerationSettings>({
    speed: 1.0,
    stability: 0.5,
    similarity: 0.75,
    styleExaggeration: 0.15,
    pitch: 0.0,
    emotionInstruction: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const characterCount = text.length;
  const maxCharacters = 5000;

  // Hydrate providers & live voices on mount
  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.providers)) {
          setProviders(data.providers);
        }
      })
      .catch(() => {});

    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
          setAllVoices(data.voices);
        }
      })
      .catch(() => {});
  }, []);

  // Read URL search param for voice selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const voiceParam = params.get("voice");
      if (voiceParam) {
        const found = allVoices.find((v) => v.id === voiceParam || v.providerVoiceId === voiceParam);
        if (found) {
          setSelectedVoice(found);
          if (found.providerId) setSelectedProviderId(found.providerId);
        }
      }
    }
  }, [allVoices]);

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

  // Provider definitions with iconography and details
  const providerTabs: { id: ProviderId; name: string; badge: string; icon: any }[] = [
    { id: "kokoro", name: "Kokoro 82M", badge: "Local · 24kHz", icon: Cpu },
    { id: "edge", name: "Cloud Multilingual", badge: "Zero-Key · Global", icon: Globe },
    { id: "google", name: "Google Gemini & TTS", badge: "Flash & Neural2", icon: Server },
    { id: "elevenlabs", name: "ElevenLabs AI", badge: "Studio Pro", icon: Sparkles },
  ];

  // Active provider voice filter
  const providerVoices = allVoices.filter((v) => {
    if (selectedProviderId === "edge" || selectedProviderId === "edge_tts") {
      return v.providerId === "edge" || v.providerId === "edge_tts";
    }
    if (selectedProviderId === "google" || selectedProviderId === "google_cloud" || selectedProviderId === "gemini") {
      return v.providerId === "google" || v.providerId === "google_cloud" || v.providerId === "gemini";
    }
    return v.providerId === selectedProviderId;
  });

  // Quick switch voices (first 6 voices of current provider)
  const quickVoices = providerVoices.slice(0, 7);

  // Available models for active provider
  const getModelsForProvider = (pId: ProviderId) => {
    switch (pId) {
      case "kokoro":
        return [
          { id: "kokoro_82m", name: "Kokoro-82M v1.0 (Local 24kHz Vocoder)" },
          { id: "kokoro_fast", name: "Kokoro Fast Infer (Sub-250ms Latency)" },
        ];
      case "edge":
      case "edge_tts":
        return [
          { id: "edge-neural", name: "Cloud Neural Multilingual (Zero-Key Engine)" },
          { id: "edge-multilingual", name: "Edge HD Global Speech (50+ Languages)" },
        ];
      case "google":
      case "google_cloud":
      case "gemini":
        return [
          { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash Audio (Multimodal Native)" },
          { id: "google-journey", name: "Google Cloud Journey (Ultra-Realistic Conversational)" },
          { id: "google-neural2", name: "Google Cloud Neural2 (Studio Broadcast)" },
        ];
      case "elevenlabs":
        return [
          { id: "eleven_turbo_v2_5", name: "Eleven Turbo v2.5 (Low Latency 32+ Languages)" },
          { id: "eleven_multilingual_v2", name: "Eleven Multilingual v2 (Rich Expressive Prosody)" },
        ];
      default:
        return [{ id: "default", name: "Standard Neural Engine" }];
    }
  };

  const handleSelectProvider = (provId: ProviderId) => {
    setSelectedProviderId(provId);
    setGenerationError(null);
    const voicesForProv = allVoices.filter((v) => v.providerId === provId);
    if (voicesForProv.length > 0) {
      setSelectedVoice(voicesForProv[0]);
    }
    const defaultModel = getModelsForProvider(provId)[0]?.id || "default";
    setModelId(defaultModel);
  };

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    if (voice.providerId && voice.providerId !== selectedProviderId) {
      setSelectedProviderId(voice.providerId);
      const defaultModel = getModelsForProvider(voice.providerId)[0]?.id || "default";
      setModelId(defaultModel);
    }
  };

  const emotionTags = [
    { label: "Softly", tag: "[softly] " },
    { label: "Whispers", tag: "[whispers] " },
    { label: "Laughs", tag: "[laughs] " },
    { label: "Excited", tag: "[excited] " },
    { label: "Pensive", tag: "[pensive] " },
    { label: "Dramatic Pause", tag: " ... " },
  ];

  const insertTag = (tag: string) => {
    setText((prev) => prev + tag);
  };

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          providerId: selectedVoice.providerId || selectedProviderId,
          settings,
          modelId,
        }),
      });

      const res = await response.json();

      if (res.success && res.data?.audioUrl) {
        const item: GenerationHistoryItem = {
          id: res.data.generationId || `gen-${Date.now()}`,
          text,
          voice: selectedVoice,
          providerId: selectedVoice.providerId || selectedProviderId,
          providerName:
            selectedVoice.providerId === "kokoro"
              ? "Kokoro 82M"
              : selectedVoice.providerId === "google" || selectedVoice.providerId === "google_cloud" || selectedVoice.providerId === "gemini"
              ? "Google Cloud & Gemini"
              : selectedVoice.providerId === "elevenlabs"
              ? "ElevenLabs"
              : "Cloud Multilingual",
          modelId: res.data.modelUsed || modelId,
          settings: { ...settings },
          audioUrl: res.data.audioUrl,
          audioFormat: res.data.audioFormat || "mp3",
          durationSeconds: res.data.durationSeconds || 3.5,
          characterCount: text.length,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setCurrentAudioUrl(res.data.audioUrl);
        setCurrentDuration(res.data.durationSeconds || 3.5);
        setHistory((prev) => [item, ...prev]);
      } else {
        setGenerationError(res.error || "Generation request failed. Check provider credentials.");
      }
    } catch (err: any) {
      console.error("Speech synthesis failed:", err);
      setGenerationError(err.message || "Network error occurred during speech synthesis.");
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

  const activeProviderMeta = providers.find((p) => p.id === selectedProviderId);
  const supportedSettings = selectedVoice.supportedSettings || ["speed", "stability"];

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
                Multi-Provider AI
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
              Produce human-quality speech using Kokoro-82M, Cloud Multilingual, Google Gemini, and ElevenLabs.
            </p>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Model:</span>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {getModelsForProvider(selectedProviderId).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Provider Switching Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap mr-1">
            Provider:
          </span>
          {providerTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedProviderId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectProvider(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Unconfigured Provider Notice */}
        {activeProviderMeta && activeProviderMeta.requiresApiKey && !activeProviderMeta.isConfigured && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-300">
              <Key className="w-4 h-4 shrink-0" />
              <span>
                <strong>{activeProviderMeta.name}</strong> requires an API key. Add{" "}
                <code className="px-1 py-0.5 rounded bg-background text-[11px] font-mono text-foreground">
                  {activeProviderMeta.apiKeyEnvVar}
                </code>{" "}
                to your <code className="px-1 py-0.5 rounded bg-background text-[11px] font-mono text-foreground">.env.local</code> file to enable cloud synthesis.
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0 border-amber-500/40 text-amber-300">
              Cloud Setup
            </Badge>
          </div>
        )}

        {/* Generation Error Alert */}
        {generationError && (
          <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generationError}</span>
          </div>
        )}

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-heading font-semibold tracking-tight">{selectedVoice.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono capitalize">
                          {selectedVoice.category}
                        </Badge>
                        <Badge variant="steel" className="text-[10px]">
                          {selectedVoice.providerId === "kokoro"
                            ? "Kokoro 82M"
                            : selectedVoice.providerId === "edge" || selectedVoice.providerId === "edge_tts"
                            ? "Cloud Multi"
                            : selectedVoice.providerId === "google" || selectedVoice.providerId === "google_cloud" || selectedVoice.providerId === "gemini"
                            ? "Google TTS"
                            : "ElevenLabs"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground tracking-snug mt-0.5">
                        {selectedVoice.languageName || selectedVoice.accent} · {selectedVoice.gender} · {selectedVoice.isPremium ? "Studio Pro" : "Free Access"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct Voice Dropdown for Selected Provider */}
                    <select
                      value={selectedVoice.id}
                      onChange={(e) => {
                        const voice = allVoices.find((v) => v.id === e.target.value);
                        if (voice) handleSelectVoice(voice);
                      }}
                      className="h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[200px] truncate"
                    >
                      {providerVoices.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.gender.charAt(0).toUpperCase()})
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="gap-1.5 text-xs h-8 shrink-0"
                    >
                      <span>All {allVoices.length} Voices</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Quick Switch Pills for Current Provider */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium mr-1">
                    Quick Pick:
                  </span>
                  {quickVoices.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVoice(v)}
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
                    <span>
                      {selectedProviderId === "kokoro"
                        ? "Local Vocoder (24kHz)"
                        : selectedProviderId === "edge" || selectedProviderId === "edge_tts"
                        ? "Zero-Key Global"
                        : "Neural Cloud Synthesis"}
                    </span>
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
                  <h3 className="font-heading font-semibold text-sm tracking-tight">
                    Voice Prosody & Synthesis Settings ({selectedVoice.name})
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        speed: 1.0,
                        stability: 0.5,
                        similarity: 0.75,
                        styleExaggeration: 0.15,
                        pitch: 0.0,
                        emotionInstruction: "",
                      })
                    }
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speed (Universal) */}
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

                  {/* Pitch (Google Cloud / Edge) */}
                  {supportedSettings.includes("pitch") && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Pitch Modulation</span>
                        <span className="font-mono text-muted-foreground">
                          {settings.pitch && settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch || 0} st
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-10.0"
                        max="10.0"
                        step="1.0"
                        value={settings.pitch ?? 0}
                        onChange={(e) =>
                          setSettings({ ...settings, pitch: parseFloat(e.target.value) })
                        }
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>-10st Deep</span>
                        <span>0st Natural</span>
                        <span>+10st High</span>
                      </div>
                    </div>
                  )}

                  {/* Vocal Stability (Kokoro & ElevenLabs) */}
                  {supportedSettings.includes("stability") && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Stability (Consistency)</span>
                        <span className="font-mono text-muted-foreground">
                          {Math.round((settings.stability ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={settings.stability ?? 0.5}
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
                  )}

                  {/* Clarity / Similarity (ElevenLabs) */}
                  {supportedSettings.includes("similarity") && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Similarity Boost</span>
                        <span className="font-mono text-muted-foreground">
                          {Math.round((settings.similarity ?? 0.75) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={settings.similarity ?? 0.75}
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
                  )}

                  {/* Style Exaggeration (ElevenLabs) */}
                  {supportedSettings.includes("style") && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Style Exaggeration</span>
                        <span className="font-mono text-muted-foreground">
                          {Math.round((settings.styleExaggeration ?? 0.15) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={settings.styleExaggeration ?? 0.15}
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
                  )}

                  {/* Emotion / Direction Instruction (Gemini Multimodal) */}
                  {supportedSettings.includes("emotion") && (
                    <div className="space-y-1.5 md:col-span-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Gemini Stylistic Direction</span>
                        <span className="text-[10px] text-muted-foreground">e.g. &quot;Speak with mystery and curiosity&quot;</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Describe vocal tone, tempo, or dramatic persona..."
                        value={settings.emotionInstruction ?? ""}
                        onChange={(e) =>
                          setSettings({ ...settings, emotionInstruction: e.target.value })
                        }
                        className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  )}
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
                        {selectedVoice.name} · {selectedVoice.providerId === "kokoro" ? "24kHz Lossless Audio" : "High-Fidelity Neural Audio"}
                      </CardDescription>
                    </div>
                    <a
                      href={currentAudioUrl}
                      download={`voxcraft-${selectedVoice.id}-${Date.now()}.mp3`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Audio</span>
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
                        <span className="flex items-center gap-1.5">
                          <span>{item.durationSeconds}s</span>
                          <span>·</span>
                          <span className="capitalize">{item.providerId}</span>
                        </span>
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
                            download={`${item.voice.name}-${item.id}.mp3`}
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
            handleSelectVoice(voice);
            setIsVoiceModalOpen(false);
          }}
        />
      </PageContainer>
    </div>
  );
}
