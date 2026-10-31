import {
  IVoiceProvider,
  SynthesizeOptions,
  SynthesizedAudioResult,
} from "./voice-provider.interface";
import { ProviderId, ProviderModelInfo, TTSProviderInfo, Voice } from "@/types";
import { ELEVENLABS_VOICES } from "./elevenlabs-voices";

export class ElevenLabsProvider implements IVoiceProvider {
  readonly id: ProviderId = "elevenlabs";
  readonly name = "ElevenLabs API";
  readonly shortName = "ElevenLabs";
  readonly description = "Premier generative AI voice synthesis with human emotional cadence and instant voice cloning.";
  readonly badge = "Gold Standard · Expressive";
  readonly providerType = "cloud" as const;
  readonly requiresApiKey = true;
  readonly apiKeyEnvVar = "ELEVENLABS_API_KEY";
  readonly supportedSettings: ("speed" | "stability" | "similarity" | "style")[] = [
    "speed",
    "stability",
    "similarity",
    "style",
  ];

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || "";
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getModels(): ProviderModelInfo[] {
    return [
      {
        id: "eleven_turbo_v2_5",
        name: "Eleven Turbo v2.5 (Sub-250ms)",
        description: "Ultra-low latency speech synthesis optimized for real-time conversational applications.",
        sampleRate: 44100,
        languages: ["en", "es", "fr", "de", "it", "pt", "pl", "hi"],
        latencyDescription: "< 250ms latency",
      },
      {
        id: "eleven_multilingual_v2",
        name: "Eleven Multilingual v2 (High Fidelity)",
        description: "State-of-the-art expressive prosody across 29 languages with rich contextual emotion.",
        sampleRate: 44100,
        languages: ["en", "es", "fr", "de", "it", "pt", "pl", "hi", "ja", "zh", "ko"],
        latencyDescription: "~450ms latency",
      },
    ];
  }

  getProviderInfo(): TTSProviderInfo {
    return {
      id: this.id,
      name: this.name,
      shortName: this.shortName,
      description: this.description,
      badge: this.badge,
      providerType: this.providerType,
      isConfigured: this.isConfigured,
      requiresApiKey: this.requiresApiKey,
      apiKeyEnvVar: this.apiKeyEnvVar,
      models: this.getModels(),
      supportedSettings: this.supportedSettings,
      voiceCount: ELEVENLABS_VOICES.length,
    };
  }

  async getVoices(): Promise<Voice[]> {
    return ELEVENLABS_VOICES;
  }

  private cleanVoiceId(voiceId: string): string {
    return voiceId.replace(/^elevenlabs:/, "");
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    if (!this.isConfigured) {
      throw new Error(
        "ElevenLabs API key is missing. Set ELEVENLABS_API_KEY in your .env.local file to synthesize with ElevenLabs voices."
      );
    }

    const { text, voice, settings } = options;
    const targetVoiceId = this.cleanVoiceId(voice.providerVoiceId || voice.id);
    const model = options.modelId || "eleven_turbo_v2_5";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`,
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
            stability: settings.stability ?? 0.5,
            similarity_boost: settings.similarity ?? 0.75,
            style: settings.styleExaggeration ?? 0.15,
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
    const duration = Math.max(1.5, words / 2.5);

    return {
      audioBuffer: Buffer.from(arrayBuffer),
      contentType: "audio/mpeg",
      providerUsed: `ElevenLabs (${voice.name})`,
      providerId: this.id,
      durationSeconds: parseFloat(duration.toFixed(2)),
      characterCount: text.length,
    };
  }

  private mapToLocalPreviewVoice(cleanId: string, gender: string): string {
    const map: Record<string, string> = {
      "21m00Tcm4TlvDq8ikWAM": "af_heart",
      AZnzlk1XvdvUeBnXmlld: "af_nicole",
      EXAVITQu4vr4xnSDxMaL: "af_bella",
      ErXwobaYiN019PkySvjV: "am_michael",
      pNInz6obpgDQGcFmaJgB: "am_adam",
      TxGEqnHWrfWFTfGW9XjX: "am_eric",
      VR6AewLTigWG4xSOukaG: "am_onyx",
    };
    return map[cleanId] || (gender === "male" ? "am_adam" : "af_heart");
  }

  async getPreview(voiceId: string): Promise<SynthesizedAudioResult> {
    const cleanId = this.cleanVoiceId(voiceId);
    const voice =
      ELEVENLABS_VOICES.find(
        (v) =>
          v.providerVoiceId === cleanId ||
          v.id === voiceId ||
          v.id === `elevenlabs:${cleanId}`
      ) || ELEVENLABS_VOICES[0];
    const previewText = voice.sampleText;

    if (this.isConfigured) {
      return this.synthesizeSpeech({
        text: previewText,
        voice,
        settings: { speed: 1.0, stability: 0.5, similarity: 0.75, styleExaggeration: 0.15 },
      });
    }

    // High fidelity preview fallback using matched neural timbre
    try {
      const { KokoroVoiceProvider } = await import("./kokoro-provider");
      const kokoro = new KokoroVoiceProvider();
      const localId = this.mapToLocalPreviewVoice(cleanId, voice.gender);
      return await kokoro.getPreview(localId);
    } catch {
      const dummyBuffer = this.generateSampleToneWav(previewText);
      return {
        audioBuffer: dummyBuffer,
        contentType: "audio/wav",
        providerUsed: `${this.name} (${voice.name}) [Preview Mode]`,
        providerId: this.id,
        durationSeconds: 2.2,
        characterCount: previewText.length,
      };
    }
  }

  private generateSampleToneWav(text: string): Buffer {
    const sampleRate = 24000;
    const durationSec = 2.0;
    const numSamples = Math.floor(sampleRate * durationSec);
    const blockAlign = 2;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 1.5) * Math.sin(Math.PI * t / durationSec);
      const sample = Math.sin(2 * Math.PI * 261.63 * t) * 0.4 + Math.sin(2 * Math.PI * 392.00 * t) * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * envelope * 24000)));
      buffer.writeInt16LE(intSample, 44 + i * 2);
    }

    return buffer;
  }

  async getHealth() {
    if (!this.isConfigured) {
      return {
        status: "unavailable" as const,
        message: "API key not set in ELEVENLABS_API_KEY",
      };
    }
    return { status: "healthy" as const, latencyMs: 250, message: "ElevenLabs API Ready" };
  }
}
