import { GenerationSettings, ProviderId, ProviderModelInfo, TTSProviderInfo, Voice } from "@/types";

export interface SynthesizeOptions {
  text: string;
  voice: Voice;
  settings: GenerationSettings;
  modelId?: string;
  outputFormat?: "wav" | "mp3" | "opus";
}

export interface SynthesizedAudioResult {
  audioBuffer: Buffer;
  contentType: string; // "audio/wav" | "audio/mpeg" | "audio/opus"
  providerUsed: string;
  providerId: ProviderId;
  durationSeconds: number;
  characterCount: number;
}

export interface IVoiceProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly badge: string;
  readonly providerType: "local" | "cloud";
  readonly isConfigured: boolean;
  readonly requiresApiKey: boolean;
  readonly apiKeyEnvVar?: string;
  readonly supportedSettings: ("speed" | "stability" | "similarity" | "style" | "pitch" | "emotion")[];

  getModels(): ProviderModelInfo[];
  getVoices(): Promise<Voice[]>;
  synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult>;
  getPreview(voiceId: string): Promise<SynthesizedAudioResult>;
  getHealth(): Promise<{ status: "healthy" | "degraded" | "unavailable"; latencyMs?: number; message?: string }>;
  getProviderInfo(): TTSProviderInfo;
}
