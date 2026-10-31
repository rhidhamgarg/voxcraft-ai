export type VoiceCategory = 'narration' | 'conversational' | 'characters' | 'social_media' | 'cloned';

export type VoiceGender = 'male' | 'female' | 'non-binary';

export type ProviderId =
  | 'kokoro'
  | 'elevenlabs'
  | 'google_cloud'
  | 'gemini'
  | 'edge_tts'
  | 'edge'
  | 'google';


export interface Voice {
  id: string; // e.g. "kokoro:af_heart" or "af_heart"
  providerVoiceId: string; // vendor specific ID e.g. "af_heart", "21m00Tcm4TlvDq8ikWAM", "en-US-Journey-F"
  providerId: ProviderId;
  name: string;
  category: VoiceCategory;
  gender: VoiceGender;
  languageCode: string; // e.g. "en-US", "en-GB", "es-ES", "ja-JP"
  languageName: string;
  accent: string;
  description: string;
  avatarUrl?: string;
  previewUrl: string;
  sampleText: string;
  tags: string[];
  supportedSettings: ('speed' | 'stability' | 'similarity' | 'style' | 'pitch' | 'emotion')[];
  isCloned?: boolean;
  isPremium?: boolean;
}

export interface ProviderModelInfo {
  id: string;
  name: string;
  description: string;
  sampleRate: number;
  languages: string[];
  latencyDescription: string;
}

export interface TTSProviderInfo {
  id: ProviderId;
  name: string;
  shortName: string;
  description: string;
  badge: string;
  providerType: 'local' | 'cloud';
  isConfigured: boolean;
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
  models: ProviderModelInfo[];
  supportedSettings: ('speed' | 'stability' | 'similarity' | 'style' | 'pitch' | 'emotion')[];
  voiceCount: number;
}

export interface GenerationSettings {
  speed: number; // 0.5 - 2.0 (Common)
  stability?: number; // 0.0 - 1.0 (ElevenLabs, Kokoro)
  similarity?: number; // 0.0 - 1.0 (ElevenLabs)
  styleExaggeration?: number; // 0.0 - 1.0 (ElevenLabs)
  pitch?: number; // -20.0 to +20.0 (Google Cloud)
  emotionInstruction?: string; // (Gemini Multimodal)
}

export interface GenerationHistoryItem {
  id: string;
  text: string;
  voice: Voice;
  providerId: ProviderId;
  providerName: string;
  modelId: string;
  settings: GenerationSettings;
  audioUrl: string;
  audioFormat: string;
  durationSeconds: number;
  characterCount: number;
  createdAt: string;
}

export interface UserCredits {
  balance: number;
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'enterprise';
  resetsAt: string;
  totalUsed: number;
}
