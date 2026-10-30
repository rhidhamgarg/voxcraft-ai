import { IVoiceProvider } from "./voice-provider.interface";
import { DeepgramAuraProvider } from "./deepgram-provider";
import { ElevenLabsProvider } from "./elevenlabs-provider";
import { OpenAITTSProvider } from "./openai-provider";
import { LocalVocoderProvider } from "./local-vocoder-provider";
import { KokoroVoiceProvider } from "./kokoro-provider";

export class VoiceProviderFactory {
  private static providers: Map<string, IVoiceProvider> = new Map();

  private static initialize() {
    if (this.providers.size === 0) {
      const kokoro = new KokoroVoiceProvider();
      const local = new LocalVocoderProvider();
      const deepgram = new DeepgramAuraProvider();
      const elevenlabs = new ElevenLabsProvider();
      const openai = new OpenAITTSProvider();

      this.providers.set(kokoro.id, kokoro);
      this.providers.set(local.id, local);
      this.providers.set(deepgram.id, deepgram);
      this.providers.set(elevenlabs.id, elevenlabs);
      this.providers.set(openai.id, openai);
    }
  }

  public static getActiveProvider(): IVoiceProvider {
    this.initialize();

    const preferred = (process.env.AI_VOICE_PROVIDER || "kokoro").toLowerCase();

    // 1. If explicit provider requested and configured
    if (preferred === "kokoro" && this.providers.get("kokoro")?.isConfigured) {
      return this.providers.get("kokoro")!;
    }
    if (preferred === "deepgram" && this.providers.get("deepgram")?.isConfigured) {
      return this.providers.get("deepgram")!;
    }
    if (preferred === "elevenlabs" && this.providers.get("elevenlabs")?.isConfigured) {
      return this.providers.get("elevenlabs")!;
    }
    if (preferred === "openai" && this.providers.get("openai")?.isConfigured) {
      return this.providers.get("openai")!;
    }
    if (preferred === "local_vocoder" || preferred === "mock") {
      return this.providers.get("local_vocoder")!;
    }

    // 2. Default priority: Kokoro 82M open-weights engine
    if (this.providers.get("kokoro")?.isConfigured) {
      return this.providers.get("kokoro")!;
    }

    // 3. Fallback to cloud providers if configured
    if (this.providers.get("deepgram")?.isConfigured) {
      return this.providers.get("deepgram")!;
    }
    if (this.providers.get("elevenlabs")?.isConfigured) {
      return this.providers.get("elevenlabs")!;
    }
    if (this.providers.get("openai")?.isConfigured) {
      return this.providers.get("openai")!;
    }

    // 4. In-memory synthesizer fallback
    return this.providers.get("local_vocoder")!;
  }

  public static getAllProviders(): IVoiceProvider[] {
    this.initialize();
    return Array.from(this.providers.values());
  }
}
