"use client";

import { useState, useEffect } from "react";
import { Voice } from "@/types";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import VoiceCard from "@/components/VoiceCard";
import { Search, Library, Sparkles, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VoiceLibraryPage() {
  const router = useRouter();
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (data.voices) setVoices(data.voices);
      })
      .catch(() => {});
  }, []);

  const filteredVoices = voices.filter((voice) => {
    const matchesCategory = category === "all" || voice.category === category;
    const matchesGender = gender === "all" || voice.gender === gender;
    const matchesSearch =
      voice.name.toLowerCase().includes(search.toLowerCase()) ||
      voice.accent.toLowerCase().includes(search.toLowerCase()) ||
      voice.description.toLowerCase().includes(search.toLowerCase()) ||
      voice.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesGender && matchesSearch;
  });

  const categories = [
    { id: "all", label: "All Use Cases" },
    { id: "conversational", label: "Conversational" },
    { id: "narration", label: "Narration" },
    { id: "characters", label: "Characters" },
    { id: "social_media", label: "Social Media" },
    { id: "cloned", label: "My Cloned Voices" },
  ];

  return (
    <PageContainer>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voice Library & Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Discover community and curated neural voices for conversational agents, audiobooks, and videos.
          </p>
        </div>

        <Button asChild size="sm" className="gap-2 self-start sm:self-auto">
          <Link href="/studio/cloning">
            <Plus className="w-4 h-4" />
            <span>Clone New Voice</span>
          </Link>
        </Button>
      </div>

      {/* Filter & Search Card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by speaker name, accent, tone, or style tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  category === c.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
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
          <VoiceCard
            key={voice.id}
            voice={voice}
            onSelect={() => router.push(`/studio`)}
          />
        ))}
      </div>

      {filteredVoices.length === 0 && (
        <Card className="p-12 text-center">
          <Library className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-30" />
          <h3 className="text-base font-semibold">No matching voices found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search criteria or filter categories.
          </p>
        </Card>
      )}
    </PageContainer>
  );
}
