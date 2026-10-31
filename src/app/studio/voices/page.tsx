"use client";

import { useState, useEffect, useRef } from "react";
import { Voice } from "@/types";
import { ALL_CATALOG_VOICES } from "@/lib/voice-catalog";
import VoiceCard from "@/components/VoiceCard";
import { Search, Library, Sparkles, Plus, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

export default function VoiceLibraryPage() {
  const router = useRouter();
  const voicesRef = useRef<HTMLDivElement>(null);
  const [voices, setVoices] = useState<Voice[]>(ALL_CATALOG_VOICES);
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

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

  const filteredVoices = voices.filter((voice) => {
    const matchesProvider =
      selectedProvider === "all" || voice.providerId === selectedProvider;
    const matchesLanguage =
      selectedLanguage === "all" ||
      (voice.languageCode && voice.languageCode.startsWith(selectedLanguage)) ||
      (voice.accent && voice.accent.toLowerCase().includes(selectedLanguage.toLowerCase()));
    const matchesCategory =
      category === "all"
        ? true
        : category === "cloned"
        ? voice.isCloned
        : voice.category === category;
    const matchesGender = gender === "all" || voice.gender === gender;
    const matchesSearch =
      voice.name.toLowerCase().includes(search.toLowerCase()) ||
      voice.accent.toLowerCase().includes(search.toLowerCase()) ||
      voice.description.toLowerCase().includes(search.toLowerCase()) ||
      (voice.languageName && voice.languageName.toLowerCase().includes(search.toLowerCase())) ||
      voice.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesProvider && matchesLanguage && matchesCategory && matchesGender && matchesSearch;
  });

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

  const providerFilters = [
    { id: "all", label: `All Providers (${voices.length})` },
    { id: "kokoro", label: "Kokoro 82M (23)" },
    { id: "edge", label: "Cloud Multi (10)" },
    { id: "google", label: "Google TTS (13)" },
    { id: "elevenlabs", label: "ElevenLabs (7)" },
  ];

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "conversational", label: "Conversational" },
    { id: "narration", label: "Narration" },
    { id: "characters", label: "Characters" },
    { id: "social_media", label: "Social Media" },
    { id: "cloned", label: "My Cloned Voices" },
  ];

  return (
    <div ref={voicesRef}>
      <PageContainer>
        {/* Header Banner */}
        <div className="gsap-voices-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tighter text-foreground">
                Voice Library & Roster
              </h1>
              <Badge variant="steel" className="text-[10px]">
                {voices.length} Multi-Provider Voices
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore 53+ high-fidelity voices across Kokoro 82M open-weights, Cloud Multilingual, Google Gemini, and ElevenLabs.
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
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by voice name, language, accent, tone, or style tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Language filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <span className="text-[11px] font-mono text-muted-foreground mr-1 whitespace-nowrap">
                Provider:
              </span>
              {providerFilters.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProvider(p.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedProvider === p.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Categories Bar */}
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
              Try adjusting your search criteria, language selection, or provider filter.
            </p>
          </Card>
        )}
      </PageContainer>
    </div>
  );
}
