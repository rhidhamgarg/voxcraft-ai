import { NextResponse } from "next/server";
import { VoiceProviderRegistry } from "@/lib/providers/provider-registry";

export async function GET() {
  const registry = VoiceProviderRegistry.getInstance();
  const providers = registry.getAllProviders();

  const providerList = await Promise.all(
    providers.map(async (p) => {
      const health = await p.getHealth();
      return {
        ...p.getProviderInfo(),
        health,
      };
    })
  );

  return NextResponse.json({
    success: true,
    providers: providerList,
    activeProviderId: registry.getActiveProvider().id,
  });
}
