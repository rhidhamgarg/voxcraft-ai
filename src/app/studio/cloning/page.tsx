"use client";

import { useState, useRef } from "react";
import { Mic2, Upload, Sparkles, Shield, Check, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function VoiceCloningPage() {
  const router = useRouter();
  const [cloneType, setCloneType] = useState<"ivc" | "pvc">("ivc");
  const [voiceName, setVoiceName] = useState("");
  const [category, setCategory] = useState("conversational");
  const [accent, setAccent] = useState("American (Neutral)");
  const [gender, setGender] = useState<"female" | "male" | "non-binary">("female");
  const [description, setDescription] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access was denied or not supported by this browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioBlob(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceName.trim() || !hasConsent || isCloning) return;

    setIsCloning(true);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/voices/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: voiceName,
          category,
          gender,
          accent,
          description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Voice "${voiceName}" successfully created! Redirecting to Studio...`);
        setTimeout(() => {
          router.push("/studio");
        }, 1500);
      }
    } catch (err) {
      console.error("Cloning failed:", err);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <PageContainer className="max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-primary" />
          <span>Voice Cloning Studio</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate an authentic digital twin of any voice from a short audio sample or microphone recording.
        </p>
      </div>

      {/* Clone Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Badge variant="success" className="text-[10px]">
                Available
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold">Zero-Shot Latent Synthesis</CardTitle>
            <CardDescription className="text-xs">
              Requires 15 seconds to 2 minutes of clean reference audio. Instant extraction without retraining.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          onClick={() => setCloneType("pvc")}
          className={`cursor-pointer transition-all ${
            cloneType === "pvc"
              ? "border-primary bg-primary/5 shadow-xs"
              : "hover:border-foreground/30 opacity-75"
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="font-mono text-xs text-amber-500 border-amber-500/30">
                Professional (PVC)
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Creator+
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold">Fine-Tuned Foundation Model</CardTitle>
            <CardDescription className="text-xs">
              Requires 30+ minutes of studio-grade WAV samples. Dedicated GPU fine-tuning for ultra-expressive delivery.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Cloning Form */}
      <form onSubmit={handleSubmit}>
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
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-500">
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
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 flex items-center gap-2">
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
  );
}
