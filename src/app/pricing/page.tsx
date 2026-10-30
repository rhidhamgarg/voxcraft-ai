"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight, Coins } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Explore generative voice synthesis and build initial prototypes.",
      credits: "10,000 credits/mo (~10 mins)",
      features: [
        "Text to Speech & Speech to Text",
        "Access to standard voice library",
        "API access with standard rate limits",
        "3 Projects in Studio",
        "Non-commercial attribution required",
      ],
      cta: "Current Plan",
      isPopular: false,
    },
    {
      id: "starter",
      name: "Starter",
      originalPrice: "$6",
      price: isAnnual ? "$4" : "$5",
      period: "/ month",
      promoText: "First month $1 promo",
      description: "For creators publishing video content, podcasts, and social clips.",
      credits: "30,000 credits/mo (~30 mins)",
      features: [
        "Everything in Free, plus:",
        "Commercial License included",
        "Instant Voice Cloning (IVC)",
        "20 Projects in Studio",
        "Standard support",
      ],
      cta: "Choose Starter",
      isPopular: false,
    },
    {
      id: "creator",
      name: "Creator",
      originalPrice: "$22",
      price: isAnnual ? "$18" : "$22",
      period: "/ month",
      promoText: "First month 50% off",
      description: "For professional creators, game devs, and growing content channels.",
      credits: "121,000 credits/mo (~2 hours)",
      features: [
        "Everything in Starter, plus:",
        "Professional Voice Cloning (PVC)",
        "Additional credit top-ups enabled",
        "Higher concurrency limits",
        "Priority generation queue",
      ],
      cta: "Choose Creator",
      isPopular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: isAnnual ? "$79" : "$99",
      period: "/ month",
      description: "For studios, audiobook publishers, and high-volume audio production.",
      credits: "600,000 credits/mo (~10 hours)",
      features: [
        "Everything in Creator, plus:",
        "24kHz / 44.1kHz lossless WAV output",
        "Elevated API concurrency",
        "Unlimited Studio projects",
        "Dedicated account manager",
      ],
      cta: "Choose Pro",
      isPopular: false,
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Predictable Pricing for Neural Voice Generation
        </h1>
        <p className="text-sm text-muted-foreground">
          Start for free, test locally with Kokoro-82M, and scale seamlessly with dedicated GPU inference clusters.
        </p>

        {/* Billing Switcher */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <span
            className={`text-xs font-medium cursor-pointer ${
              !isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-11 h-6 rounded-full bg-muted border border-border p-0.5 transition-colors relative cursor-pointer"
          >
            <div
              className={`w-4 h-4 rounded-full bg-primary transition-transform ${
                isAnnual ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
              isAnnual ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
            onClick={() => setIsAnnual(true)}
          >
            Annual Billing
            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col justify-between relative ${
              plan.isPopular ? "border-primary shadow-md" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="text-[10px] px-2.5 py-0.5">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
              <div className="pt-3 pb-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 font-mono">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{plan.credits}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 flex-1 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Features included:
              </p>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-4 border-t border-border/40">
              <Button
                asChild
                variant={plan.isPopular ? "default" : "outline"}
                className="w-full text-xs font-medium"
              >
                <Link href="/studio">{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
