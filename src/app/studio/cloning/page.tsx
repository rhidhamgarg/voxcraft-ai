"use client";

import { useState, useRef } from "react";
import { Mic2, Upload, Sparkles, Shield, Check, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-brand-400 text-xs font-mono mb-1">
          <Mic2 className="w-4 h-4" />
          <span>NEURAL BIOMETRIC VOICE LAB</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Voice Cloning Studio</h1>
        <p className="text-sm text-surface-400 mt-1">
          Generate an authentic digital twin of any voice from a short audio recording.
        </p>
      </div>

      {/* Clone Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setCloneType("ivc")}
          className={`glass-panel p-5 rounded-2xl cursor-pointer border transition-all ${
            cloneType === "ivc"
              ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
              : "border-surface-800 hover:border-surface-700"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Instant (IVC)
            </span>
            <span className="text-xs font-mono text-emerald-400">Available on All Plans</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Instant Voice Clone</h3>
          <p className="text-xs text-surface-400 leading-relaxed">
            Upload 15–60 seconds of clean speech. Generates zero-shot speaker embeddings ready for immediate synthesis in seconds.
          </p>
        </div>

        <div
          onClick={() => setCloneType("pvc")}
          className={`glass-panel p-5 rounded-2xl cursor-pointer border transition-all ${
            cloneType === "pvc"
              ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
              : "border-surface-800 hover:border-surface-700 opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Professional (PVC)
            </span>
            <span className="text-xs font-mono text-surface-400">Requires Creator Tier</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Professional Voice Clone</h3>
          <p className="text-xs text-surface-400 leading-relaxed">
            Train a dedicated neural vocoder on 30+ minutes of studio recordings. Requires interactive voice verification CAPTCHA.
          </p>
        </div>
      </div>

      {/* Main Cloning Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-surface-700/80 space-y-6">
        {/* Sample Audio Input Options */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-white">1. Audio Sample Source</label>
          <p className="text-xs text-surface-400">
            For best results, record in a quiet room with minimal echo and no background music.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Record Mic */}
            <div className="p-5 rounded-xl border border-surface-800 bg-surface-900/60 flex flex-col items-center justify-center text-center space-y-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-surface-800 text-surface-300"
              }`}>
                <Mic2 className="w-6 h-6" />
              </div>

              {isRecording ? (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-rose-400 font-bold">Recording: {recordTime}s</p>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 text-surface-200 border border-surface-700 hover:text-white hover:border-brand-500 transition-colors"
                >
                  {audioBlob ? "Record Again" : "Record via Microphone"}
                </button>
              )}
            </div>

            {/* File Upload */}
            <div className="p-5 rounded-xl border border-dashed border-surface-700 bg-surface-900/40 flex flex-col items-center justify-center text-center space-y-2 relative">
              <Upload className="w-6 h-6 text-surface-400" />
              <p className="text-xs font-medium text-surface-300">Drag & drop or browse</p>
              <p className="text-[11px] text-surface-500">MP3, WAV, M4A up to 25MB</p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {audioBlob && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Audio sample captured successfully ({audioBlob.type || "audio file"})</span>
              </span>
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="space-y-4 pt-2 border-t border-surface-800">
          <label className="text-sm font-semibold text-white">2. Voice Identity Details</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-surface-300 font-medium">Voice Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. My Narrator Voice"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-surface-300 font-medium">Accent / Dialect</label>
              <input
                type="text"
                placeholder="e.g. American, British, Canadian"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-surface-300 font-medium">Primary Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-white focus:outline-none focus:border-brand-500 text-xs"
              >
                <option value="conversational">Conversational</option>
                <option value="narration">Narration & Audiobooks</option>
                <option value="characters">Characters & Gaming</option>
                <option value="social_media">Social Media & Shorts</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-surface-300 font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-white focus:outline-none focus:border-brand-500 text-xs"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-surface-300 font-medium">Description</label>
            <textarea
              rows={2}
              placeholder="Provide context on ideal usage (e.g. Deep documentary voiceover for sci-fi scripts)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 text-xs resize-none"
            />
          </div>
        </div>

        {/* Legal Consent & Verification */}
        <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="consent" className="text-xs text-surface-300 leading-relaxed cursor-pointer">
              <span className="font-semibold text-white">Voice Ownership & Safety Verification:</span> I certify that I own this voice or possess full legal authority and explicit written consent from the speaker to synthesize and clone this audio profile.
            </label>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!hasConsent || !voiceName.trim() || isCloning}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white gradient-brand hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isCloning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Voice Latents...</span>
            </>
          ) : (
            <>
              <span>Create Voice Clone</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
