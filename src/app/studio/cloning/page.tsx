"use client";

import { useState, useRef } from "react";
import { Mic2, Upload, Sparkles, Check, Loader2 } from "lucide-react";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

export default function VoiceCloningPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cloneType, setCloneType] = useState<"ivc" | "pvc">("ivc");
  const [voiceName, setVoiceName] = useState("");
  const [category, setCategory] = useState("conversational");
  const [gender, setGender] = useState<"male" | "female" | "non-binary">("female");
  const [accent, setAccent] = useState("American");
  const [description, setDescription] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP Entrance Animations
  useGsapContext(
    () => {
      const tl = gsap.timeline({ defaults: { ease: MOTION.ease.smooth } });
      tl.fromTo(
        ".gsap-clone-header",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45 }
      )
        .fromTo(
          ".gsap-clone-types",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          "-=0.2"
        )
        .fromTo(
          ".gsap-clone-form",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.2"
        );
    },
    containerRef,
    []
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required to record reference samples.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceName.trim() || !hasConsent) return;

    setIsCloning(true);
    setSuccessMessage(null);

    try {
      // Simulate cloning processing latency
      await new Promise((resolve) => setTimeout(resolve, 2400));
      setSuccessMessage(
        `Voice "${voiceName}" has been successfully cloned and added to your private custom voice roster.`
      );
      setVoiceName("");
      setDescription("");
      setAudioBlob(null);
      setHasConsent(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div ref={containerRef}>
      <PageContainer>
        {/* Header */}
        <div className="gsap-clone-header space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tighter flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-primary" />
            <span>Instant & Professional Voice Cloning</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
            Clone real human voices with as little as 15 seconds of audio or fine-tune high-fidelity neural representations.
          </p>
        </div>

        {/* Clone Type Selector */}
        <div className="gsap-clone-types grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            onClick={() => setCloneType("ivc")}
            className={`cursor-pointer transition-all ${
              cloneType === "ivc"
                ? "border-primary bg-primary/5 shadow-xs"
                : "hover:border-foreground/30"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="font-mono text-xs">
                  Instant (IVC)
                </Badge>
                <Badge variant="steel" className="text-[10px]">
                  Available
                </Badge>
              </div>
              <CardTitle className="text-base font-heading font-semibold tracking-tight">Zero-Shot Latent Synthesis</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Requires 15 seconds to 2 minutes of clean reference audio. Instant extraction without retraining.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            onClick={() => setCloneType("pvc")}
            className={`cursor-pointer transition-all ${
              cloneType === "pvc"
                ? "border-primary bg-primary/5 shadow-xs"
                : "hover:border-foreground/30"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="font-mono text-xs text-warmgrey border-warmgrey/30">
                  Professional (PVC)
                </Badge>
                <Badge variant="steel" className="text-[10px]">
                  Free
                </Badge>
              </div>
              <CardTitle className="text-base font-heading font-semibold tracking-tight">Fine-Tuned Foundation Model</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Requires 30+ minutes of studio-grade WAV samples. Dedicated GPU fine-tuning for ultra-expressive delivery.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Cloning Form */}
        <form onSubmit={handleSubmit} className="gsap-clone-form">
          <Card className="space-y-6 p-6">
            {/* Audio Reference Dropzone */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                1. Reference Audio Sample (Minimum 15s)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Record directly */}
                <div className="p-5 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? "bg-destructive text-destructive-foreground animate-pulse shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Mic2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">
                      {isRecording ? `Recording... (${recordTime}s)` : "Record Microphone"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Speak clearly at normal cadence.
                    </p>
                  </div>
                  {isRecording ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={stopRecording}
                    >
                      Stop Recording
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={startRecording}
                    >
                      Start Recording
                    </Button>
                  )}
                </div>

                {/* Upload file */}
                <div className="p-5 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3 bg-muted/20 relative">
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Upload Audio File</p>
                    <p className="text-[11px] text-muted-foreground">
                      WAV, MP3, or M4A up to 25MB
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                    Choose File
                  </Button>
                </div>
              </div>

              {audioBlob && (
                <div className="p-3 rounded-lg bg-steelblue/10 border border-steelblue/20 flex items-center gap-2 text-xs text-steelblue">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Reference sample ready: {audioBlob.size} bytes captured.</span>
                </div>
              )}
            </div>

            {/* Voice Metadata Fields */}
            <div className="space-y-4 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                2. Voice Identity & Metadata
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Voice Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g., Sarah Vance (Narrator)"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="conversational">Conversational</option>
                    <option value="narration">Narration & Audiobooks</option>
                    <option value="characters">Characters & Gaming</option>
                    <option value="social_media">Social Media & Creator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Accent</label>
                  <Input
                    type="text"
                    placeholder="e.g., American (Pacific Northwest)"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Description</label>
                <Textarea
                  placeholder="Describe vocal characteristics, recommended use cases, and pacing..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-0.5 rounded border-input text-primary focus:ring-ring cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  <span className="font-semibold text-foreground">Voice Ownership & Verification:</span> I confirm that I own all necessary rights to clone this voice, or have obtained explicit written consent from the voice talent in compliance with AI Watermarking & Ethics guidelines.
                </label>
              </div>
            </div>

            {successMessage && (
              <div className="p-3.5 rounded-lg bg-steelblue/10 border border-steelblue/20 text-xs text-steelblue flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!voiceName.trim() || !hasConsent || isCloning}
                className="gap-2"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesising Embeddings...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Custom Voice</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </PageContainer>
    </div>
  );
}
