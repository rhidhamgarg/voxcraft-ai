import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/provider-client";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, settings, modelId } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text prompt is required for synthesis." },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Prompt exceeds maximum allowed character length of 5,000." },
        { status: 400 }
      );
    }

    // Resolve voice
    const voice = DEFAULT_VOICES.find((v) => v.id === voiceId) || DEFAULT_VOICES[0];

    const defaultSettings = {
      stability: 0.5,
      similarity: 0.75,
      styleExaggeration: 0.0,
      speed: 1.0,
      ...settings,
    };

    const result = await synthesizeSpeech({
      text,
      voice,
      settings: defaultSettings,
      modelId,
    });

    const base64Audio = `data:${result.contentType};base64,${result.audioBuffer.toString("base64")}`;
    const creditsUsed = text.length;

    return NextResponse.json({
      success: true,
      audioUrl: base64Audio,
      contentType: result.contentType,
      durationSeconds: result.durationSeconds,
      charactersCount: text.length,
      creditsDeducted: creditsUsed,
      providerUsed: result.providerUsed,
      voice: {
        id: voice.id,
        name: voice.name,
        category: voice.category,
      },
    });
  } catch (error: any) {
    console.error("TTS generation handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to synthesize speech." },
      { status: 500 }
    );
  }
}
