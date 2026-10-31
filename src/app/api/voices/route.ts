import { NextRequest, NextResponse } from "next/server";
import { VoiceProviderRegistry } from "@/lib/providers/provider-registry";
import { clonedVoicesStore } from "@/lib/cloned-store";
import { ProviderId } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerParam = searchParams.get("provider");
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const country = searchParams.get("country");
  const voiceType = searchParams.get("voiceType");
  const trait = searchParams.get("trait");
  const language = searchParams.get("language");
  const gender = searchParams.get("gender");
  const search = searchParams.get("search")?.toLowerCase();

  const registry = VoiceProviderRegistry.getInstance();
  let allVoices = await registry.getAllVoices();

  // Include custom cloned voices if any
  if (clonedVoicesStore && clonedVoicesStore.length > 0) {
    allVoices = [...allVoices, ...clonedVoicesStore];
  }

  // 1. Filter by Provider
  if (providerParam && providerParam !== "all") {
    allVoices = allVoices.filter((v) => {
      if (providerParam === "edge" || providerParam === "edge_tts") {
        return v.providerId === "edge_tts";
      }
      if (providerParam === "google" || providerParam === "google_cloud" || providerParam === "gemini") {
        return v.providerId === "google_cloud" || v.providerId === "gemini";
      }
      return v.providerId === providerParam;
    });
  }

  // 2. Filter by Region
  if (region && region !== "all") {
    allVoices = allVoices.filter((v) => v.region && v.region.toLowerCase() === region.toLowerCase());
  }

  // 3. Filter by Country (country code e.g. "IN" or full name e.g. "India")
  if (country && country !== "all") {
    const cLower = country.toLowerCase();
    allVoices = allVoices.filter(
      (v) =>
        (v.countryCode && v.countryCode.toLowerCase() === cLower) ||
        (v.countryName && v.countryName.toLowerCase() === cLower)
    );
  }

  // 4. Filter by Voice Type (female, male, child)
  if (voiceType && voiceType !== "all") {
    allVoices = allVoices.filter((v) => {
      if (voiceType === "child") {
        return v.voiceType === "child" || v.ageGroup === "child" || v.traits?.includes("child-like");
      }
      return v.voiceType === voiceType || v.gender === voiceType;
    });
  }

  // 5. Filter by Voice Trait / Characteristic
  if (trait && trait !== "all") {
    const tLower = trait.toLowerCase();
    allVoices = allVoices.filter((v) =>
      v.traits?.some((t) => t.toLowerCase().includes(tLower)) ||
      v.category === tLower ||
      v.tags?.some((tag) => tag.toLowerCase().includes(tLower))
    );
  }

  // 6. Filter by Category
  if (category && category !== "all") {
    if (category === "cloned") {
      allVoices = allVoices.filter((v) => v.isCloned);
    } else {
      allVoices = allVoices.filter((v) => v.category === category);
    }
  }

  // 7. Filter by Language
  if (language && language !== "all") {
    const langLower = language.toLowerCase();
    allVoices = allVoices.filter(
      (v) =>
        (v.languageCode && v.languageCode.toLowerCase().startsWith(langLower)) ||
        (v.languageName && v.languageName.toLowerCase().includes(langLower)) ||
        (v.accent && v.accent.toLowerCase().includes(langLower))
    );
  }

  // 8. Filter by Gender
  if (gender && gender !== "all") {
    allVoices = allVoices.filter((v) => v.gender === gender);
  }

  // 9. Filter by Search Query
  if (search) {
    allVoices = allVoices.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.description.toLowerCase().includes(search) ||
        v.accent.toLowerCase().includes(search) ||
        (v.countryName && v.countryName.toLowerCase().includes(search)) ||
        (v.languageName && v.languageName.toLowerCase().includes(search)) ||
        v.tags.some((t) => t.toLowerCase().includes(search)) ||
        v.traits?.some((t) => t.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({
    success: true,
    voices: allVoices,
    total: allVoices.length,
    activeProvider: registry.getActiveProvider().id,
  });
}
