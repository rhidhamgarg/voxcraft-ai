import { NextRequest, NextResponse } from "next/server";
import { VoiceProviderRegistry } from "@/lib/providers/provider-registry";
import { ProviderId } from "@/types";

// In-memory cache for audio previews
const previewAudioCache = new Map<string, { buffer: Buffer; contentType: string }>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerParam = (searchParams.get("provider") || "kokoro") as ProviderId;
    const voiceId = searchParams.get("voice") || "af_heart";

    const cacheKey = `${providerParam}:${voiceId}`;
    const cached = previewAudioCache.get(cacheKey);
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

    const registry = VoiceProviderRegistry.getInstance();
    const result = await registry.getPreview(providerParam, voiceId);

    previewAudioCache.set(cacheKey, {
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
