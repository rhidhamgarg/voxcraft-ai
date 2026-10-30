"use client";

import { useState, useEffect } from "react";
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
  AlertTriangle,
  Coins,
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

export default function StudioPage() {
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
  const [quotaError, setQuotaError] = useState<{ available: number; required: number } | null>(null);

  const characterCount = text.length;
  const maxCharacters = 5000;

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
  }, []);

  const emotionTags = [
    { label: "Softly", tag: "[softly] " },
    { label: "Whispers", tag: "[whispers] " },
    { label: "Laughs", tag: "[laughs] " },
    { label: "Sarcastically", tag: "[sarcastically] " },
    { label: "Excitedly", tag: "[excitedly] " },
    { label: "Dramatically", tag: "[dramatically] " },
  ];

  const insertTag = (tag: string) => {
    setText((prev) => prev + " " + tag);
  };

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;
    setIsGenerating(true);
    setQuotaError(null);

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

      if (response.status === 402) {
        setQuotaError({
          available: res.error?.details?.available || 0,
          required: res.error?.details?.required || text.length,
        });
        return;
      }

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

        // Deduct credits via API
        fetch("/api/user/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deduct", amount: text.length }),
        }).catch(() => {});
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

  return (
    <PageContainer>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tighter flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Text to Speech Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
            Convert natural language into human-grade spoken audio with contextual emotion control.
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

      {/* Quota Depletion Alert */}
      {quotaError && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive">
                  Insufficient generation credits (Need: {quotaError.required}, Available: {quotaError.available})
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Upgrade your subscription to keep synthesizing speech without interruption.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="destructive">
              <Link href="/pricing">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Voice Card */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                  {selectedVoice.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-heading font-semibold tracking-tight">{selectedVoice.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {selectedVoice.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground tracking-snug mt-0.5">
                    {selectedVoice.accent} · {selectedVoice.gender}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVoiceModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <span>Change Voice</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
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
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAdvanced ? "Hide Advanced" : "Voice Settings"}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !text.trim()}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesising...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Speech</span>
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Advanced Sliders Drawer */}
          {showAdvanced && (
            <Card className="animate-in fade-in-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Acoustic & Style Parameters</CardTitle>
                <CardDescription className="text-xs">
                  Fine-tune latent diffusion stability, speaker similarity, and style exaggeration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Speed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Pacing Speed</span>
                      <span className="font-mono font-medium">{settings.speed}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.05}
                      value={settings.speed}
                      onChange={(e) =>
                        setSettings({ ...settings, speed: parseFloat(e.target.value) })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Stability */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Vocal Stability</span>
                      <span className="font-mono font-medium">{settings.stability}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.stability}
                      onChange={(e) =>
                        setSettings({ ...settings, stability: parseFloat(e.target.value) })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Similarity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Speaker Similarity</span>
                      <span className="font-mono font-medium">{settings.similarity}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.similarity}
                      onChange={(e) =>
                        setSettings({ ...settings, similarity: parseFloat(e.target.value) })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Style Exaggeration */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Style Exaggeration</span>
                      <span className="font-mono font-medium">{settings.styleExaggeration}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.styleExaggeration}
                      onChange={(e) =>
                        setSettings({ ...settings, styleExaggeration: parseFloat(e.target.value) })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Player Card */}
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
                  <Badge variant="outline" className="font-mono text-[10px]">
                    24kHz WAV
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AudioWaveformPlayer
                  audioUrl={currentAudioUrl}
                  title={`${selectedVoice.name} — Generated Speech`}
                  duration={currentDuration}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Studio History</CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {history.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-2.5 max-h-[600px] p-4 pt-0">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No speech generated yet.</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1">
                    Your generated takes will appear here.
                  </p>
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
                        ? "bg-muted border-primary/50 shadow-xs"
                        : "hover:bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-heading font-semibold tracking-tight">{item.voice.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.createdAt}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed tracking-normal mb-2">
                      {item.text}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span>{item.durationSeconds}s</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPrompt(item);
                          }}
                          className="hover:text-foreground transition-colors p-1"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.audioUrl}
                          download={`${item.voice.name}-${item.id}.mp3`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-foreground transition-colors p-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="hover:text-destructive transition-colors p-1"
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
  );
}
