import { IVoiceProvider, SynthesizeOptions, SynthesizedAudioResult } from "./voice-provider.interface";
import { Voice } from "@/types";
import { DEFAULT_VOICES } from "../voice-catalog";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export class KokoroVoiceProvider implements IVoiceProvider {
  readonly id = "kokoro";
  readonly name = "Kokoro-82M Neural TTS (Open-Weights)";
  readonly isConfigured = true;

  private serviceUrl = process.env.KOKORO_SERVICE_URL || "http://127.0.0.1:8880";
  private pythonPath = path.resolve(process.cwd(), "kokoro_env", "Scripts", "python.exe");
  private fallbackScript = path.resolve(process.cwd(), "python", "synthesize.py");

  private resolveVoiceId(voiceId: string): string {
    if (
      voiceId.startsWith("af_") ||
      voiceId.startsWith("am_") ||
      voiceId.startsWith("bf_") ||
      voiceId.startsWith("bm_")
    ) {
      return voiceId;
    }

    const mapping: Record<string, string> = {
      "vox-aura-elise": "af_heart",
      "vox-aura-marcus": "am_adam",
      "vox-aura-sora": "af_bella",
      "vox-aura-caleb": "am_echo",
      "vox-aura-sophia": "af_nicole",
      "vox-aura-vikram": "am_michael",
      "vox-aura-orion": "am_onyx",
      "vox-aura-clara": "bf_emma",
    };

    return mapping[voiceId] || "af_heart";
  }

  async getVoices(): Promise<Voice[]> {
    return DEFAULT_VOICES;
  }

  async synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    const { text, voice, settings } = options;
    const targetVoice = this.resolveVoiceId(voice.id);
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
          durationSeconds: parseFloat(durationSeconds.toFixed(2)),
        };
      }
    } catch {
      // Microservice offline or timeout - fallback to CLI execution
      console.log(`[KokoroProvider] Service at ${this.serviceUrl} unreachable, falling back to CLI...`);
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
        return reject(new Error(`Kokoro Python virtualenv not found at ${this.pythonPath}`));
      }

      const tempDir = path.resolve(process.cwd(), "public", "audio");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const outputFile = path.resolve(
        tempDir,
        `kokoro_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`
      );

      const pyProcess = spawn(this.pythonPath, [this.fallbackScript], {
        env: {
          ...process.env,
          VIRTUAL_ENV: path.resolve(process.cwd(), "kokoro_env"),
          HF_HUB_DISABLE_SYMLINKS_WARNING: "1",
        },
      });

      const payload = JSON.stringify({
        text,
        voice,
        speed,
        output_path: outputFile,
      });

      let stderr = "";
      pyProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pyProcess.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(`Kokoro CLI inference failed (exit code ${code}): ${stderr}`));
        }

        try {
          if (!fs.existsSync(outputFile)) {
            return reject(new Error("Kokoro CLI did not generate output file"));
          }

          const buffer = fs.readFileSync(outputFile);
          // 24000 samples/sec * 2 bytes/sample (16-bit mono) = 48000 bytes/sec
          const durationSeconds = Math.max(0.5, (buffer.length - 44) / 48000);

          try {
            fs.unlinkSync(outputFile);
          } catch {
            // ignore
          }

          resolve({
            audioBuffer: buffer,
            contentType: "audio/wav",
            providerUsed: `${this.name} (${voice} - CLI)`,
            durationSeconds: parseFloat(durationSeconds.toFixed(2)),
          });
        } catch (readErr) {
          reject(readErr);
        }
      });

      pyProcess.stdin.write(payload);
      pyProcess.stdin.end();
    });
  }

  async getHealth() {
    try {
      const res = await fetch(`${this.serviceUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return { status: "healthy" as const, latencyMs: 25 };
      }
    } catch {
      // ignore
    }
    return { status: "degraded" as const, latencyMs: 250 };
  }
}
