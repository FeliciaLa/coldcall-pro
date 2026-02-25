# ColdCall Pro

AI-powered voice cold call simulator for aspiring SDRs. Practice with realistic AI prospects, handle objections, and get coaching scorecards after each call.

## Tech stack

- **Next.js 14+** (App Router), **Tailwind CSS**
- **OpenAI Realtime API** (voice), **OpenAI GPT-4o** (scorecard)
- **Clerk** (auth), **Stripe Checkout** (£19 one-time), **Supabase** (DB)
- **Vercel** (hosting)

## Setup

1. Copy env and add keys:
   ```bash
   cp .env.example .env.local
   ```
   Required for core flow: `OPENAI_API_KEY`. Others (Stripe, Clerk, Supabase) for payments and persistence.

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

3. **Database**: Run `supabase-schema.sql` in your Supabase SQL editor when ready to persist users and simulations.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing + CTA |
| `/scenarios` | Scenario grid (5 prospects) |
| `/sim/[scenarioId]` | Briefing → Call → Scorecard |
| `/pricing` | Unlock 50 sims for £19 |
| `/dashboard` | (Post-purchase) History & stats |
| `/api/voice-session` | Creates OpenAI Realtime ephemeral token |
| `/api/generate-scorecard` | Transcript → scorecard JSON |
| `/api/check-access` | Free sim / paid access check |

## Voice call (Realtime API)

- **Backend**: `POST /api/voice-session` creates an ephemeral token with the scenario’s system prompt and returns it to the client.
- **Frontend**: The call UI fetches the token and should establish a **WebRTC** connection to the OpenAI Realtime API for bidirectional voice. The current sim page shows a placeholder call experience; to ship full voice you’ll need to wire the browser client to the Realtime WebRTC endpoint using the token (see [OpenAI Realtime WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)).

## Build spec

The app follows the **ColdCall Pro Build Specification** (see project docs). Implemented so far:

- Next.js + Tailwind, dark theme, scenario config (all 5 personas)
- Landing, scenarios, pricing pages
- Pre-call briefing and scorecard UI
- Voice-session API (ephemeral token), generate-scorecard API (GPT-4o)
- Check-access API (stub)
- Supabase schema (SQL file)

Still to do: full WebRTC voice flow, free-sim cookie + DB, Stripe + Clerk, dashboard.

## Node version

The spec targets Next.js 14+. The project was scaffolded with a newer Next.js; if you see engine warnings, use **Node 20+** for best compatibility.
