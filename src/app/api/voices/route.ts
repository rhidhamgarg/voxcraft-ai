import { NextRequest, NextResponse } from "next/server";
import { VoiceProviderRegistry } from "@/lib/providers/provider-registry";
import { clonedVoicesStore } from "@/lib/cloned-store";
import { ProviderId } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerParam = searchParams.get("provider") as ProviderId | null;
  const category = searchParams.get("category");
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
  if (providerParam && providerParam !== ("all" as any)) {
    allVoices = allVoices.filter((v) => v.providerId === providerParam);
  }

  // 2. Filter by Category
  if (category && category !== "all") {
    if (category === "cloned") {
      allVoices = allVoices.filter((v) => v.isCloned);
    } else {
      allVoices = allVoices.filter((v) => v.category === category);
    }
  }

  // 3. Filter by Language
  if (language && language !== "all") {
    allVoices = allVoices.filter((v) => v.languageCode?.startsWith(language) || v.languageCode === language);
  }

  // 4. Filter by Gender
  if (gender && gender !== "all") {
    allVoices = allVoices.filter((v) => v.gender === gender);
  }

  // 5. Filter by Search Query
  if (search) {
    allVoices = allVoices.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.description.toLowerCase().includes(search) ||
        v.accent.toLowerCase().includes(search) ||
        v.languageName.toLowerCase().includes(search) ||
        v.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({
    success: true,
    voices: allVoices,
    total: allVoices.length,
    activeProvider: registry.getActiveProvider().id,
  });
}
