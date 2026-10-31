import { NextRequest, NextResponse } from "next/server";
import { Voice } from "@/types";
import { clonedVoicesStore } from "@/lib/cloned-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, gender, accent, description, sampleText } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Voice name is required." }, { status: 400 });
    }

    const newVoice: Voice = {
      id: `cloned-${Date.now()}`,
      providerVoiceId: `cloned-${Date.now()}`,
      providerId: "kokoro",
      name: name.trim(),
      category: category || "cloned",
      gender: gender || "female",
      accent: accent || "Custom Clone",
      languageCode: "en-US",
      languageName: "English (US)",
      description: description || "User-created Instant Voice Clone.",
      previewUrl: "",
      sampleText: sampleText || `Hi, I am ${name}, your new personalized AI voice clone.`,
      tags: ["Custom Clone", "IVC", category || "Personal"],
      supportedSettings: ["speed", "stability"],
      isCloned: true,
      isPremium: false,
    };

    clonedVoicesStore.unshift(newVoice);

    return NextResponse.json({
      success: true,
      voice: newVoice,
      message: "Voice successfully cloned and added to your voice lab.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
