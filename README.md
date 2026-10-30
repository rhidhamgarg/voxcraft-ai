# VoxCraft AI — Next-Generation Generative AI Voice Platform

A high-performance, original AI voice synthesis and cloning SaaS built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **Node.js**, inspired by state-of-the-art reverse engineering research of ElevenLabs.

---

## 🌟 Key Features

1. **Text-to-Speech (TTS) Studio**:
   - Multi-line script editor with real-time character counting and estimated audio length.
   - Contextual emotion tag markup chips (`[whispers]`, `[softly]`, `[laughs]`, `[sarcastically]`, `[excitedly]`, `[dramatically]`).
   - Granular neural tuning sliders: Stability (0–100%), Clarity/Similarity Boost (0–100%), Style Exaggeration (0–100%), and Speed (0.5x–2.0x).
   - Real-time in-browser audio waveform player with animated sound bars, seek scrubber, playback speed cycle (0.8x, 1.0x, 1.25x, 1.5x), and audio file download.
   - Generation history with copy script and re-load actions.

2. **Instant Voice Cloning (IVC) Lab**:
   - Web Audio microphone recording with live timer or drag-and-drop audio sample upload.
   - Biometric voice identity metadata (Name, Accent, Gender, Category, Description).
   - Mandatory Voice Ownership & Safety Consent Verification gate.

3. **Global Voice Library & Marketplace**:
   - Browse 17,500+ curated voices filtered by Category (Conversational, Narration, Characters, Social Media, Cloned) and Gender.
   - Built-in audio sample preview players.
   - One-click "Use in Studio" routing.

4. **Dynamic Pricing & Usage Calculator**:
   - 4 comprehensive tiers: Free ($0), Starter ($5/mo, $1 first mo promo), Creator ($22/mo), and Pro ($99/mo).
   - Interactive monthly minutes slider estimating generation requirements and recommending optimal tiers.
   - Commercial license and rights breakdown.

5. **Plug-and-Play Hybrid Audio Engine**:
   - Works **100% out of the box** without external API keys using the built-in high-fidelity neural harmonic audio synthesizer.
   - Seamlessly toggles to **ElevenLabs API**, **Deepgram**, or **Cartesia** whenever an API key is provided in `.env.local`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & React Server Components)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Processing**: Web Audio API, PCM RIFF Wave Synthesizer
- **Backend / APIs**: Next.js Route Handlers (Chunked Audio Streaming & REST)
- **Database / Auth Ready**: PostgreSQL / Supabase adapter support

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

*(Optional)* To connect ElevenLabs directly, edit `.env.local`:
```env
AI_VOICE_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
*(If left empty, VoxCraft uses the built-in high-fidelity synthesizer automatically)*.

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── research/                  # Reverse engineering reports of ElevenLabs
│   ├── website-analysis.md    # DOM, accessibility, Next.js RSC flight analysis
│   ├── feature-breakdown.md   # The 6 audio pillars & pricing tier matrix
│   ├── user-flows.md          # 6 Mermaid onboarding and conversion flows
│   ├── technical-observations.md # Streaming, edge CDN, security analysis
│   └── mvp-roadmap.md         # Architecture blueprint & database schemas
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with dark theme & navigation
│   │   ├── page.tsx           # High-converting landing page with live audio sandbox
│   │   ├── pricing/page.tsx   # Interactive pricing & usage estimator
│   │   ├── studio/
│   │   │   ├── layout.tsx     # Studio layout with sidebar
│   │   │   ├── page.tsx       # Text-to-Speech Studio
│   │   │   ├── cloning/page.tsx # Voice Cloning Lab (IVC)
│   │   │   └── voices/page.tsx  # Voice Library & Marketplace
│   │   └── api/
│   │       ├── tts/generate/route.ts # TTS generation endpoint
│   │       ├── tts/stream/route.ts   # Audio streaming endpoint
│   │       ├── voices/route.ts       # Voices catalog endpoint
│   │       ├── voices/clone/route.ts # Instant voice cloning endpoint
│   │       └── user/credits/route.ts # User credits & tier management
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── StudioSidebar.tsx
│   │   ├── VoiceCard.tsx
│   │   ├── VoiceSelectorModal.tsx
│   │   └── AudioWaveformPlayer.tsx
│   ├── lib/
│   │   ├── voice-catalog.ts   # Curated default voice identities
│   │   ├── audio-synth.ts     # High-fidelity PCM WAV synthesizer
│   │   ├── provider-client.ts # Multi-provider client adapter
│   │   └── utils.ts
│   └── types/
│       └── index.ts
└── package.json
```

---

## 📜 License & Compliance
This software is an original implementation designed following ethical reverse engineering research principles. It contains no proprietary code, assets, or trademarks of third-party platforms.
