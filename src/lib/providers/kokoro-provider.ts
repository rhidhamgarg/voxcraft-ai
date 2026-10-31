import {
  IVoiceProvider,
  SynthesizeOptions,
  SynthesizedAudioResult,
} from "./voice-provider.interface";
import { ProviderId, ProviderModelInfo, TTSProviderInfo, Voice } from "@/types";
import { KOKORO_VOICES } from "../voice-catalog";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export class KokoroVoiceProvider implements IVoiceProvider {
  readonly id: ProviderId = "kokoro";
  readonly name = "Kokoro-82M Neural TTS";
  readonly shortName = "Kokoro 82M";
  readonly description = "Open-weights neural vocoder running locally on your hardware at 24,000 Hz with sub-second latency.";
  readonly badge = "Local Open Weights · 100% Free";
  readonly providerType = "local" as const;
  readonly isConfigured = true;
  readonly requiresApiKey = false;
  readonly supportedSettings: ("speed" | "stability")[] = ["speed", "stability"];

  private serviceUrl = process.env.KOKORO_SERVICE_URL || "http://127.0.0.1:8880";
  private pythonPath = path.resolve(process.cwd(), "kokoro_env", "Scripts", "python.exe");
  private fallbackScript = path.resolve(process.cwd(), "python", "synthesize.py");

  getModels(): ProviderModelInfo[] {
    return [
      {
        id: "kokoro_82m_v019",
        name: "Kokoro-82M v0.19 (Flagship)",
        description: "82-million parameter StyleTTS 2 architecture with 24kHz ISTFTNet vocoder.",
        sampleRate: 24000,
        languages: ["en-US", "en-GB"],
        latencyDescription: "< 500ms on GPU / ~800ms on CPU",
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
      models: this.getModels(),
      supportedSettings: this.supportedSettings,
      voiceCount: KOKORO_VOICES.length,
    };
  }

  async getVoices(): Promise<Voice[]> {
    return KOKORO_VOICES;
  }

  private cleanVoiceId(voiceId: string): string {
    // Strip "kokoro:" prefix if present
    if (voiceId.startsWith("kokoro:")) {
      return voiceId.replace("kokoro:", "");
    }
    return voiceId;
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    const { text, voice, settings } = options;
    const targetVoice = this.cleanVoiceId(voice.providerVoiceId || voice.id);
    const speed = Math.max(0.5, Math.min(2.0, settings.speed || 1.0));

    // 1. Try FastAPI microservice on localhost:8880 (high speed in-memory pipeline)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${this.serviceUrl}/v1/audio/speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: text,
          voice: targetVoice,
          speed: speed,
          response_format: "wav",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const durationHeader = response.headers.get("X-Audio-Duration");
        const durationSeconds = durationHeader
          ? parseFloat(durationHeader)
          : Math.max(1, text.length / 15);

        return {
          audioBuffer: buffer,
          contentType: "audio/wav",
          providerUsed: `${this.name} (${targetVoice})`,
          providerId: this.id,
          durationSeconds: parseFloat(durationSeconds.toFixed(2)),
          characterCount: text.length,
        };
      }
    } catch {
      // Fall through to CLI execution
      console.log(`[KokoroProvider] Service at ${this.serviceUrl} unreachable, falling back to CLI execution...`);
    }

    // 2. Direct Python process fallback
    try {
      return await this.synthesizeViaCLI(text, targetVoice, speed);
    } catch (err: any) {
      console.warn(`[KokoroProvider] CLI execution failed: ${err.message}.`);
      throw err;
    }
  }

  private synthesizeViaCLI(text: string, voice: string, speed: number): Promise<SynthesizedAudioResult> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.pythonPath)) {
        return reject(new Error(`Python environment not found at: ${this.pythonPath}`));
      }

      const tempOutputFile = path.resolve(
        process.cwd(),
        "tmp",
        `kokoro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.wav`
      );

      const tempDir = path.dirname(tempOutputFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const args = [
        this.fallbackScript,
        "--text",
        text,
        "--voice",
        voice,
        "--speed",
        speed.toString(),
        "--output",
        tempOutputFile,
      ];

      const pyProcess = spawn(this.pythonPath, args, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      });

      let stderr = "";
      pyProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pyProcess.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`Kokoro CLI failed with code ${code}: ${stderr}`));
        }

        try {
          if (!fs.existsSync(tempOutputFile)) {
            return reject(new Error("Kokoro CLI did not generate output audio file."));
          }

          const audioBuffer = fs.readFileSync(tempOutputFile);
          fs.unlinkSync(tempOutputFile);

          const durationSeconds = Math.max(1, text.length / 15);

          resolve({
            audioBuffer,
            contentType: "audio/wav",
            providerUsed: `${this.name} (${voice}) [CLI]`,
            providerId: this.id,
            durationSeconds: parseFloat(durationSeconds.toFixed(2)),
            characterCount: text.length,
          });
        } catch (fileErr) {
          reject(fileErr);
        }
      });
    });
  }

  async getPreview(voiceId: string): Promise<SynthesizedAudioResult> {
    const cleanId = this.cleanVoiceId(voiceId);
    const voice = KOKORO_VOICES.find((v) => v.providerVoiceId === cleanId) || KOKORO_VOICES[0];
    const previewText = voice.sampleText || `Hello! This is ${voice.name} powered by Kokoro-82M neural speech.`;

    return this.synthesizeSpeech({
      text: previewText,
      voice,
      settings: { speed: 1.0, stability: 0.7 },
    });
  }

  async getHealth(): Promise<{ status: "healthy" | "degraded" | "unavailable"; latencyMs?: number; message?: string }> {
    try {
      const start = Date.now();
      const res = await fetch(`${this.serviceUrl}/health`, { signal: AbortSignal.timeout(1500) });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        return { status: "healthy", latencyMs, message: "FastAPI Daemon Active" };
      }
      return { status: "degraded", latencyMs, message: "Daemon returned non-200, CLI fallback ready" };
    } catch {
      if (fs.existsSync(this.pythonPath)) {
        return { status: "degraded", message: "Daemon offline, direct Python CLI fallback ready" };
      }
      return { status: "unavailable", message: "Kokoro python environment missing" };
    }
  }
}
