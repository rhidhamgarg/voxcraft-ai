"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AudioWaveformPlayerProps {
  audioUrl: string;
  voiceName?: string;
  title?: string;
  duration?: number;
  durationSeconds?: number;
  onDownload?: () => void;
}

export default function AudioWaveformPlayer({
  audioUrl,
  voiceName,
  title,
  duration: durationProp,
  durationSeconds,
}: AudioWaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const initialDuration = durationProp || durationSeconds || 0;
  const [duration, setDuration] = useState(initialDuration);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const displayTitle = title || voiceName || "Generated Speech";

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
    <div className="w-full p-4 rounded-xl border border-border bg-card text-card-foreground shadow-xs">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-steelblue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-steelblue"></span>
          </span>
          <span className="text-sm font-heading font-semibold tracking-tight">{displayTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            title="Adjust Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-destructive" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download Button */}
          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5">
            <a href={audioUrl} download={`voxcraft-${Date.now()}.wav`}>
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Visual Audio Waveform Simulation Bar */}
      <div className="h-10 flex items-center justify-between gap-1 mb-3 px-1">
        {Array.from({ length: 48 }).map((_, idx) => {
          const isActive = (idx / 48) * 100 <= progressPercent;
          const heightFactor = Math.abs(Math.sin((idx + 1) * 0.45) * 0.7 + Math.cos(idx * 0.8) * 0.3);
          const barHeight = Math.max(15, Math.floor(heightFactor * 100));

          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isActive
                  ? "bg-primary shadow-xs"
                  : "bg-muted"
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
          type="button"
          onClick={restart}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Restart audio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <Button
          type="button"
          size="icon"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full shadow-xs cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </Button>

        {/* Time Slider */}
        <div className="flex-1 flex items-center gap-2.5">
          <span className="text-xs font-mono text-muted-foreground w-9 text-right">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs font-mono text-muted-foreground w-9">
            {formatDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
