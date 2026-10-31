import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/provider-client";
import { VoiceProviderRegistry } from "@/lib/providers/provider-registry";
import { addGenerationToHistory } from "@/lib/history-store";
import { ProviderId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, providerId, settings, modelId } = body;

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

    const registry = VoiceProviderRegistry.getInstance();
    let voice = await registry.getVoiceById(voiceId);

    // If not found, resolve fallback voice
    if (!voice) {
      const allVoices = await registry.getAllVoices();
      voice = allVoices.find((v) => (providerId ? v.providerId === providerId : true)) || allVoices[0];
    }

    // Determine target provider
    const targetProviderId = (providerId as ProviderId) || voice.providerId || "kokoro";
    const provider = registry.getProvider(targetProviderId) || registry.getActiveProvider();

    // Check if provider is configured
    if (!provider.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROVIDER_NOT_CONFIGURED",
            message: `${provider.name} requires an API key. Set ${provider.apiKeyEnvVar || "the API key"} in .env.local to activate.`,
            providerId: provider.id,
            requiresApiKey: true,
            apiKeyEnvVar: provider.apiKeyEnvVar,
          },
        },
        { status: 422 }
      );
    }

    const defaultSettings = {
      speed: 1.0,
      stability: 0.5,
      similarity: 0.75,
      styleExaggeration: 0.15,
      pitch: 0.0,
      ...settings,
    };

    // Synthesize speech via selected provider
    const result = await provider.synthesizeSpeech({
      text,
      voice,
      settings: defaultSettings,
      modelId,
    });

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const base64Audio = `data:${result.contentType};base64,${result.audioBuffer.toString("base64")}`;

    // Persist to history store
    addGenerationToHistory({
      id: generationId,
      text,
      voice,
      providerId: provider.id,
      providerName: provider.name,
      modelId: modelId || provider.getModels()[0]?.id || "default",
      settings: defaultSettings,
      audioUrl: base64Audio,
      audioFormat: result.contentType.includes("wav") ? "wav" : "mp3",
      durationSeconds: result.durationSeconds,
      characterCount: text.length,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    return NextResponse.json({
      success: true,
      data: {
        generationId,
        audioUrl: base64Audio,
        audioFormat: result.contentType.includes("wav") ? "wav" : "mp3",
        durationSeconds: result.durationSeconds,
        characterCount: text.length,
        providerUsed: result.providerUsed,
        providerId: provider.id,
        voice: {
          id: voice.id,
          name: voice.name,
          category: voice.category,
          languageCode: voice.languageCode,
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
