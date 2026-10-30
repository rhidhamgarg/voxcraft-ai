"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface AudioWaveformPlayerProps {
  audioUrl: string;
  voiceName?: string;
  durationSeconds?: number;
  onDownload?: () => void;
}

export default function AudioWaveformPlayer({
  audioUrl,
  voiceName = "Generated Speech",
  durationSeconds = 0,
}: AudioWaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.8];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full glass-panel p-4 rounded-2xl border border-surface-700/80 shadow-xl">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"></div>
          <span className="text-sm font-semibold text-white tracking-tight">{voiceName}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded text-[11px] font-mono bg-surface-800 text-surface-300 hover:text-white transition-colors border border-surface-700"
            title="Adjust Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded text-surface-400 hover:text-white transition-colors hover:bg-surface-800"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download Button */}
          <a
            href={audioUrl}
            download={`voxcraft-${Date.now()}.wav`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/40 hover:bg-brand-500/30 transition-all"
            title="Download Audio File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Visual Audio Waveform Simulation Bar */}
      <div className="h-10 flex items-center justify-between gap-1 mb-3 px-1">
        {Array.from({ length: 48 }).map((_, idx) => {
          const isActive = (idx / 48) * 100 <= progressPercent;
          // pseudo-random sound bar heights
          const heightFactor = Math.abs(Math.sin((idx + 1) * 0.45) * 0.7 + Math.cos(idx * 0.8) * 0.3);
          const barHeight = Math.max(15, Math.floor(heightFactor * 100));

          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isActive
                  ? "bg-brand-400 shadow-sm shadow-brand-400/50"
                  : "bg-surface-700/60"
              } ${isPlaying ? "animate-sound-wave" : ""}`}
              style={{
                height: `${barHeight}%`,
                animationDelay: `${(idx % 6) * 0.15}s`,
              }}
            />
          );
        })}
      </div>

      {/* Scrubber & Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={restart}
          className="p-2 text-surface-400 hover:text-white transition-colors"
          title="Restart audio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Time Slider */}
        <div className="flex-1 flex items-center gap-2.5">
          <span className="text-xs font-mono text-surface-400 w-9 text-right">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
          <span className="text-xs font-mono text-surface-400 w-9">
            {formatDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
