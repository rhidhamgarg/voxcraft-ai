"use client";

import { Voice } from "@/types";
import { Play, Pause, Check, Mic2, Loader2, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  onSelect?: (voice: Voice) => void;
}

export default function VoiceCard({ voice, isSelected, onSelect }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  const toggleSample = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      setIsLoadingAudio(true);
      const audio = new Audio();
      const previewEndpoint =
        voice.previewUrl ||
        `/api/tts/preview?provider=${voice.providerId || "kokoro"}&voice=${encodeURIComponent(
          voice.providerVoiceId || voice.id
        )}`;
      audio.src = previewEndpoint;

      audio.oncanplaythrough = () => {
        setIsLoadingAudio(false);
      };

      audio.onplay = () => {
        setIsLoadingAudio(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsPlaying(false);
      };

      audioRef.current = audio;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
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
            </div>
            <p className="text-xs text-muted-foreground capitalize tracking-snug mt-0.5 flex items-center gap-1">
              <span>{voice.languageCode || "en-US"}</span>
              <span>·</span>
              <span>{voice.accent}</span>
              <span>·</span>
              <span>{voice.gender}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSample}
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
