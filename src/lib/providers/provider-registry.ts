import { ProviderId, TTSProviderInfo, Voice } from "@/types";
import { IVoiceProvider, SynthesizeOptions, SynthesizedAudioResult } from "./voice-provider.interface";
import { KokoroVoiceProvider } from "./kokoro-provider";
import { GoogleCloudTTSProvider } from "./google-tts-provider";
import { ElevenLabsProvider } from "./elevenlabs-provider";
import { EdgeCloudTTSProvider } from "./edge-tts-provider";

export class VoiceProviderRegistry {
  private static instance: VoiceProviderRegistry;
  private providers: Map<ProviderId, IVoiceProvider> = new Map();

  private constructor() {
    this.register(new KokoroVoiceProvider());
    this.register(new GoogleCloudTTSProvider());
    this.register(new ElevenLabsProvider());
    this.register(new EdgeCloudTTSProvider());
  }

  public static getInstance(): VoiceProviderRegistry {
    if (!VoiceProviderRegistry.instance) {
      VoiceProviderRegistry.instance = new VoiceProviderRegistry();
    }
    return VoiceProviderRegistry.instance;
  }

  public register(provider: IVoiceProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: ProviderId | string): IVoiceProvider | undefined {
    const normalized =
      id === "edge" ? "edge_tts" :
      id === "google" || id === "gemini" ? "google_cloud" : id;
    return this.providers.get(normalized as ProviderId);
  }

  public getAllProviders(): IVoiceProvider[] {
    return Array.from(this.providers.values());
  }

  public getActiveProvider(requestedId?: string): IVoiceProvider {
    const prov = requestedId ? this.getProvider(requestedId) : undefined;
    if (prov) return prov;

    const envProvider = (process.env.AI_VOICE_PROVIDER || "kokoro").toLowerCase() as ProviderId;
    const fromEnv = this.getProvider(envProvider);
    if (fromEnv) return fromEnv;

    return this.providers.get("kokoro")!;
  }

  public async getAllVoices(): Promise<Voice[]> {
    const voicesArray: Voice[] = [];
    for (const provider of this.providers.values()) {
      try {
        const v = await provider.getVoices();
        voicesArray.push(...v);
      } catch (err) {
        console.error(`Failed to fetch voices from provider ${provider.id}:`, err);
      }
    }
    return voicesArray;
  }

  public async getVoicesForProvider(providerId: ProviderId): Promise<Voice[]> {
    const provider = this.getProvider(providerId);
    if (!provider) return [];
    return provider.getVoices();
  }

  public async getVoiceById(voiceId: string): Promise<Voice | undefined> {
    const allVoices = await this.getAllVoices();
    return allVoices.find(
      (v) =>
        v.id === voiceId ||
        v.providerVoiceId === voiceId ||
        `${v.providerId}:${v.providerVoiceId}` === voiceId
    );
  }

  public async synthesize(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
    let provider = this.getProvider(options.voice.providerId);
    if (!provider) {
      provider = this.getActiveProvider();
    }
    return provider.synthesizeSpeech(options);
  }

  public async getPreview(providerId: ProviderId, voiceId: string): Promise<SynthesizedAudioResult> {
    const provider = this.getProvider(providerId) || this.getActiveProvider();
    return provider.getPreview(voiceId);
  }

  public getProvidersInfo(): TTSProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => p.getProviderInfo());
  }
}

// Backwards compatibility helper
export class VoiceProviderFactory {
  public static getActiveProvider(): IVoiceProvider {
    return VoiceProviderRegistry.getInstance().getActiveProvider();
  }

  public static getAllProviders(): IVoiceProvider[] {
    return VoiceProviderRegistry.getInstance().getAllProviders();
  }
}
