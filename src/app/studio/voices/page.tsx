"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Voice, VoiceRegion, VoiceType } from "@/types";
import { ALL_CATALOG_VOICES } from "@/lib/voice-catalog";
import VoiceCard from "@/components/VoiceCard";
import { Search, Library, Plus, Globe, RotateCcw, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

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

const VOICE_TYPES: { id: VoiceType | "all"; label: string }[] = [
  { id: "all", label: "All Voices" },
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "child", label: "Child-like 🧸" },
];

const INDIA_LANGUAGES = [
  { id: "all", label: "All India Languages" },
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

export default function VoiceLibraryPage() {
  const router = useRouter();
  const voicesRef = useRef<HTMLDivElement>(null);
  const [voices, setVoices] = useState<Voice[]>(ALL_CATALOG_VOICES);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<VoiceRegion | "all">("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [voiceType, setVoiceType] = useState<VoiceType | "all">("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
          setVoices(data.voices);
        }
      })
      .catch(() => {});
  }, []);

  // Derive countries present in current voices
  const availableCountries = useMemo(() => {
    const countryMap = new Map<string, { code: string; name: string; flag: string; count: number }>();
    voices.forEach((v) => {
      if (selectedRegion !== "all" && v.region !== selectedRegion) return;
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
      if (a.code === "IN") return -1;
      if (b.code === "IN") return 1;
      if (a.code === "US") return -1;
      if (b.code === "US") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [voices, selectedRegion]);

  // Derive languages
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

  const handleRegionChange = (newRegion: VoiceRegion | "all") => {
    setSelectedRegion(newRegion);
    setSelectedCountry("all");
    setSelectedLanguage("all");
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedLanguage("all");
    if (countryCode !== "all") {
      const match = voices.find((v) => v.countryCode === countryCode);
      if (match?.region && selectedRegion === "all") {
        setSelectedRegion(match.region);
      }
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedProvider("all");
    setSelectedRegion("all");
    setSelectedCountry("all");
    setSelectedLanguage("all");
    setVoiceType("all");
    setCategory("all");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedProvider !== "all" ||
    selectedRegion !== "all" ||
    selectedCountry !== "all" ||
    selectedLanguage !== "all" ||
    voiceType !== "all" ||
    category !== "all";

  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      // Provider
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

      // Region
      if (selectedRegion !== "all" && voice.region !== selectedRegion) return false;

      // Country
      if (selectedCountry !== "all") {
        if (voice.countryCode !== selectedCountry && voice.countryName !== selectedCountry) return false;
      }

      // Language
      if (selectedLanguage !== "all") {
        const langLower = selectedLanguage.toLowerCase();
        const codeMatch = voice.languageCode?.toLowerCase().startsWith(langLower);
        const nameMatch = voice.languageName?.toLowerCase().includes(langLower);
        const accentMatch = voice.accent?.toLowerCase().includes(langLower);
        if (!codeMatch && !nameMatch && !accentMatch) return false;
      }

      // Voice Type
      if (voiceType !== "all") {
        if (voiceType === "child") {
          const isChild =
            voice.voiceType === "child" ||
            voice.ageGroup === "child" ||
            voice.traits?.some((t) => t.toLowerCase().includes("child"));
          if (!isChild) return false;
        } else {
          if (voice.voiceType !== voiceType && voice.gender !== voiceType) return false;
        }
      }

      // Category
      if (category !== "all") {
        if (category === "cloned") {
          if (!voice.isCloned) return false;
        } else if (voice.category !== category) {
          return false;
        }
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          voice.name.toLowerCase().includes(q) ||
          voice.description.toLowerCase().includes(q) ||
          voice.accent.toLowerCase().includes(q) ||
          (voice.countryName && voice.countryName.toLowerCase().includes(q)) ||
          (voice.languageName && voice.languageName.toLowerCase().includes(q)) ||
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
    category,
    search,
  ]);

  // GSAP animation for voice library entrance
  useGsapContext(
    () => {
      const tl = gsap.timeline({ defaults: { ease: MOTION.ease.smooth } });
      tl.fromTo(
        ".gsap-voices-header",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4 }
      )
        .fromTo(
          ".gsap-voices-filter",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        )
        .fromTo(
          ".gsap-voice-card",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.03 },
          "-=0.2"
        );
    },
    voicesRef,
    [filteredVoices.length]
  );

  const providerCounts = useMemo(() => {
    return {
      all: voices.length,
      kokoro: voices.filter((v) => v.providerId === "kokoro").length,
      edge: voices.filter((v) => v.providerId === "edge_tts").length,
      google: voices.filter((v) => v.providerId === "google_cloud" || v.providerId === "gemini").length,
      elevenlabs: voices.filter((v) => v.providerId === "elevenlabs").length,
    };
  }, [voices]);

  const providerFilters = [
    { id: "all", label: `All Providers (${providerCounts.all})` },
    { id: "kokoro", label: `Kokoro 82M (${providerCounts.kokoro})` },
    { id: "edge", label: `Cloud Multi (${providerCounts.edge})` },
    { id: "google", label: `Google TTS (${providerCounts.google})` },
    { id: "elevenlabs", label: `ElevenLabs (${providerCounts.elevenlabs})` },
  ];

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "conversational", label: "Conversational" },
    { id: "narration", label: "Narration" },
    { id: "characters", label: "Characters" },
    { id: "social_media", label: "Social Media" },
    { id: "cloned", label: "My Cloned Voices" },
  ];

  const isIndiaFilterActive = selectedCountry === "IN";

  return (
    <div ref={voicesRef}>
      <PageContainer>
        {/* Header Banner */}
        <div className="gsap-voices-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tighter text-foreground">
                Voice Library & Roster
              </h1>
              <Badge variant="steel" className="text-[10px]">
                {voices.length} Multi-Provider Voices
              </Badge>
              <Badge variant="subtle" className="text-[10px] hidden sm:inline-flex">
                25+ Countries · 20+ Languages
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore {voices.length}+ high-fidelity voices across Kokoro 82M open-weights, Cloud Multilingual, Google Gemini 2.0, and ElevenLabs.
            </p>
          </div>

          <Button asChild size="sm" className="gap-2 self-start sm:self-auto font-medium tracking-snug">
            <Link href="/studio/cloning">
              <Plus className="w-4 h-4" />
              <span>Clone New Voice</span>
            </Link>
          </Button>
        </div>

        {/* Filter & Search Card */}
        <Card className="gsap-voices-filter">
          <CardContent className="p-4 space-y-3">
            {/* Row 1: Search + Region + Country + Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search voices by name, country, accent, tone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Region */}
              <div className="lg:col-span-2">
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value as any)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div className="lg:col-span-3">
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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

              {/* Language */}
              <div className="lg:col-span-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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

            {/* Row 2: Voice Types & Providers */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-muted-foreground mr-1 hidden sm:inline">Type:</span>
                {VOICE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setVoiceType(t.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      voiceType === t.id
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}

                <div className="h-4 w-px bg-border mx-1 shrink-0 hidden sm:block" />

                {providerFilters.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProvider(p.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      selectedProvider === p.id
                        ? "bg-foreground text-background border-foreground shadow-xs"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border-border/70"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </Button>
              )}
            </div>

            {/* Dedicated India Language Strip */}
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

            {/* Row 3: Categories Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-border/50">
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
          </CardContent>
        </Card>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{filteredVoices.length}</strong> of {voices.length} voices
          </span>
          <span>Click any card to select for TTS generation</span>
        </div>

        {/* Voice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVoices.map((voice) => (
            <div key={voice.id} className="gsap-voice-card">
              <VoiceCard
                voice={voice}
                onSelect={() => router.push(`/studio?voice=${encodeURIComponent(voice.id)}`)}
              />
            </div>
          ))}
        </div>

        {filteredVoices.length === 0 && (
          <Card className="p-12 text-center">
            <Library className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-30" />
            <h3 className="text-base font-heading font-semibold tracking-tight">No matching voices found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Try adjusting your region, country, language, or search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-4 text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </Button>
          </Card>
        )}
      </PageContainer>
    </div>
  );
}
