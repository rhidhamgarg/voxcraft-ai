import { IVoiceProvider, SynthesizeOptions, SynthesizedAudioResult } from "./voice-provider.interface";
import { Voice } from "@/types";

export class DeepgramAuraProvider implements IVoiceProvider {
  readonly id = "deepgram";
  readonly name = "Deepgram Aura";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY || "";
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getVoices(): Promise<Voice[]> {
    return [
      {
        id: "aura-asteria-en",
        name: "Asteria (Aura)",
        category: "conversational",
        gender: "female",
        accent: "American",
        description: "Clear, crisp, natural conversational female voice.",
        previewUrl: "",
        sampleText: "Welcome to Deepgram Aura audio synthesis.",
        tags: ["Fast", "Aura", "Conversational"],
      },
      {
        id: "aura-orion-en",
        name: "Orion (Aura)",
        category: "narration",
        gender: "male",
        accent: "American",
        description: "Authoritative, deep baritone voice for audiobooks and news.",
        previewUrl: "",
        sampleText: "In tonight's broadcast, global markets surged to historic highs.",
        tags: ["Deep", "Aura", "News"],
      },
      {
        id: "aura-luna-en",
        name: "Luna (Aura)",
        category: "social_media",
        gender: "female",
        accent: "American",
        description: "Youthful, energetic voice for short-form clips.",
        previewUrl: "",
        sampleText: "Check out these incredible voice AI updates in three simple steps.",
        tags: ["Energetic", "Aura", "Social"],
      },
      {
        id: "aura-arcas-en",
        name: "Arcas (Aura)",
        category: "conversational",
        gender: "male",
        accent: "American",
        description: "Calm, reassuring voice for customer service and navigation.",
        previewUrl: "",
        sampleText: "Your order has been verified and will arrive shortly.",
        tags: ["Calm", "Aura", "Support"],
      },
    ];
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    if (!this.isConfigured) {
      throw new Error("Deepgram API key is missing. Set DEEPGRAM_API_KEY in .env.local.");
    }

    const { text, voice } = options;
    const model = voice.id.startsWith("aura-") ? voice.id : "aura-asteria-en";

    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}&encoding=linear16&sample_rate=24000`,
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Deepgram Aura API error (${response.status}): ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const words = text.trim().split(/\s+/).length;
    const duration = Math.max(1.5, words / 2.5);

    return {
      audioBuffer: Buffer.from(arrayBuffer),
      contentType: "audio/wav",
      providerUsed: this.name,
      durationSeconds: parseFloat(duration.toFixed(2)),
    };
  }

  async getHealth() {
    if (!this.isConfigured) return { status: "unavailable" as const };
    return { status: "healthy" as const, latencyMs: 120 };
  }
}
