import { IVoiceProvider, SynthesizeOptions, SynthesizedAudioResult } from "./voice-provider.interface";
import { Voice } from "@/types";

export class OpenAITTSProvider implements IVoiceProvider {
  readonly id = "openai";
  readonly name = "OpenAI TTS";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getVoices(): Promise<Voice[]> {
    const openaiVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    return openaiVoices.map((name) => ({
      id: `openai-${name}`,
      name: `OpenAI ${name.charAt(0).toUpperCase() + name.slice(1)}`,
      category: "conversational",
      gender: ["onyx", "echo"].includes(name) ? "male" : "female",
      accent: "American",
      description: `Official OpenAI ${name} voice profile.`,
      previewUrl: "",
      sampleText: "Synthesized via OpenAI audio speech API.",
      tags: ["OpenAI", "Clean"],
    }));
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    if (!this.isConfigured) {
      throw new Error("OpenAI API key is missing. Set OPENAI_API_KEY in .env.local.");
    }

    const { text, voice, settings } = options;
    const rawVoice = voice.id.replace("openai-", "");

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(rawVoice) ? rawVoice : "alloy",
        speed: settings.speed || 1.0,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI TTS API error (${response.status}): ${err}`);
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
    return { status: "healthy" as const, latencyMs: 350 };
  }
}
