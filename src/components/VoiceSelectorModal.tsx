"use client";

import { useState, useEffect } from "react";
import { Voice, ProviderId } from "@/types";
import { ALL_CATALOG_VOICES } from "@/lib/voice-catalog";
import { Search, X, Volume2, Globe } from "lucide-react";
import VoiceCard from "./VoiceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
}

export default function VoiceSelectorModal({
  isOpen,
  onClose,
  selectedVoice,
  onSelectVoice,
}: VoiceSelectorModalProps) {
  const [voices, setVoices] = useState<Voice[]>(ALL_CATALOG_VOICES);
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/voices")
        .then((res) => res.json())
        .then((data) => {
          if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
            setVoices(data.voices);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredVoices = voices.filter((voice) => {
    const matchesProvider =
      selectedProvider === "all" || voice.providerId === selectedProvider;
    const matchesLanguage =
      selectedLanguage === "all" ||
      (voice.languageCode && voice.languageCode.startsWith(selectedLanguage)) ||
      (voice.accent && voice.accent.toLowerCase().includes(selectedLanguage.toLowerCase()));
    const matchesCategory =
      category === "all" || voice.category === category || (category === "cloned" && voice.isCloned);
    const matchesGender = gender === "all" || voice.gender === gender;
    const matchesSearch =
      voice.name.toLowerCase().includes(search.toLowerCase()) ||
      voice.accent.toLowerCase().includes(search.toLowerCase()) ||
      voice.description.toLowerCase().includes(search.toLowerCase()) ||
      (voice.languageName && voice.languageName.toLowerCase().includes(search.toLowerCase())) ||
      voice.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesProvider && matchesLanguage && matchesCategory && matchesGender && matchesSearch;
  });

  const providerFilters = [
    { id: "all", label: `All (${voices.length})` },
    { id: "kokoro", label: "Kokoro 82M" },
    { id: "edge", label: "Cloud Multi" },
    { id: "google", label: "Google TTS" },
    { id: "elevenlabs", label: "ElevenLabs" },
  ];

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "conversational", label: "Conversational" },
    { id: "narration", label: "Narration" },
    { id: "characters", label: "Characters" },
    { id: "social_media", label: "Social Media" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-5xl max-h-[88vh] rounded-xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-heading font-semibold tracking-tight">Select an AI Voice</h2>
                <Badge variant="steel" className="text-[10px]">
                  {voices.length} Multi-Provider Voices
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Browse official Kokoro 82M open-weights, Cloud Multilingual, Google Gemini, and ElevenLabs voices.
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-muted/20 space-y-3">
          {/* Search and Selects */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by voice name, accent, style (e.g. British, Deep, Warm, Spanish)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Language filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Languages</option>
              <option value="en">English (US & UK)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>

            {/* Gender filter */}
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          {/* Provider Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">Provider:</span>
            {providerFilters.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedProvider === p.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
                }`}
              >
                {p.label}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-1 shrink-0" />

            {/* Category filter pills */}
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  category === c.id
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground border-border/60"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice.id === voice.id}
              onSelect={onSelectVoice}
            />
          ))}
          {filteredVoices.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground text-xs space-y-1">
              <p>No voices match your search criteria.</p>
              <p className="text-[11px]">Try clearing filters or searching another keyword.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
          <span>
            Showing {filteredVoices.length} of {voices.length} voices
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
