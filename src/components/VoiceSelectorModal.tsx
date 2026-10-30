"use client";

import { useState } from "react";
import { Voice, VoiceCategory } from "@/types";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { Search, X, Filter } from "lucide-react";
import VoiceCard from "./VoiceCard";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  if (!isOpen) return null;

  const filteredVoices = DEFAULT_VOICES.filter((voice) => {
    const matchesCategory = category === "all" || voice.category === category;
    const matchesSearch =
      voice.name.toLowerCase().includes(search.toLowerCase()) ||
      voice.accent.toLowerCase().includes(search.toLowerCase()) ||
      voice.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories: { id: string; label: string }[] = [
    { id: "all", label: "All Voices" },
    { id: "conversational", label: "Conversational" },
    { id: "narration", label: "Narration" },
    { id: "characters", label: "Characters" },
    { id: "social_media", label: "Social Media" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] glass-panel rounded-2xl border border-surface-700/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Select an AI Voice</h2>
            <p className="text-xs text-surface-400">Choose from 17,500+ curated voices and custom clones</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-surface-800/80 bg-surface-950/40 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name, accent (British, American), or use-case..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-900 border border-surface-700 rounded-xl text-xs sm:text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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

        {/* Voices Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice.id === voice.id}
              onSelect={(v) => {
                onSelectVoice(v);
                onClose();
              }}
            />
          ))}

          {filteredVoices.length === 0 && (
            <div className="col-span-2 py-12 text-center text-surface-400">
              <p className="text-sm">No voices match your search query.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
                className="mt-2 text-xs text-brand-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
