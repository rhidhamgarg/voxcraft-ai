# Audit Report: Current AI Voice Generation Architecture

**Date:** 2026-10-31  
**Project:** VoxCraft AI SaaS  
**Author:** Senior AI Systems Architect  
**Objective:** Thorough baseline audit of the existing single-model TTS integration prior to multi-provider expansion.

---

## 1. Current TTS Provider & Inference Model

### 1.1 Integrated Provider
- **Provider Name:** Kokoro-82M (Open-Weights Neural Text-to-Speech)
- **Deployment Mode:** Self-hosted local microservice.
- **Model Architecture:** StyleTTS 2 and ISTFTNet backbone with 82 million parameters, producing 24,000 Hz high-fidelity single-channel WAV audio.
- **License:** Apache 2.0 (Permissive open weights for commercial and personal usage).

### 1.2 Microservice Bridge Architecture
- **Daemon Process:** FastAPI microservice (`python/kokoro_server.py`) running on `http://127.0.0.1:8880`.
- **In-Memory Cache:** Python `KPipeline` instances cached globally per language code (`lang_code='a'` for American English, `'b'` for British English).
- **Fallback Execution:** CLI script fallback (`python/synthesize.py`) spawned via Node.js child processes if the HTTP daemon is unreachable.
- **Latency Benchmark:** Mean inference time of 300ms–850ms for typical prompts (sub-second synthesis).

### 1.3 Active Voices & Roster
The system currently provides **23 official Kokoro-82M neural voices**:
- **American English Female (7 voices):**
  - `af_heart` (Flagship Conversational), `af_bella` (Friendly), `af_nicole` (Direct/Social), `af_aoede` (Melodic Audiobooks), `af_kore` (Dynamic Characters), `af_sarah` (Studio Documentary), `af_sky` (Ethereal Ambient).
- **American English Male (8 voices):**
  - `am_adam` (Deep Baritone), `am_michael` (Executive Broadcast), `am_echo` (Commercial Resonant), `am_eric` (Casual Conversational), `am_fenrir` (Gritty Warrior), `am_liam` (Natural Vlog), `am_onyx` (Deep Bass Trailer), `am_puck` (Playful Animation).
- **British English Female (4 voices):**
  - `bf_emma` (RP British Luxury), `bf_isabella` (Classic London), `bf_alice` (Oxford Academic), `bf_lily` (Gentle Storyteller).
- **British English Male (4 voices):**
  - `bm_george` (Aristocratic BBC), `bm_lewis` (Modern London), `bm_fable` (Enigmatic Bard), `bm_daniel` (Precise Documentary).

---

## 2. API Routes & Generation Logic

### 2.1 Existing Endpoints
| Endpoint | Method | Functionality |
| :--- | :--- | :--- |
| `/api/tts/generate` | `POST` | Primary synthesis endpoint. Resolves voice, validates character limits (5,000 max), invokes provider, stores generation item in memory, and returns base64 WAV. |
| `/api/tts/preview` | `GET` | Streams audio previews per voice ID (`?voice=...`) with server-side in-memory caching. |
| `/api/tts/stream` | `POST` | Streaming synthesis endpoint returning raw audio byte buffer with headers. |
| `/api/voices` | `GET` | Returns list of available voices with query filtering by `category` and `search`. |
| `/api/voices/clone` | `POST` | Instant (IVC) and Professional (PVC) voice cloning endpoint with audio sample verification. |
| `/api/history` | `GET`, `DELETE` | Retrieves generation history or deletes specific items. |
| `/api/user/credits` | `GET`, `POST` | Telemetry endpoint tracking character deductions. |

### 2.2 Audio Generation & Storage Pipeline
1. **Client Request:** Frontend sends `{ text, voiceId, settings, modelId }`.
2. **Provider Dispatch:** `VoiceProviderFactory.getActiveProvider()` routes to `KokoroVoiceProvider`.
3. **Synthesis:** FastAPI returns raw 24kHz WAV binary.
4. **Serialization:** Node.js converts the binary buffer into a Data URI (`data:audio/wav;base64,...`).
5. **Storage:** Stored in runtime session memory (`globalHistoryStore`).
6. **Delivery:** Client mounts audio in HTML5 Audio / Wavesurfer engine (`AudioWaveformPlayer`).

---

## 3. Database & State Architecture

### 3.1 Runtime In-Memory Stores
- `src/lib/history-store.ts`: Stores the 50 most recent audio generations in `globalThis.__voxcraft_history__`.
- `src/lib/cloned-store.ts`: In-memory store for cloned voice metadata.
- `src/lib/transaction-store.ts`: Logs credit usage events.

### 3.2 Relational PostgreSQL Specification
Defined in `docs/database-schema.md` for production Supabase deployment:
- `profiles` (User subscriptions & credit balance)
- `voice_presets` (System-wide catalogue with `provider` and `provider_voice_id`)
- `audio_generations` (Prompts, settings snapshots, storage URLs, durations, provider attribution)
- `credit_transactions` (Audit ledger)
- `user_cloned_voices` (Custom voice embeddings)

---

## 4. Frontend Component Audit

1. **Dashboard Overview (`src/app/page.tsx`):**
   - Quick speech playground with 8 quick-switch voice pills.
   - Audio waveform player with real-time playback.
   - GSAP entrance animations for metrics, sandbox, and workflow cards.
2. **TTS Studio (`src/app/studio/page.tsx`):**
   - Voice selector dropdown (grouped by accent & gender).
   - Quick-pick voice switcher.
   - Script textarea with inline emotion chips (`[softly]`, `[whispers]`, `[laughs]`).
   - Generation settings drawer (Speed, Stability, Similarity, Style Exaggeration).
   - Active waveform visualizer with WAV download.
   - Generation history list with copy prompt, download, and delete actions.
3. **Voice Library (`src/app/studio/voices/page.tsx`):**
   - 23 cards with tags, gender, accent, description.
   - Category and gender filter toolbar.
   - Audio preview buttons using `/api/tts/preview`.
4. **Voice Selector Modal (`src/components/VoiceSelectorModal.tsx`):**
   - Modal dialog for browsing, filtering, and selecting voices from within the Studio.

---

## 5. Architectural Requirements for Multi-Provider Upgrade

### Features That Must Be Preserved:
1. **Existing Kokoro-82M Provider:** Must remain fully operational as the primary self-hosted, zero-cost, privacy-first option.
2. **All 23 Kokoro Voices:** Must remain available without regressions.
3. **Waveform Visualizer & Audio Player:** Must support playback across all providers regardless of whether audio format is WAV, MP3, or Opus.
4. **Design Integrity:** Charcoal (`#17191F`), warm ivory (`#EEECE5`), and muted steel blue (`#52677D`) palette with GSAP motion design.
5. **Lossless Download & History:** Must allow downloading generated audio across all providers.

### Technical Gaps in Current System:
1. **Hardcoded Provider Assumption:** `Voice` interface does not carry `provider` ID, `providerVoiceId`, or `supportedSettings`.
2. **Provider Selection UX Missing:** The user cannot select between multiple providers (e.g. Kokoro vs. Google Gemini vs. ElevenLabs vs. Cloud TTS).
3. **Static Voice Settings:** Studio shows settings that may not apply to all providers (e.g., ElevenLabs uses `stability` & `similarity_boost`, while Google Cloud uses `pitch` and `speakingRate`).
4. **Missing Provider Capabilities Negotiation:** No API endpoint exists to query provider metadata, health, or model options.
