"use client";

import { useState } from "react";
import { Voice, VoiceCategory } from "@/types";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { Search, X } from "lucide-react";
import VoiceCard from "./VoiceCard";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-semibold tracking-tight">Select an AI Voice</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              Choose from curated open-weight voices and custom clones
            </p>
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
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by voice name, accent, or style tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  category === c.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
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
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
