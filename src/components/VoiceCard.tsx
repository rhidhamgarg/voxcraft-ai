"use client";

import { Voice } from "@/types";
import { Play, Pause, Sparkles, Check, Mic2 } from "lucide-react";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  onSelect?: (voice: Voice) => void;
}

export default function VoiceCard({ voice, isSelected, onSelect }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = `/api/tts/stream`;
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2500);
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
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
              {voice.name.charAt(0)}
            </div>
            {voice.isCloned && (
              <span
                className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-[9px] text-white"
                title="Custom Cloned Voice"
              >
                <Mic2 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-sm tracking-tight">{voice.name}</h3>
              {voice.isPremium && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-amber-500 border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Pro
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize tracking-snug mt-0.5">
              {voice.accent} · {voice.gender}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSample}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
          title="Listen to Voice Preview"
        >
          {isPlaying ? (
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
