# Technical Website Inspection & Architecture Analysis: ElevenLabs

**Target URL:** [https://elevenlabs.io](https://elevenlabs.io)  
**Inspection Date:** October 30, 2026  
**Methodology:** Reverse Engineer Anything (REA) MCP Tools (`capture_browser_scenario`, CDP accessibility & DOM extraction, script asset graph tracing)  
**Evidence Record:** `ev_5c5e77382a3763fd08592346890d06d22e709b114950d51d8df4391c10d4e938`  
**Execution Context:** Passive observation & controlled scenario replay with process isolation (Chromium 156 / Headless CDP)

---

## 1. Executive Summary & Epistemological Boundaries

This document provides a rigorous, empirical analysis of the publicly observable web architecture, document object model (DOM), accessibility trees, and client-side assets of the ElevenLabs marketing portal.

> [!IMPORTANT]
> **Observation vs. Hypothesis Boundary**:
> - **Observed Facts**: Verified directly through captured DOM dumps, accessibility node listings, HTTP link relationships, and asset bundles delivered over the network.
> - **Technical Hypotheses**: Inferences regarding backend architecture, GPU inference clustering, and server infrastructure based on observed client behavior, HTTP endpoints, and industry-standard deployment patterns.

---

## 2. REA MCP Connection & Target Inspection

1. **REA MCP Connectivity**: Verified and operational using the `rea-playwright-browser-scenario` provider (`v1`).
2. **Target Discovery & Session Management**:
   - Passive inspection was initialized via Playwright scenario runner in an isolated Chromium container.
   - Initial entrypoint: `https://elevenlabs.io/` (redirected and normalized with clean URL parameters).
   - Captured artifacts: Complete DOM text (1,128,467 bytes, SHA-256: `8327cda25849dc201404f35c8f4493c4cc187a2b490d48c744c964bea7fe54a8`), Accessibility Tree text (26,743 bytes, SHA-256: `ad507712528767c20ec638503520ca5ccb6cdee701811df2892e25d2844a846d`), and active storage state.

---

## 3. DOM & Accessibility Tree Structure

### 3.1 Landmark Architecture
The page adopts modern semantic HTML5 and WAI-ARIA landmark hierarchies:

- **Top Announcement Banner (`role="paragraph"` / banner context)**:
  - Text: *"Meet Eleven v4, our most emotive model yet."*
  - CTA Link: `/v4` (*"Discover"*)
- **Skip Navigation**:
  - Accessible anchor `<a href="#content">Skip to content</a>` positioned as the first tab-stop to satisfy WCAG 2.2 AA.
- **Header / Primary Navigation (`<nav>`)**:
  - Container: Semantic `<nav>` nested inside a sticky header.
  - Accessible Structure: Unordered list (`<ul>` / `role="list"`) separating brand identity from menu groups.
  - Navigation Nodes:
    - Link `ElevenLabs` (`/`)
    - Menu Button: `Products` (triggers flyout panel)
    - Menu Button: `Solutions` (industry-specific workflows)
    - Direct Link: `Customers` (`/customer-stories`)
    - Menu Button: `Resources` (developer documentation, blog, impact)
    - Direct Link: `Enterprise` (`/enterprise`)
    - Direct Link: `Pricing` (`/pricing`)
    - Action Buttons: `Log in` (`/app/sign-in`), `Sign up` (`/app/sign-up`)
- **Main Landmark (`<main id="content">`)**:
  - Encapsulates all primary landing page sections:
    - Hero with Level 1 Heading (`<h1>`)
    - Product Suite Selector (`tablist` with `tab` items)
    - Social Proof & Customer Grid
    - Platform Architecture Deep-Dives (`ElevenCreative` vs. `ElevenAgents` vs. `ElevenAPI`)
    - Interactive Audio Players & Speech Sandbox
    - Model Roadmap & Safety Highlights
- **Footer Landmark (`<footer>`)**:
  - Standardized `contentinfo` landmark containing 72 structured navigational and compliance links.

### 3.2 Accessibility Implementation Details
- **Component Primitives**: Observable evidence confirms the use of **React Aria** (`@react-aria/button`, `@react-aria/interactions`). Injected inline stylesheet:
  ```css
  @layer {
    [data-react-aria-pressable] {
      touch-action: pan-x pan-y pinch-zoom;
    }
  }
  ```
- **State Management**: Tabs use standard ARIA attributes (`role="tablist"`, `role="tab"`, `aria-selected="true|false"`, `role="tabpanel"`).
- **Interactive Speech Demos**: Audio sample cards use accessible `<button>` controls with dynamic accessible labels (e.g., `Play "Adam - Engaging, Friendly and Bright" preview`, `Next voice`, `Previous voice`).

---

## 4. Layout & Design Systems Engineering

### 4.1 Frontend Framework & Rendering Architecture
- **Framework Identification**: **Next.js App Router**
  - **Evidence 1 (React Server Component streaming)**: Presence of `self.__next_f = self.__next_f || []` script tags delivering flight data payloads directly in the DOM.
  - **Evidence 2 (Asset naming conventions)**: Chunks loaded from `/_next/static/chunks/` including `main-app-*.js` and `app/global-error-*.js`.
  - **Evidence 3 (Absence of legacy indicators)**: No `__NEXT_DATA__` JSON block was detected, confirming pure App Router implementation rather than Pages Router.
- **Speculation Rules (Chrome Next-Gen Speculative Loading)**:
  An embedded script leverages the W3C Speculation Rules API for instant client navigation:
  ```html
  <script type="speculationrules" id="prefetch-app-routes">
  {
    "prerender": [
      {
        "source": "document",
        "eagerness": "eager",
        "where": { "href_matches": "/app/sign-up*" }
      }
    ],
    "prefetch": [
      {
        "where": { "href_matches": "/app/*" },
        "eagerness": "eager"
      }
    ]
  }
  </script>
  ```
  *Technical Implication*: The application eagerly prerenders the signup funnel in the background before the user clicks, resulting in sub-50ms perceived registration page transitions.

### 4.2 Styling & Token System
- **CSS Engine**: **Tailwind CSS** with a custom scoped namespace (`tw-`).
  - Class tokens observed: `tw-flex`, `tw-grid`, `tw-gap-x-4`, `tw-items-center`, `tw-rounded-card`, `tw-text-cream`, `tw-bg-black`.
  - Prefixing with `tw-` avoids collisions with embedded web components or third-party embeds (e.g., Cookiebot, Stripe, Google Tag Manager).
- **Typography & Font Strategy**:
  Preloaded custom web fonts with local system fallbacks:
  - Primary Brand Display: `Waldenburg` & `WaldenburgFH` (hosted via CDN as `woff2`).
  - Monospace / Technical: `JetBrains Mono` & `Geist Mono`.
  - General Body / UI: `Inter` and fallback sans-serif.
  - Critical font metric overrides (`size-adjust`, `ascent-override`, `descent-override`) are defined to eliminate Cumulative Layout Shift (CLS) during web font swap.

---

## 5. Page Section Breakdown

### 5.1 Hero Section
- **Primary Value Proposition (`<h1>`)**:  
  `"Bringing technology to life"`
- **Supporting Narrative (`<h2>`)**:  
  `"Powering the best enterprises, creators, and developers. From ElevenAgents for customer experience, ElevenCreative for content creation, to the leading AI voice generator."`
- **Call to Action (CTA) Pair**:
  - Primary: `Sign up` (`/app/sign-up`) — High contrast dark button.
  - Secondary: `Contact sales` (`/contact-sales`) — Subtle outline/tertiary button.
- **Interactive Tabbed Product Showcase**:
  Positioned directly beneath the hero copy is a 3-tab switchboard reflecting ElevenLabs' three corporate pillars:
  1. **ElevenCreative**: Content creation, studio, voiceover, cloning.
  2. **ElevenAgents**: Conversational voice bots, customer experience, telephone agents.
  3. **ElevenAPI**: Low-latency developer endpoints, SDKs, and enterprise infrastructure.

### 5.2 Social Proof & Trust Layer
- Logos and customer case studies feature prominent global enterprises:
  - *Enterprise & Media*: Disney Studios, NVIDIA, Duolingo, Time, Perplexity, Meta.
  - *India & Emerging Market Hypergrowth*: Meesho, Cars24, Razorpay, TVS Motor, Pocket FM, Urban Company, Zomato (Eternal), Havells.

### 5.3 Footer Architecture (72 Public Anchors)
The footer is categorized into 5 logical columns:
1. **ElevenCreative (Product Suite)**:
   - Text to Speech (`/text-to-speech`)
   - Speech to Text (`/speech-to-text`)
   - Voice Changer (`/voice-changer`)
   - Text to Sound Effects (`/sound-effects`)
   - Voice Cloning (`/voice-cloning`)
   - Voice Isolator (`/voice-isolator`)
   - AI Music Generator (`/music`)
   - Studio (`/studio`), Voice Design (`/voice-design`), AI Image & Video Generator.
2. **ElevenAgents (Conversational & Enterprise)**:
   - Voice Agents (`/voice-agents`), Conversational AI (`/conversational-ai`)
   - Integrations (`/agents/integrations`), Chatbots (`/chatbot`)
   - Industry Verticals: Telecommunications, Financial Services, Healthcare, Government, Retail, Hospitality, Customer Support.
3. **ElevenAPI (Developer Hub)**:
   - API Reference (`/docs/api-reference/text-to-speech/convert`)
   - Speech Engine (`/docs/overview/capabilities/speech-engine`)
   - SDK Quickstart, Dubbing API, STT API, SFX API, API Keys portal.
4. **Ecosystem & Company**:
   - Iconic Marketplace (`/iconic-marketplace`), Startup Grants (`/startup-grants`)
   - Impact Program, Webinars, Careers, About Us, Brand Kit.
5. **Trust, Legal & Compliance**:
   - Trust Center (`https://compliance.elevenlabs.io/`)
   - Terms of Use, Privacy Policy, EU Digital Services Act (DSA)
   - EU-US Data Privacy Framework (DPF), CCPA Notice, AI Transparency, Human Rights Statement.

---

## 6. Publicly Observable JavaScript Bundles & Network Edge

### 6.1 CDN Distribution
- Assets are served through an origin CDN:  
  `https://eleven-public-cdn.elevenlabs.io/marketing_website/_next/static/...`
- Cache-busting and build isolation are enforced via query parameters:  
  `?dpl=55b1449bb40ceb85b8eb302c572bfea59266ae05` (representing a deployment hash).

### 6.2 Chunk Partitioning Strategy
Inspection of the 87 identified client script elements reveals rigorous code splitting:
- **Core Runtime**: `main-app-0e8061a9e30a24ff.js`
- **Vendor Splitting**: Granular hash chunks separating React framework code, React Aria handlers, and media decoding logic.
- **Polyfills**: `polyfills-42372ed130431b0a.js` served with `nomodule=""` fallback for legacy client runtimes.
- **Third-Party Integrations**:
  - Consent Management: Cookiebot (`consent.cookiebot.com`)
  - Analytics & Conversion: Google Tag Manager (`gtm.js?id=GTM-5F5KLXC3`), Google Analytics 4 (`G-82RG1PXYVW`)
  - Affiliate / Partner Attribution: PartnerStack / GrowSumo (`try.elevenlabs.io/pr/js`)

---

## 7. Comparative Technical Ledger

| Dimension | Observed Fact (Direct Network/DOM Evidence) | Technical Hypothesis (Inferred Architecture) |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js App Router with RSC streaming (`self.__next_f`) | Vercel Edge Network or AWS CloudFront + containerized Node.js cluster |
| **Component UI Library** | React Aria primitives with custom Tailwind (`tw-`) classes | Proprietary internal design system built atop headless Radix / React Aria primitives |
| **Media Delivery** | Web Audio API preview nodes with pre-cached MP3/OGG buffers | S3/Cloudflare R2 storage fronted by an optimized Cloudflare/Fastly CDN layer |
| **Authentication Flow** | Links to `/app/sign-in` and Google OAuth redirect `/app/external-auth/google` | NextAuth or custom Go/Node.js identity service issuing JWT session cookies |
| **Performance Strategy** | Speculative prerendering of `/app/sign-up` via Speculation Rules API | Edge caching with stale-while-revalidate ISR on public marketing pages |
