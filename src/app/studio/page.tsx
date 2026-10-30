"use client";

import { useState, useEffect } from "react";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { Voice, GenerationSettings, GenerationHistoryItem } from "@/types";
import { Sparkles, Sliders, Play, Loader2, Wand2, History, RotateCcw, Copy, Check, ChevronDown, Download, AlertTriangle, Coins, Trash2 } from "lucide-react";
import VoiceSelectorModal from "@/components/VoiceSelectorModal";
import AudioWaveformPlayer from "@/components/AudioWaveformPlayer";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>Text to Speech Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-surface-400">
            Convert natural language into human-grade spoken audio with contextual emotion control.
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-surface-400">Engine:</span>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="px-3 py-1.5 bg-surface-900 border border-surface-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
          >
            <option value="vox_v4_ultra">Vox-4 Ultra (Contextual Emotion)</option>
            <option value="vox_v3_multilingual">Vox-3 Multilingual (32+ Languages)</option>
            <option value="vox_turbo_v2">Turbo Realtime (Sub-250ms Latency)</option>
          </select>
        </div>
      </div>

      {/* Quota Depletion Alert Modal */}
      {quotaError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-rose-200">
                Insufficient generation credits (Need: {quotaError.required}, Available: {quotaError.available})
              </p>
              <p className="text-[11px] text-surface-400">
                Upgrade your subscription to keep synthesizing speech without interruption.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors shrink-0"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Section (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Voice Bar */}
          <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-surface-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {selectedVoice.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{selectedVoice.name}</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-800 text-surface-400 border border-surface-700">
                    {selectedVoice.category}
                  </span>
                </div>
                <p className="text-xs text-surface-400">{selectedVoice.accent} · {selectedVoice.gender}</p>
              </div>
            </div>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-800 text-surface-200 border border-surface-700 hover:text-white hover:border-brand-500 transition-all flex items-center gap-1.5"
            >
              <span>Change Voice</span>
              <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
            </button>
          </div>

          {/* Script Textarea Card */}
          <div className="glass-panel rounded-2xl border border-surface-700/80 overflow-hidden shadow-xl">
            {/* Emotion Chips Bar */}
            <div className="p-3 border-b border-surface-800 bg-surface-950/40 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] text-surface-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-brand-400" /> Emotion Tags:
              </span>
              {emotionTags.map((et) => (
                <button
                  key={et.label}
                  onClick={() => insertTag(et.tag)}
                  className="px-2 py-0.5 rounded-md bg-surface-900 border border-surface-800 text-surface-400 hover:text-brand-300 hover:border-brand-500/40 text-[11px] font-mono whitespace-nowrap transition-colors"
                >
                  {et.tag.trim()}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your script here. Use inline markup like [whispers] or [laughs] to guide vocal emotion..."
                rows={7}
                className="w-full bg-transparent text-white text-sm sm:text-base leading-relaxed placeholder-surface-500 focus:outline-none resize-none font-sans"
              />
            </div>

            {/* Footer Toolbar */}
            <div className="px-4 py-3 border-t border-surface-800 bg-surface-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-surface-400 font-mono">
                <span>{characterCount} / {maxCharacters} chars</span>
                <span>·</span>
                <span>~{Math.max(1, Math.round(characterCount / 18))}s audio</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    showAdvanced
                      ? "bg-brand-500/10 text-brand-300 border-brand-500/40"
                      : "bg-surface-900 text-surface-400 border-surface-700 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Voice Settings</span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || characterCount === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-brand hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/25 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Generate Speech</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Voice Tuning Sliders Drawer */}
          {showAdvanced && (
            <div className="glass-panel p-5 rounded-2xl border border-surface-700/80 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-400" />
                <span>Neural Voice Tuning Parameters</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Stability */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-surface-300 font-medium">
                    <span>Stability</span>
                    <span className="font-mono text-brand-400">{(settings.stability * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.stability}
                    onChange={(e) => setSettings({ ...settings, stability: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <p className="text-[10px] text-surface-500">Lower = more expressive and dramatic. Higher = monotone and steady.</p>
                </div>

                {/* Similarity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-surface-300 font-medium">
                    <span>Clarity & Similarity Boost</span>
                    <span className="font-mono text-brand-400">{(settings.similarity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.similarity}
                    onChange={(e) => setSettings({ ...settings, similarity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <p className="text-[10px] text-surface-500">Adherence to original voice reference timbre.</p>
                </div>

                {/* Style Exaggeration */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-surface-300 font-medium">
                    <span>Style Exaggeration</span>
                    <span className="font-mono text-brand-400">{(settings.styleExaggeration * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.styleExaggeration}
                    onChange={(e) => setSettings({ ...settings, styleExaggeration: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <p className="text-[10px] text-surface-500">Amplifies style nuances of the voice speaker.</p>
                </div>

                {/* Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-surface-300 font-medium">
                    <span>Speed Factor</span>
                    <span className="font-mono text-brand-400">{settings.speed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={settings.speed}
                    onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <p className="text-[10px] text-surface-500">Pacing of spoken delivery.</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Audio Waveform Player */}
          {currentAudioUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400">Latest Rendered Audio</h3>
              <AudioWaveformPlayer
                audioUrl={currentAudioUrl}
                voiceName={selectedVoice.name}
                durationSeconds={currentDuration}
              />
            </div>
          )}
        </div>

        {/* Generation History Sidebar (1 col) */}
        <div className="glass-panel p-4 rounded-2xl border border-surface-700/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-surface-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Generations</h3>
            </div>
            <span className="text-[11px] font-mono text-surface-400">{history.length} items</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentAudioUrl(item.audioUrl);
                  setCurrentDuration(item.durationSeconds);
                  setSelectedVoice(item.voice);
                }}
                className="p-3 rounded-xl bg-surface-900/60 border border-surface-800/80 hover:border-brand-500/50 hover:bg-surface-800/40 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{item.voice.name}</span>
                  <span className="text-[10px] font-mono text-surface-400">{item.createdAt}</span>
                </div>

                <p className="text-xs text-surface-300 line-clamp-2 italic">
                  "{item.text}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-surface-400">
                    {item.characterCount} chars · {item.durationSeconds.toFixed(1)}s
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPrompt(item);
                      }}
                      className="p-1 rounded text-surface-400 hover:text-white transition-colors"
                      title="Copy script"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setText(item.text);
                        setSelectedVoice(item.voice);
                        setCurrentAudioUrl(item.audioUrl);
                        setCurrentDuration(item.durationSeconds);
                      }}
                      className="p-1 rounded text-surface-400 hover:text-brand-300 transition-colors"
                      title="Load into editor"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="p-1 rounded text-surface-400 hover:text-rose-400 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="py-12 text-center text-surface-400">
                <Sparkles className="w-8 h-8 text-surface-700 mx-auto mb-2" />
                <p className="text-xs">No generations yet.</p>
                <p className="text-[11px] text-surface-500 mt-1">Rendered audio will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Selector Modal */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoice={selectedVoice}
        onSelectVoice={(v) => setSelectedVoice(v)}
      />
    </div>
  );
}
