import { IVoiceProvider } from "./voice-provider.interface";
import { DeepgramAuraProvider } from "./deepgram-provider";
import { ElevenLabsProvider } from "./elevenlabs-provider";
import { OpenAITTSProvider } from "./openai-provider";
import { LocalVocoderProvider } from "./local-vocoder-provider";

export class VoiceProviderFactory {
  private static providers: Map<string, IVoiceProvider> = new Map();

  private static initialize() {
    if (this.providers.size === 0) {
      const local = new LocalVocoderProvider();
      const deepgram = new DeepgramAuraProvider();
      const elevenlabs = new ElevenLabsProvider();
      const openai = new OpenAITTSProvider();

      this.providers.set(local.id, local);
      this.providers.set(deepgram.id, deepgram);
      this.providers.set(elevenlabs.id, elevenlabs);
      this.providers.set(openai.id, openai);
    }
  }

  public static getActiveProvider(): IVoiceProvider {
    this.initialize();

    const preferred = (process.env.AI_VOICE_PROVIDER || "mock").toLowerCase();

    // 1. If explicit provider requested and configured
    if (preferred === "deepgram" && this.providers.get("deepgram")?.isConfigured) {
      return this.providers.get("deepgram")!;
    }
    if (preferred === "elevenlabs" && this.providers.get("elevenlabs")?.isConfigured) {
      return this.providers.get("elevenlabs")!;
    }
    if (preferred === "openai" && this.providers.get("openai")?.isConfigured) {
      return this.providers.get("openai")!;
    }

    // 2. Auto-detect any configured cloud provider
    if (this.providers.get("deepgram")?.isConfigured) {
      return this.providers.get("deepgram")!;
    }
    if (this.providers.get("elevenlabs")?.isConfigured) {
      return this.providers.get("elevenlabs")!;
    }
    if (this.providers.get("openai")?.isConfigured) {
      return this.providers.get("openai")!;
    }

    // 3. High-fidelity in-memory embedded synthesizer fallback
    return this.providers.get("local_vocoder")!;
  }

  public static getAllProviders(): IVoiceProvider[] {
    this.initialize();
    return Array.from(this.providers.values());
  }
}
