export type VoiceCategory = 'narration' | 'conversational' | 'characters' | 'social_media' | 'cloned';

export type VoiceGender = 'male' | 'female' | 'non-binary';

export interface Voice {
  id: string;
  name: string;
  category: VoiceCategory;
  gender: VoiceGender;
  accent: string;
  description: string;
  avatarUrl?: string;
  previewUrl: string;
  sampleText: string;
  tags: string[];
  isCloned?: boolean;
  isPremium?: boolean;
}

export interface GenerationSettings {
  stability: number; // 0.0 - 1.0
  similarity: number; // 0.0 - 1.0
  styleExaggeration: number; // 0.0 - 1.0
  speed: number; // 0.5 - 2.0
}

export interface GenerationHistoryItem {
  id: string;
  text: string;
  voice: Voice;
  settings: GenerationSettings;
  audioUrl: string;
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
