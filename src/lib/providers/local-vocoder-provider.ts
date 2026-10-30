import { IVoiceProvider, SynthesizeOptions, SynthesizedAudioResult } from "./voice-provider.interface";
import { generateSynthesizedWavBuffer } from "../audio-synth";
import { DEFAULT_VOICES } from "../voice-catalog";
import { Voice } from "@/types";

export class LocalVocoderProvider implements IVoiceProvider {
  readonly id = "local_vocoder";
  readonly name = "VoxCraft Neural Vocoder (Embedded)";
  readonly isConfigured = true;

  async getVoices(): Promise<Voice[]> {
    return DEFAULT_VOICES;
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    const { text, voice, settings } = options;

    const wavBuffer = generateSynthesizedWavBuffer(
      text,
      voice.gender,
      settings.speed,
      settings.stability
    );

    const words = text.trim().split(/\s+/).length;
    const duration = Math.max(1.8, (words / 2.5) / settings.speed);

    return {
      audioBuffer: wavBuffer,
      contentType: "audio/wav",
      providerUsed: this.name,
      durationSeconds: parseFloat(duration.toFixed(2)),
    };
  }

  async getHealth() {
    return { status: "healthy" as const, latencyMs: 5 };
  }
}
