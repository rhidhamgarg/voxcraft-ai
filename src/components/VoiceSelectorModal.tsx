"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Voice, VoiceRegion, VoiceType } from "@/types";
import { ALL_CATALOG_VOICES } from "@/lib/voice-catalog";
import {
  Search,
  X,
  Volume2,
  Globe,
  Filter,
  RotateCcw,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers,
  Smile,
  User,
  SlidersHorizontal,
} from "lucide-react";
import VoiceCard from "./VoiceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
}

const REGIONS: { id: VoiceRegion | "all"; label: string }[] = [
  { id: "all", label: "All Regions" },
  { id: "Asia", label: "Asia" },
  { id: "Europe", label: "Europe" },
  { id: "North America", label: "North America" },
  { id: "South America", label: "South America" },
  { id: "Africa", label: "Africa" },
  { id: "Oceania", label: "Oceania" },
  { id: "Middle East", label: "Middle East" },
];

const VOICE_TYPES: { id: VoiceType | "all"; label: string; icon?: string }[] = [
  { id: "all", label: "All Voices" },
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "child", label: "Child-like 🧸" },
];

const CHARACTERISTICS: { id: string; label: string }[] = [
  { id: "all", label: "All Characteristics" },
  { id: "conversational", label: "Conversational" },
  { id: "narration", label: "Narration" },
  { id: "professional", label: "Professional" },
  { id: "deep", label: "Deep / Baritone" },
  { id: "soft", label: "Soft & Melodic" },
  { id: "energetic", label: "Energetic" },
  { id: "calm", label: "Calm & Soothing" },
  { id: "young_adult", label: "Young Adult" },
  { id: "adult", label: "Adult" },
  { id: "mature", label: "Mature" },
];

const PROVIDER_OPTIONS = [
  { id: "all", label: "All Providers" },
  { id: "kokoro", label: "Kokoro 82M" },
  { id: "edge", label: "Cloud Multi" },
  { id: "google", label: "Google TTS" },
  { id: "elevenlabs", label: "ElevenLabs" },
];

// Indian languages with verified neural voices in our connected providers
const INDIA_LANGUAGES = [
  { id: "all", label: "All Indian Languages" },
  { id: "hi", label: "Hindi (हिन्दी)" },
  { id: "en-IN", label: "English (Indian)" },
  { id: "bn", label: "Bengali (বাংলা)" },
  { id: "ta", label: "Tamil (தமிழ்)" },
  { id: "te", label: "Telugu (తెలుగు)" },
  { id: "mr", label: "Marathi (मराठी)" },
  { id: "gu", label: "Gujarati (ગુજરાતી)" },
  { id: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { id: "ml", label: "Malayalam (മലയാളം)" },
  { id: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { id: "ur", label: "Urdu (اردو)" },
  { id: "or", label: "Odia (ଓଡ଼ିଆ)" },
  { id: "as", label: "Assamese (অসমীয়া)" },
  { id: "ne", label: "Nepali (नेपाली)" },
];

export default function VoiceSelectorModal({
  isOpen,
  onClose,
  selectedVoice,
  onSelectVoice,
}: VoiceSelectorModalProps) {
  const [voices, setVoices] = useState<Voice[]>(ALL_CATALOG_VOICES);
  const [tempSelectedVoice, setTempSelectedVoice] = useState<Voice>(selectedVoice);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<VoiceRegion | "all">("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [voiceType, setVoiceType] = useState<VoiceType | "all">("all");
  const [selectedTrait, setSelectedTrait] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  // Keep tempSelectedVoice synced with current selectedVoice when opened
  useEffect(() => {
    if (isOpen) {
      setTempSelectedVoice(selectedVoice);
      // Fetch fresh voices catalog from server API
      fetch("/api/voices")
        .then((res) => res.json())
        .then((data) => {
          if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
            setVoices(data.voices);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, selectedVoice]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Derive distinct countries present in current voices (and filtered by region if region selected)
  const availableCountries = useMemo(() => {
    const countryMap = new Map<string, { code: string; name: string; flag: string; count: number }>();
    voices.forEach((v) => {
      if (selectedRegion !== "all" && v.region !== selectedRegion) {
        return;
      }
      if (v.countryCode && v.countryName) {
        const key = v.countryCode;
        if (!countryMap.has(key)) {
          countryMap.set(key, {
            code: v.countryCode,
            name: v.countryName,
            flag: v.flagEmoji || "🌐",
            count: 1,
          });
        } else {
          countryMap.get(key)!.count += 1;
        }
      }
    });

    return Array.from(countryMap.values()).sort((a, b) => {
      // Keep India and US near the top if available
      if (a.code === "IN") return -1;
      if (b.code === "IN") return 1;
      if (a.code === "US") return -1;
      if (b.code === "US") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [voices, selectedRegion]);

  // Derive distinct languages present in current selection
  const availableLanguages = useMemo(() => {
    const langMap = new Map<string, { code: string; name: string; count: number }>();
    voices.forEach((v) => {
      if (selectedRegion !== "all" && v.region !== selectedRegion) return;
      if (selectedCountry !== "all" && v.countryCode !== selectedCountry) return;

      if (v.languageCode && v.languageName) {
        const key = v.languageCode;
        if (!langMap.has(key)) {
          langMap.set(key, {
            code: v.languageCode,
            name: v.languageName,
            count: 1,
          });
        } else {
          langMap.get(key)!.count += 1;
        }
      }
    });

    return Array.from(langMap.values()).sort((a, b) => b.count - a.count);
  }, [voices, selectedRegion, selectedCountry]);

  // Handle region change: reset country and language if not applicable
  const handleRegionChange = (newRegion: VoiceRegion | "all") => {
    setSelectedRegion(newRegion);
    setSelectedCountry("all");
    setSelectedLanguage("all");
  };

  // Handle country change
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedLanguage("all");
    // If selecting India or specific country, sync region if needed
    if (countryCode !== "all") {
      const match = voices.find((v) => v.countryCode === countryCode);
      if (match?.region && selectedRegion === "all") {
        setSelectedRegion(match.region);
      }
    }
  };

  // Clear all active filters
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSelectedRegion("all");
    setSelectedCountry("all");
    setSelectedLanguage("all");
    setVoiceType("all");
    setSelectedTrait("all");
    setSelectedProvider("all");
  }, []);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedRegion !== "all" ||
    selectedCountry !== "all" ||
    selectedLanguage !== "all" ||
    voiceType !== "all" ||
    selectedTrait !== "all" ||
    selectedProvider !== "all";

  // Filter voices across all active dimensions
  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      // 1. Provider
      if (selectedProvider !== "all") {
        if (selectedProvider === "kokoro" && voice.providerId !== "kokoro") return false;
        if (selectedProvider === "edge" && voice.providerId !== "edge_tts") return false;
        if (
          selectedProvider === "google" &&
          voice.providerId !== "google_cloud" &&
          voice.providerId !== "gemini"
        )
          return false;
        if (selectedProvider === "elevenlabs" && voice.providerId !== "elevenlabs") return false;
      }

      // 2. Region
      if (selectedRegion !== "all" && voice.region !== selectedRegion) {
        return false;
      }

      // 3. Country
      if (selectedCountry !== "all") {
        if (voice.countryCode !== selectedCountry && voice.countryName !== selectedCountry) {
          return false;
        }
      }

      // 4. Language
      if (selectedLanguage !== "all") {
        const langLower = selectedLanguage.toLowerCase();
        const codeMatch = voice.languageCode?.toLowerCase().startsWith(langLower);
        const nameMatch = voice.languageName?.toLowerCase().includes(langLower);
        const accentMatch = voice.accent?.toLowerCase().includes(langLower);
        if (!codeMatch && !nameMatch && !accentMatch) return false;
      }

      // 5. Voice Type (Female, Male, Child-like)
      if (voiceType !== "all") {
        if (voiceType === "child") {
          const isChild =
            voice.voiceType === "child" ||
            voice.ageGroup === "child" ||
            voice.traits?.some((t) => t.toLowerCase().includes("child"));
          if (!isChild) return false;
        } else {
          if (voice.voiceType !== voiceType && voice.gender !== voiceType) {
            return false;
          }
        }
      }

      // 6. Characteristics / Trait
      if (selectedTrait !== "all") {
        const traitLower = selectedTrait.toLowerCase();
        const traitMatch =
          voice.traits?.some((t) => t.toLowerCase().includes(traitLower)) ||
          voice.category?.toLowerCase() === traitLower ||
          voice.tags?.some((tag) => tag.toLowerCase().includes(traitLower)) ||
          voice.ageGroup?.toLowerCase() === traitLower;
        if (!traitMatch) return false;
      }

      // 7. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          voice.name.toLowerCase().includes(q) ||
          voice.description.toLowerCase().includes(q) ||
          voice.accent.toLowerCase().includes(q) ||
          (voice.countryName && voice.countryName.toLowerCase().includes(q)) ||
          (voice.languageName && voice.languageName.toLowerCase().includes(q)) ||
          (voice.languageCode && voice.languageCode.toLowerCase().includes(q)) ||
          voice.tags.some((t) => t.toLowerCase().includes(q)) ||
          voice.traits?.some((t) => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [
    voices,
    selectedProvider,
    selectedRegion,
    selectedCountry,
    selectedLanguage,
    voiceType,
    selectedTrait,
    search,
  ]);

  // Provider count statistics for pills
  const providerCounts = useMemo(() => {
    return {
      all: voices.length,
      kokoro: voices.filter((v) => v.providerId === "kokoro").length,
      edge: voices.filter((v) => v.providerId === "edge_tts").length,
      google: voices.filter((v) => v.providerId === "google_cloud" || v.providerId === "gemini").length,
      elevenlabs: voices.filter((v) => v.providerId === "elevenlabs").length,
    };
  }, [voices]);

  // Confirm selection and apply to studio
  const handleApply = () => {
    onSelectVoice(tempSelectedVoice);
    onClose();
  };

  // Immediate selection via double-click on card
  const handleImmediateSelect = (voice: Voice) => {
    setTempSelectedVoice(voice);
    onSelectVoice(voice);
    onClose();
  };

  const isIndiaFilterActive = selectedCountry === "IN";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-heading font-semibold tracking-tight text-foreground">
                  Global AI Voice Library
                </h2>
                <Badge variant="steel" className="text-[11px] font-mono px-2 py-0.5">
                  {voices.length} Verified Neural Voices
                </Badge>
                <Badge variant="subtle" className="text-[11px] font-mono px-2 py-0.5 hidden sm:inline-flex">
                  25+ Countries · 20+ Languages
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                Explore real voices across Kokoro 82M open-weights, Cloud Multi, Google Gemini 2.0, and ElevenLabs.
              </p>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-border bg-muted/20 space-y-3 shrink-0">
          {/* Top Row: Search Input + Region + Country + Language Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search voices by name, country, accent, style..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Region Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value as any)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">
                  {selectedRegion === "all" ? "All Countries (Global)" : `All Countries in ${selectedRegion}`}
                </option>
                {availableCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Language / Dialect Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Middle Row: Quick Filters (Voice Types, Provider Tabs, Traits) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
            {/* Left: Voice Types (Female, Male, Child-like) */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[11px] font-mono text-muted-foreground mr-1 hidden sm:inline">Type:</span>
              {VOICE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setVoiceType(t.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    voiceType === t.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
                  }`}
                >
                  {t.label}
                </button>
              ))}

              <div className="h-4 w-px bg-border mx-1 shrink-0 hidden sm:block" />

              {/* Provider Filters */}
              {PROVIDER_OPTIONS.map((p) => {
                const count = providerCounts[p.id as keyof typeof providerCounts] || 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProvider(p.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                      selectedProvider === p.id
                        ? "bg-foreground text-background border-foreground shadow-xs font-semibold"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border-border/70"
                    }`}
                  >
                    {p.label} <span className="opacity-70 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Characteristic/Tone selector */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">Tone:</span>
              <select
                value={selectedTrait}
                onChange={(e) => setSelectedTrait(e.target.value)}
                className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CHARACTERISTICS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  title="Clear all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {/* Dedicated India Language Strip (Shown when India is selected or available) */}
          {(isIndiaFilterActive || selectedRegion === "Asia" || selectedRegion === "all") && (
            <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleCountryChange("IN")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 whitespace-nowrap border shrink-0 transition-colors ${
                  isIndiaFilterActive
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/50"
                }`}
              >
                <span>🇮🇳</span>
                <span>India Languages:</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                {INDIA_LANGUAGES.map((lang) => {
                  const isActive =
                    isIndiaFilterActive &&
                    (lang.id === "all" ? selectedLanguage === "all" : selectedLanguage === lang.id);

                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setSelectedCountry("IN");
                        setSelectedRegion("Asia");
                        setSelectedLanguage(lang.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors border ${
                        isActive
                          ? "bg-amber-500 text-black border-amber-500 font-semibold shadow-xs"
                          : "bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground border-border/40"
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results Bar */}
        <div className="px-5 py-2 bg-muted/10 border-b border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground">{filteredVoices.length}</strong> of {voices.length} voices
            </span>
            {hasActiveFilters && (
              <Badge variant="subtle" className="text-[10px] py-0 px-1.5">
                Filtered
              </Badge>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground hidden sm:block">
            Tip: Click a card to preview and select · Double-click to instantly apply
          </div>
        </div>

        {/* Voice Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredVoices.map((voice) => {
            const isTempSelected = tempSelectedVoice.id === voice.id;
            return (
              <div
                key={voice.id}
                onDoubleClick={() => handleImmediateSelect(voice)}
                className="relative"
              >
                <VoiceCard
                  voice={voice}
                  isSelected={isTempSelected}
                  onSelect={(v) => setTempSelectedVoice(v)}
                />
              </div>
            );
          })}

          {/* Empty State */}
          {filteredVoices.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center border border-border">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  No voices match your current filters
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  We couldn't find any voices matching this combination of region, country, type, or search term.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2 text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer with Temporary Selection and Apply / Cancel Actions */}
        <div className="p-4 border-t border-border bg-card/80 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Active Selection Summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
              {tempSelectedVoice.flagEmoji || tempSelectedVoice.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-mono">Current Selection:</span>
                <span className="text-xs font-semibold text-foreground truncate">
                  {tempSelectedVoice.name}
                </span>
                {tempSelectedVoice.voiceType === "child" && (
                  <Badge variant="subtle" className="text-[9px] px-1 py-0 bg-amber-500/15 text-amber-400 border-amber-500/30">
                    Child-like
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {tempSelectedVoice.countryName || tempSelectedVoice.accent} · {tempSelectedVoice.languageName || tempSelectedVoice.languageCode} · {tempSelectedVoice.providerId}
              </p>
            </div>
          </div>

          {/* Action Buttons: Cancel and Apply Voice */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              className="h-9 px-5 text-xs font-medium flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Voice</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
