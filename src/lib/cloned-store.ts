import { Voice } from "@/types";

declare global {
  var __voxcraft_cloned_voices__: Voice[] | undefined;
}

export const clonedVoicesStore: Voice[] =
  globalThis.__voxcraft_cloned_voices__ || (globalThis.__voxcraft_cloned_voices__ = []);
