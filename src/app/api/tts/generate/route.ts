import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/provider-client";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";
import { addGenerationToHistory } from "@/lib/history-store";
import { addTransaction } from "@/lib/transaction-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, settings, modelId } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_PROMPT",
            message: "Text prompt is required for synthesis.",
          },
        },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROMPT_TOO_LONG",
            message: "Prompt exceeds maximum allowed character length of 5,000.",
          },
        },
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

    // Synthesize speech via abstracted voice provider
    const result = await synthesizeSpeech({
      text,
      voice,
      settings: defaultSettings,
      modelId,
    });

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const base64Audio = `data:${result.contentType};base64,${result.audioBuffer.toString("base64")}`;
    const creditsUsed = text.length;

    // Persist to history store
    addGenerationToHistory({
      id: generationId,
      text,
      voice,
      settings: defaultSettings,
      audioUrl: base64Audio,
      durationSeconds: result.durationSeconds,
      characterCount: text.length,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    return NextResponse.json({
      success: true,
      data: {
        generationId,
        audioUrl: base64Audio,
        durationSeconds: result.durationSeconds,
        characterCount: text.length,
        creditsDeducted: creditsUsed,
        providerUsed: result.providerUsed,
        voice: {
          id: voice.id,
          name: voice.name,
          category: voice.category,
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("TTS generation handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SYNTHESIS_FAILED",
          message: error?.message || "Failed to synthesize speech.",
        },
      },
      { status: 500 }
    );
  }
}
