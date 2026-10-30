import { GenerationHistoryItem } from "@/types";

declare global {
  var __voxcraft_history__: GenerationHistoryItem[] | undefined;
}

export const globalHistoryStore: GenerationHistoryItem[] =
  globalThis.__voxcraft_history__ || (globalThis.__voxcraft_history__ = []);

export function addGenerationToHistory(item: GenerationHistoryItem) {
  globalHistoryStore.unshift(item);
  if (globalHistoryStore.length > 50) {
    globalHistoryStore.pop();
  }
}

export function getGenerationById(id: string): GenerationHistoryItem | undefined {
  return globalHistoryStore.find((g) => g.id === id);
}

export function removeGeneration(id: string): boolean {
  const index = globalHistoryStore.findIndex((g) => g.id === id);
  if (index !== -1) {
    globalHistoryStore.splice(index, 1);
    return true;
  }
  return false;
}
