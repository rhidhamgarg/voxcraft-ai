import { GenerationSettings, ProviderId, TTSProviderInfo, Voice } from "@/types";
import { VoiceProviderRegistry } from "./providers/provider-registry";
import { SynthesizeOptions, SynthesizedAudioResult } from "./providers/voice-provider.interface";

export async function synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
  const registry = VoiceProviderRegistry.getInstance();
  return registry.synthesize(options);
}

export function getActiveProviderInfo(): { id: ProviderId; name: string; isConfigured: boolean } {
  const provider = VoiceProviderRegistry.getInstance().getActiveProvider();
  return {
    id: provider.id,
    name: provider.name,
    isConfigured: provider.isConfigured,
  };
}

export function getAllProvidersInfo(): TTSProviderInfo[] {
  return VoiceProviderRegistry.getInstance().getProvidersInfo();
}

export async function getProviderPreview(providerId: ProviderId, voiceId: string): Promise<SynthesizedAudioResult> {
  return VoiceProviderRegistry.getInstance().getPreview(providerId, voiceId);
}
