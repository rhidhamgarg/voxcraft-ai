"use client";

import { useRef } from "react";
import { Check, Sparkles, Zap, Shield, Heart, ArrowRight, Volume2, MicVocal, Download } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGsapContext } from "@/hooks/use-gsap";
import { gsap, MOTION } from "@/lib/gsap";

export default function PlatformOverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance
  useGsapContext(
    () => {
      const tl = gsap.timeline({ defaults: { ease: MOTION.ease.smooth } });
      tl.fromTo(
        ".gsap-pricing-header",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45 }
      )
        .fromTo(
          ".gsap-pricing-card",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          "-=0.2"
        );
    },
    containerRef,
    []
  );

  const capabilities = [
    {
      id: "voices",
      icon: Volume2,
      name: "All 23 Neural Voices",
      badge: "100% Free",
      description: "Full access to all 23 official Kokoro-82M voice weights across American and British accents.",
      features: [
        "7 American Female voices (Heart, Bella, Nicole...)",
        "8 American Male voices (Adam, Echo, Fenrir...)",
        "4 British Female voices (Emma, Isabella...)",
        "4 British Male voices (George, Lewis...)",
        "Zero token limits or voice paywalls",
      ],
      cta: "Explore Voices",
      href: "/studio/voices",
    },
    {
      id: "cloning",
      icon: MicVocal,
      name: "Voice Cloning (IVC & PVC)",
      badge: "Fully Unlocked",
      description: "Extract zero-shot latent acoustic embeddings from your microphone or clean WAV samples.",
      features: [
        "Instant Voice Cloning (15s sample required)",
        "Professional Foundation fine-tuning profile",
        "Lossless latent acoustic extraction",
        "Private roster saved to your local studio",
        "No paid tier or upgrade gating",
      ],
      cta: "Clone a Voice",
      href: "/studio/cloning",
    },
    {
      id: "studio",
      icon: Zap,
      name: "Local Kokoro Engine",
      badge: "Sub-Second Latency",
      description: "Direct FastAPI microservice pipeline running locally on your hardware with 24kHz fidelity.",
      features: [
        "Real-time synthesis in ~300ms",
        "24,000 Hz high-fidelity neural vocoder",
        "Lossless WAV base64 audio downloads",
        "Contextual inline emotion tags",
        "Persistent generation history",
      ],
      cta: "Launch Studio",
      href: "/studio",
    },
    {
      id: "license",
      icon: Shield,
      name: "Commercial & Creator Rights",
      badge: "Attribution Free",
      description: "Generate speech for commercial products, podcasts, games, and YouTube without license fees.",
      features: [
        "Permissive Apache 2.0 open-weights foundation",
        "Unlimited generation for personal and commercial use",
        "No subscription fees or recurring costs",
        "No credit card or billing details required",
        "Complete freedom and data privacy",
      ],
      cta: "Start Synthesizing",
      href: "/studio",
    },
  ];

  return (
    <div ref={containerRef}>
      <PageContainer>
        {/* Header */}
        <div className="gsap-pricing-header text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="steel" className="text-xs px-2.5 py-0.5">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-steelblue" />
              100% Free & Open Access
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold tracking-tighter text-foreground">
            Neural Voice Generation for Everyone
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            VoxCraft AI is completely free to use. All 23 neural voices, speech synthesis, and cloning tools are available out-of-the-box with zero subscriptions, credit limits, or paid plan restrictions.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="gsap-pricing-card flex flex-col justify-between border-border hover:border-foreground/30 transition-all shadow-xs"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="steel" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-heading font-semibold tracking-tight">{item.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 flex-1 border-t border-border/40 pt-3">
                  {item.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-steelblue shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feat}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/40">
                  <Button asChild variant="outline" className="w-full text-xs font-medium">
                    <Link href={item.href} className="flex items-center justify-center gap-1.5">
                      <span>{item.cta}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Community Banner */}
        <Card className="mt-8 p-6 bg-muted/20 border-border/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="font-heading font-semibold text-base tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <Heart className="w-4 h-4 text-destructive fill-destructive" />
                <span>Powered by Open-Weights Kokoro-82M</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Enjoy unconstrained generative audio synthesis running directly on your machine without external cloud dependencies.
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 gap-1.5">
              <Link href="/studio">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Speech Studio</span>
              </Link>
            </Button>
          </div>
        </Card>
      </PageContainer>
    </div>
  );
}
