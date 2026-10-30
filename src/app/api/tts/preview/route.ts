import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/provider-client";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";

// Cache in-memory previews for instant playback
const previewAudioCache = new Map<string, { buffer: Buffer; contentType: string }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voiceId = searchParams.get("voice") || "af_heart";

    const cached = previewAudioCache.get(voiceId);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Content-Length": cached.buffer.length.toString(),
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const voice = DEFAULT_VOICES.find((v) => v.id === voiceId) || DEFAULT_VOICES[0];
    const previewText = voice.sampleText || `Hello! This is ${voice.name} powered by Kokoro-82M neural speech.`;

    const result = await synthesizeSpeech({
      text: previewText,
      voice,
      settings: {
        speed: 1.0,
        stability: 0.7,
        similarity: 0.8,
        styleExaggeration: 0.0,
      },
    });

    previewAudioCache.set(voiceId, {
      buffer: result.audioBuffer,
      contentType: result.contentType,
    });

    return new NextResponse(new Uint8Array(result.audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": result.audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    console.error("Audio preview synthesis error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview", details: error.message },
      { status: 500 }
    );
  }
}
