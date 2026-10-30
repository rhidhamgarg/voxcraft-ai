import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/provider-client";
import { DEFAULT_VOICES } from "@/lib/voice-catalog";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, settings } = await req.json();

    const voice = DEFAULT_VOICES.find((v) => v.id === voiceId) || DEFAULT_VOICES[0];
    const defaultSettings = {
      stability: 0.5,
      similarity: 0.75,
      styleExaggeration: 0.0,
      speed: 1.0,
      ...settings,
    };

    const result = await synthesizeSpeech({
      text: text || "Hello, this is a real-time stream.",
      voice,
      settings: defaultSettings,
    });

    return new NextResponse(new Uint8Array(result.audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": result.audioBuffer.length.toString(),
        "X-Audio-Duration": result.durationSeconds.toString(),
        "X-Provider-Used": result.providerUsed,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
