import { GenerationSettings, Voice } from "@/types";
import { VoiceProviderFactory } from "./providers/provider-factory";
import { SynthesizeOptions, SynthesizedAudioResult } from "./providers/voice-provider.interface";

export async function synthesizeSpeech(options: SynthesizeOptions): Promise<SynthesizedAudioResult> {
  const provider = VoiceProviderFactory.getActiveProvider();
  return provider.synthesizeSpeech(options);
}

export function getActiveProviderInfo() {
  const provider = VoiceProviderFactory.getActiveProvider();
  return {
    id: provider.id,
    name: provider.name,
    isConfigured: provider.isConfigured,
  };
}
