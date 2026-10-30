"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight, Coins } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [minutesUsage, setMinutesUsage] = useState(60);

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
        "API access with rate limits",
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
        "Dubbing Studio access",
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
        "44.1kHz uncompressed PCM WAV output",
        "192kbps studio audio exports",
        "Elevated API concurrency",
        "Unlimited Studio projects",
        "Priority VIP support",
      ],
      cta: "Choose Pro",
      isPopular: false,
    },
  ];

  // Dynamic recommendation based on slider
  const recommendedPlan =
    minutesUsage <= 10 ? "Free" : minutesUsage <= 30 ? "Starter" : minutesUsage <= 120 ? "Creator" : "Pro";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/30">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>FLEXIBLE TRANSPARENT PRICING</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Scale your voice production effortlessly
        </h1>
        <p className="text-sm sm:text-base text-surface-400 leading-relaxed">
          From independent creators to global enterprise studios, choose a plan tailored to your generative audio demands.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs sm:text-sm font-medium ${!isAnnual ? "text-white" : "text-surface-400"}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-surface-800 p-1 relative border border-surface-700 transition-colors"
          >
            <div
              className={`w-4 h-4 rounded-full gradient-brand transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-medium ${isAnnual ? "text-white" : "text-surface-400"}`}>
            Annual Billing <span className="text-[11px] font-bold text-emerald-400 font-mono">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-panel p-6 rounded-2xl flex flex-col justify-between border relative transition-all ${
              plan.isPopular
                ? "border-brand-500 bg-brand-500/10 shadow-xl shadow-brand-500/15"
                : "border-surface-800 hover:border-surface-700"
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500 text-white shadow-md">
                Most Popular
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                {plan.promoText && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {plan.promoText}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">{plan.price}</span>
                <span className="text-xs text-surface-400">{plan.period}</span>
              </div>

              <p className="text-xs text-surface-400 mb-4 min-h-[32px]">{plan.description}</p>

              <div className="p-2.5 rounded-xl bg-surface-900/80 border border-surface-800 text-xs font-mono text-brand-300 mb-6 flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{plan.credits}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-surface-300 mb-6">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/studio"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all ${
                plan.isPopular
                  ? "gradient-brand text-white hover:brightness-110 shadow-md shadow-brand-500/30"
                  : "bg-surface-800 text-surface-200 hover:bg-surface-700 hover:text-white border border-surface-700"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Interactive Usage Calculator */}
      <div className="glass-panel p-8 rounded-3xl border border-surface-700/80 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Interactive Usage Estimator</h3>
            <p className="text-xs text-surface-400">Slide to estimate your monthly audio requirements</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-surface-900 border border-surface-800 flex items-center gap-2 text-xs">
            <span className="text-surface-400">Recommended:</span>
            <span className="font-bold text-brand-400">{recommendedPlan} Tier</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-surface-300">
            <span>Estimated Generation Time</span>
            <span className="text-base font-bold text-white">{minutesUsage} Minutes / Month</span>
          </div>
          <input
            type="range"
            min="5"
            max="600"
            step="5"
            value={minutesUsage}
            onChange={(e) => setMinutesUsage(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
          <div className="flex justify-between text-[11px] font-mono text-surface-500">
            <span>5 mins</span>
            <span>60 mins (1 hr)</span>
            <span>300 mins (5 hrs)</span>
            <span>600 mins (10 hrs)</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6 pt-8">
        <h2 className="text-2xl font-bold text-white text-center tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-surface-800 space-y-2">
            <h4 className="text-sm font-semibold text-white">Do I own the commercial rights to generated speech?</h4>
            <p className="text-xs text-surface-400 leading-relaxed">
              Yes. All audio generated under Starter, Creator, Pro, and Enterprise tiers includes a worldwide commercial license for YouTube, podcasts, games, ads, and broadcast.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-800 space-y-2">
            <h4 className="text-sm font-semibold text-white">How does Instant Voice Cloning work?</h4>
            <p className="text-xs text-surface-400 leading-relaxed">
              Instant Voice Cloning (IVC) extracts acoustic speaker latent embeddings from a 15–60 second sample. It does not train a full model from scratch, so it is ready within seconds.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-800 space-y-2">
            <h4 className="text-sm font-semibold text-white">Can I cancel or change my plan anytime?</h4>
            <p className="text-xs text-surface-400 leading-relaxed">
              Absolutely. Subscriptions are billed month-to-month and can be paused or cancelled at any time directly from your billing settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
