import { IVoiceProvider, SynthesizeOptions, SynthesizedAudioResult } from "./voice-provider.interface";
import { Voice } from "@/types";
import { DEFAULT_VOICES } from "../voice-catalog";

export class ElevenLabsProvider implements IVoiceProvider {
  readonly id = "elevenlabs";
  readonly name = "ElevenLabs API";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || "";
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getVoices(): Promise<Voice[]> {
    return DEFAULT_VOICES;
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    if (!this.isConfigured) {
      throw new Error("ElevenLabs API key is missing. Set ELEVENLABS_API_KEY in .env.local.");
    }

    const { text, voice, settings } = options;
    const model = options.modelId || "eleven_turbo_v2_5";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity,
            style: settings.styleExaggeration,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const words = text.trim().split(/\s+/).length;
    const duration = Math.max(1.8, words / 2.5);

    return {
      audioBuffer: Buffer.from(arrayBuffer),
      contentType: "audio/mpeg",
      providerUsed: this.name,
      durationSeconds: parseFloat(duration.toFixed(2)),
    };
  }

  async getHealth() {
    if (!this.isConfigured) return { status: "unavailable" as const };
    return { status: "healthy" as const, latencyMs: 280 };
  }
}
