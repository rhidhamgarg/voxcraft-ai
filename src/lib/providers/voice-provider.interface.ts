import { GenerationSettings, Voice } from "@/types";

export interface SynthesizeOptions {
  text: string;
  voice: Voice;
  settings: GenerationSettings;
  modelId?: string;
}

export interface SynthesizedAudioResult {
  audioBuffer: Buffer;
  contentType: string;
  providerUsed: string;
  durationSeconds: number;
}

export interface IVoiceProvider {
  readonly id: string;
  readonly name: string;
  readonly isConfigured: boolean;

  getVoices(): Promise<Voice[]>;
  synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult>;
  getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unavailable'; latencyMs?: number }>;
}
