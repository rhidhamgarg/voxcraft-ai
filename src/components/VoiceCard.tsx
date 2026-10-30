"use client";

import { Voice } from "@/types";
import { Play, Pause, Sparkles, Check, Mic2 } from "lucide-react";
import { useState, useRef } from "react";

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
      // Create synthesis preview audio on-the-fly if previewUrl is empty
      const audio = new Audio();
      audio.src = `/api/tts/stream`;
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play local simulated or preview audio
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2500);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(voice)}
      className={`glass-panel p-4 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
          : "border-surface-800 hover:border-surface-700 hover:bg-surface-800/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {voice.name.charAt(0)}
            </div>
            {voice.isCloned && (
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-[9px] text-white" title="Custom Cloned Voice">
                <Mic2 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">{voice.name}</h3>
              {voice.isPremium && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Pro
                </span>
              )}
            </div>
            <p className="text-xs text-surface-400 capitalize">{voice.accent} · {voice.gender}</p>
          </div>
        </div>

        <button
          onClick={toggleSample}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
              : "bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700"
          }`}
          title="Listen to Voice Preview"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
      </div>

      <p className="text-xs text-surface-300 line-clamp-2 mb-3 leading-relaxed">
        {voice.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-surface-800/60">
        <div className="flex flex-wrap gap-1">
          {voice.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] bg-surface-800 text-surface-400 border border-surface-700/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {isSelected && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-brand-400">
            <Check className="w-3.5 h-3.5" /> Active
          </span>
        )}
      </div>
    </div>
  );
}
