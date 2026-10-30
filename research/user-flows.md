# End-to-End User Experience & Funnel Flows: ElevenLabs

**Subject:** Architectural mapping of customer acquisition, core application workflows, subscription conversion loops, and developer onboarding.  
**Source Evidence:** Public navigation paths, accessible controls, speculation rules, and authentication gateways observed on [https://elevenlabs.io](https://elevenlabs.io).

---

## 1. Flow 1: Visitor to Free Registered User (Acquisition & Activation)

The onboarding flow is optimized to minimize time-to-first-sound (TTFS) while capturing user intent and securing consent.

```mermaid
flowchart TD
    A[Visitor Lands on Homepage] --> B[Plays Voice Preview in Hero Sandbox]
    B --> C[Clicks 'Sign up' CTA or Test Audio Generate]
    C --> D[Speculative Prerender loads /app/sign-up in Background]
    D --> E[Sign Up Page: Google OAuth or Email/Password]
    E --> F[Consent & Terms Acceptance]
    F --> G[Onboarding Survey: Role, Use Case, Team Size]
    G --> H[Redirect to Speech Synthesis Studio /app/speech-synthesis]
    H --> I[Granted 10,000 Free Monthly Credits]
    I --> J[First Text Input & Speech Generation Completed]
```

### Key Behavioral Design Observations:
1. **Interactive Sandbox Prior to Auth**: Visitors can listen to pre-rendered voice samples directly from the homepage without creating an account.
2. **Sub-second Transition**: The browser uses Chrome Speculation Rules to pre-render `/app/sign-up` upon page load, removing network latency when the user clicks the CTA.
3. **Frictionless Google OAuth**: Deep integration with Google Identity allows 1-click registration (`/app/external-auth/google`).

---

## 2. Flow 2: Free User to Paid Subscriber (Monetization & Conversion)

The conversion trigger occurs whenever a user encounters quota depletion, commercial usage needs, or advanced feature gates.

```mermaid
flowchart TD
    A[Free User Active in Studio] --> B{Encounter Gate Condition}
    
    B -->|Credit Exhaustion| C[Exceeded 10k Monthly Credits]
    B -->|Feature Gating| D[Clicks 'Instant Voice Cloning' or 'Commercial Use']
    B -->|Quality Gating| E[Requests 192kbps / 44.1kHz PCM Export]
    
    C --> F[Modal: 'Upgrade to Keep Generating']
    D --> F
    E --> F
    
    F --> G[Select Plan: Starter $1 First Mo Promo vs. Creator $11 First Mo]
    G --> H[Stripe Checkout / Hosted Payment Gateway]
    H --> I[Payment Webhook Dispatched to Billing Service]
    I --> J[Database Increments User Credit Balance & Unlocks Pro Toggles]
    J --> K[User Seamlessly Resumes Creation Without Page Refresh]
```

### Psychological Conversion Drivers:
- **Aggressive Introductory Pricing**: Offering 83% off Starter ($1) and 50% off Creator ($11) creates an impulsive conversion threshold.
- **Credit Visibility**: Persistent live counter in the sidebar showing remaining credits updates in real time as characters are typed.

---

## 3. Flow 3: Text-to-Speech Generation Pipeline

The central core creation loop used by hundreds of thousands of daily active users.

```mermaid
sequenceDiagram
    autonumber
    actor User as Content Creator
    participant UI as Studio Web Application
    participant State as Local State (React/Zustand)
    participant API as ElevenLabs Backend Router
    participant Engine as TTS Inference Engine
    participant Cache as Edge Audio Storage

    User->>UI: Selects Voice (e.g. "Adam - Conversational")
    User->>UI: Adjusts Sliders (Stability: 0.5, Similarity: 0.75, Style: 0.1)
    User->>UI: Enters Text into Editor with Emotion Tag: "[whispers] The secret is safe."
    User->>UI: Clicks "Generate Speech"
    UI->>State: Validate token count & character balance
    State->>API: POST /v1/text-to-speech/{voice_id}/stream
    API->>Engine: Stream tokens to Neural Vocoder
    Engine-->>API: Stream PCM audio chunks (HTTP Chunked Transfer)
    API-->>UI: Audio Stream received over WebSocket / Fetch Body
    UI-->>User: Web Audio API begins playback on first chunk (sub-300ms)
    Engine->>Cache: Save generated .mp3 buffer to user library
    Cache-->>UI: Generation history item added with Download button (.mp3)
```

---

## 4. Flow 4: Voice Cloning Workflow (IVC vs. PVC)

Contrasting the instant zero-shot embedding flow with the asynchronous model training pipeline.

```mermaid
flowchart TD
    Start[User Navigates to Voice Lab /app/voice-lab] --> Choice{Select Clone Type}
    
    Choice -->|Instant Voice Clone - IVC| IVC_Upload[Upload 1-2 min clean audio sample or record microphone]
    IVC_Upload --> IVC_Name[Assign Voice Name & Category Labels]
    IVC_Name --> IVC_Process[Compute Speaker Latent Embedding Vector]
    IVC_Process --> IVC_Ready[Voice Available Immediately in Dropdown]
    
    Choice -->|Professional Voice Clone - PVC| PVC_Verify[Identity Verification Step]
    PVC_Verify --> PVC_Read[User Reads Dynamic Captcha Script on Mic]
    PVC_Read --> PVC_Match[Biometric Acoustic Voice Match Check]
    PVC_Match -->|Verified| PVC_Dataset[Upload 30+ mins high-fidelity dataset]
    PVC_Match -->|Failed| PVC_Reject[Verification Rejected - Anti-Spoofing Alert]
    PVC_Dataset --> PVC_Queue[Dispatch Model Fine-Tuning Job to GPU Queue]
    PVC_Queue --> PVC_Train[Multi-Epoch Neural Vocoder Adaptation]
    PVC_Train --> PVC_Notify[Email Notification: 'Your Voice is Ready']
    PVC_Notify --> PVC_Ready[High-Fidelity Model Bound to User Account]
```

---

## 5. Flow 5: AI Video & Audio Dubbing Workflow

A multi-stage localization assembly line.

```mermaid
flowchart LR
    A[Upload Video MP4/URL] --> B[Audio Separation Demucs]
    B --> C[Speaker Diarization]
    C --> D[Whisper Transcription]
    D --> E[LLM Translation with Time Constraints]
    E --> F[Synthesize Translated Audio via Cloned Voices]
    F --> G[Audio Ducking & Resync]
    G --> H[Dubbing Studio NLE]
    H --> I[Export Rendered Video with Target Language Audio]
```

---

## 6. Flow 6: Developer API Integration Flow

The journey for developers building external SaaS products on top of ElevenLabs infrastructure.

```mermaid
flowchart TD
    A[Developer Logs into /app/developers] --> B[Generates API Key `xi-api-key`]
    B --> C[Configures Allowed Origins & Rate Limits]
    C --> D[Reviews API Reference & Interactive Swagger Docs]
    D --> E[Installs Official SDK: npm i elevenlabs / pip install elevenlabs]
    E --> F[Executes First API Call with Streaming Chunk Handler]
    F --> G[Monitors API Dashboard: Concurrency, Character Usage, Latency SLA]
    G --> H[Configures Webhooks for Async Batch Jobs Dubbing/PVC]
```
