import { GenerationSettings, Voice } from "@/types";
import { generateSynthesizedWavBuffer } from "./audio-synth";

export interface SynthesizeOptions {
  text: string;
  voice: Voice;
  settings: GenerationSettings;
  modelId?: string;
}

export async function synthesizeSpeech(options: SynthesizeOptions): Promise<{
  audioBuffer: Buffer;
  contentType: string;
  providerUsed: string;
  durationSeconds: number;
}> {
  const { text, voice, settings } = options;
  const provider = process.env.AI_VOICE_PROVIDER || "mock";
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  // 1. If configured to use ElevenLabs and key is present
  if (provider === "elevenlabs" && elevenLabsKey) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsKey,
          },
          body: JSON.stringify({
            text,
            model_id: options.modelId || "eleven_turbo_v2_5",
            voice_settings: {
              stability: settings.stability,
              similarity_boost: settings.similarity,
              style: settings.styleExaggeration,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const words = text.trim().split(/\s+/).length;
        const estDuration = Math.max(2, words / 2.5);
        return {
          audioBuffer: Buffer.from(arrayBuffer),
          contentType: "audio/mpeg",
          providerUsed: "ElevenLabs API",
          durationSeconds: estDuration,
        };
      } else {
        console.warn("ElevenLabs API returned non-OK status, falling back to local synthesis:", response.statusText);
      }
    } catch (err) {
      console.error("ElevenLabs API invocation error:", err);
    }
  }

  // 2. High-fidelity in-memory synthesis fallback
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
    providerUsed: "VoxCraft Neural Vocoder (Local)",
    durationSeconds: parseFloat(duration.toFixed(2)),
  };
}
