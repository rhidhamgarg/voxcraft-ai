"use client";

import { Voice } from "@/types";
import { Play, Pause, Check, Mic2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

// Global audio coordinator ensuring only one preview plays at any time
class PreviewPlayer {
  private static audio: HTMLAudioElement | null = null;
  private static activeVoiceId: string | null = null;
  private static isLoading: boolean = false;
  private static listeners: Set<(voiceId: string | null, loading: boolean) => void> = new Set();

  public static subscribe(listener: (voiceId: string | null, loading: boolean) => void) {
    this.listeners.add(listener);
    // Notify newly subscribed card of current state
    listener(this.activeVoiceId, this.isLoading);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach((fn) => fn(this.activeVoiceId, this.isLoading));
  }

  public static toggle(voice: Voice) {
    if (typeof window === "undefined") return;

    // If this exact voice is already playing, pause it
    if (this.activeVoiceId === voice.id) {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio = null;
      }
      this.activeVoiceId = null;
      this.isLoading = false;
      this.notify();
      return;
    }

    // Stop any previously playing audio immediately
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }

    this.activeVoiceId = voice.id;
    this.isLoading = true;
    this.notify();

    const audio = new Audio();
    // Cache-bust with dynamic timestamp and version to guarantee fresh distinct audio
    const baseEndpoint =
      voice.previewUrl ||
      `/api/tts/preview?provider=${voice.providerId || "kokoro"}&voice=${encodeURIComponent(
        voice.providerVoiceId || voice.id
      )}`;
    const separator = baseEndpoint.includes("?") ? "&" : "?";
    audio.src = `${baseEndpoint}${separator}t=${Date.now()}`;

    audio.oncanplay = () => {
      if (this.activeVoiceId === voice.id) {
        this.isLoading = false;
        this.notify();
      }
    };

    audio.onplay = () => {
      if (this.activeVoiceId === voice.id) {
        this.isLoading = false;
        this.notify();
      }
    };

    audio.onended = () => {
      if (this.activeVoiceId === voice.id) {
        this.activeVoiceId = null;
        this.isLoading = false;
        this.audio = null;
        this.notify();
      }
    };

    audio.onerror = () => {
      if (this.activeVoiceId === voice.id) {
        this.activeVoiceId = null;
        this.isLoading = false;
        this.audio = null;
        this.notify();
      }
    };

    this.audio = audio;
    audio.play().catch(() => {
      if (this.activeVoiceId === voice.id) {
        this.activeVoiceId = null;
        this.isLoading = false;
        this.audio = null;
        this.notify();
      }
    });
  }

  public static stopIfActive(voiceId: string) {
    if (this.activeVoiceId === voiceId && this.audio) {
      this.audio.pause();
      this.audio = null;
      this.activeVoiceId = null;
      this.isLoading = false;
      this.notify();
    }
  }
}

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  onSelect?: (voice: Voice) => void;
}

export default function VoiceCard({ voice, isSelected, onSelect }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    const unsubscribe = PreviewPlayer.subscribe((activeId, loading) => {
      const isThisActive = activeId === voice.id;
      setIsPlaying(isThisActive && !loading);
      setIsLoadingAudio(isThisActive && loading);
    });

    return () => {
      unsubscribe();
    };
  }, [voice.id]);

  const getProviderBadge = (providerId?: string) => {
    switch (providerId) {
      case "kokoro":
        return <Badge variant="steel" className="text-[10px] px-1.5 py-0 font-mono">Kokoro 82M</Badge>;
      case "gemini":
        return <Badge variant="ivory" className="text-[10px] px-1.5 py-0 font-mono">Gemini 2.0</Badge>;
      case "google_cloud":
        return <Badge variant="subtle" className="text-[10px] px-1.5 py-0 font-mono">Google Cloud</Badge>;
      case "elevenlabs":
        return <Badge variant="steel" className="text-[10px] px-1.5 py-0 font-mono">ElevenLabs</Badge>;
      case "edge_tts":
        return <Badge variant="subtle" className="text-[10px] px-1.5 py-0 font-mono">Cloud Multi</Badge>;
      default:
        return <Badge variant="subtle" className="text-[10px] px-1.5 py-0 font-mono">Neural</Badge>;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    PreviewPlayer.toggle(voice);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(voice)}
      className={`p-4 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? "border-primary bg-primary/5 shadow-xs"
          : "border-border bg-card text-card-foreground hover:border-foreground/30 hover:bg-muted/40 shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {voice.name.charAt(0)}
            </div>
            {voice.isCloned && (
              <span
                className="absolute -bottom-1 -right-1 p-0.5 bg-steelblue rounded-full text-[9px] text-offwhite"
                title="Custom Cloned Voice"
              >
                <Mic2 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-heading font-semibold text-sm tracking-tight">{voice.name}</h3>
              {getProviderBadge(voice.providerId)}
              {voice.voiceType === "child" && (
                <Badge variant="subtle" className="text-[9px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border-amber-500/30">
                  Child-like
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize tracking-snug mt-0.5 flex items-center gap-1 flex-wrap">
              {voice.flagEmoji && <span>{voice.flagEmoji}</span>}
              <span>{voice.countryName || voice.accent}</span>
              <span>·</span>
              <span>{voice.languageName || voice.languageCode || "en-US"}</span>
              <span>·</span>
              <span className={voice.voiceType === "child" ? "text-amber-400 font-medium" : ""}>
                {voice.voiceType === "child" ? "Child / Youth" : voice.gender}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoadingAudio}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isPlaying
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
          title={`Listen to ${voice.name} voice preview`}
        >
          {isLoadingAudio ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed tracking-normal">
        {voice.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex flex-wrap gap-1">
          {voice.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {isSelected && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
            <Check className="w-3.5 h-3.5" /> Selected
          </span>
        )}
      </div>
    </div>
  );
}
