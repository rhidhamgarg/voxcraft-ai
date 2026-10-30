import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { clonedVoicesStore } from "@/lib/cloned-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase();

  let allVoices = [...DEFAULT_VOICES, ...clonedVoicesStore];

  if (category && category !== "all") {
    allVoices = allVoices.filter((v) => v.category === category);
  }

  if (search) {
    allVoices = allVoices.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.description.toLowerCase().includes(search) ||
        v.accent.toLowerCase().includes(search) ||
        v.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({
    voices: allVoices,
    total: allVoices.length,
  });
}
