"use client";

import { useState, useEffect } from "react";
import { Voice } from "@/types";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import VoiceCard from "@/components/VoiceCard";
import { Search, Library, Sparkles, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-mono mb-1">
            <Library className="w-4 h-4" />
            <span>GLOBAL VOICE REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Voice Library & Marketplace</h1>
          <p className="text-sm text-surface-400 mt-1">
            Discover thousands of community and studio voices for your next project.
          </p>
        </div>

        <Link
          href="/studio/cloning"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-brand hover:brightness-110 shadow-md shadow-brand-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Clone New Voice</span>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-surface-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-surface-400" />
            <input
              type="text"
              placeholder="Search by speaker name, accent, tone, or style tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-surface-700 rounded-xl text-xs sm:text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="px-3 py-2 bg-surface-900 border border-surface-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-surface-900 text-surface-400 hover:text-white hover:bg-surface-800 border border-surface-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((voice) => (
          <div key={voice.id} className="relative group">
            <VoiceCard voice={voice} />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => {
                  router.push(`/studio?voice=${voice.id}`);
                }}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 px-2 py-1"
              >
                <span>Use in Studio</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}

        {filteredVoices.length === 0 && (
          <div className="col-span-full py-16 text-center text-surface-400">
            <Library className="w-10 h-10 text-surface-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No voices found</h3>
            <p className="text-xs text-surface-500 mt-1">Try relaxing your search terms or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
