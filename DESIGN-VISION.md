# ColdCall Pro — Design Vision

## Why the current design falls short

- **Too much “dashboard”**: Near-black + blue accent + cards reads as “another B2B SaaS.” It doesn’t signal “practice” or “coach.”
- **Dark can feel heavy**: For someone already nervous, a very dark UI can add pressure instead of calm.
- **No clear emotional idea**: “Bloomberg Terminal meets SaaS” is a vibe, not a story. The app needs a single, clear feeling.

---

## THE ultimate direction: **Calm confidence**

**One sentence:** *ColdCall Pro should feel like a focused, supportive space where you practice until you’re ready — not a tool that’s judging you.*

- **Calm**: Plenty of space, low visual noise, no harsh contrast. The brain stays on the conversation.
- **Confidence**: The UI says “you’re in the right place” — clear, human typography and a touch of warmth, not cold tech.
- **Focus**: Every screen has one job. The call screen is almost empty: just the prospect and the conversation.

---

## Design system

### Palette: **Warm light (primary direction)**

| Role        | Hex       | Use |
|------------|-----------|-----|
| Background | `#FAF9F7` | Warm off-white (paper, not hospital white). |
| Surface    | `#FFFFFF` | Cards, panels. |
| Text       | `#1C1917` | Strong, readable. |
| Muted      | `#78716C` | Secondary text, hints. |
| Accent     | `#4F46E5` | Indigo — “go,” “growth,” “ready.” focused, professional, not pharmacy. |
| Success    | `#059669` | Meeting booked, positive. |
| Warning    | `#D97706` | Soft maybe, wrap-up. |
| Danger     | `#DC2626` | Rejected, end call. |
| Border     | `#E7E5E4` | Light, not harsh. |

**Alternative: Soft dark**  
If you prefer dark mode: background `#1C1917`, surface `#292524`, text `#FAFAF9`, same teal accent. Warm charcoal, not black.

### Typography

- **Headings**: **Instrument Sans** or **DM Sans** — geometric but friendly, not cold. Large, confident sizes (e.g. 2.5rem hero).
- **Body**: Same family or **Inter** — highly readable for scorecard and briefings.
- **Principle**: One family for everything is fine; weight and size do the work. Avoid a second “display” font that feels like a different product.

### Space and rhythm

- **Generous padding**: Cards and sections breathe. 1.5–2rem minimum padding; 3–4rem between sections.
- **One idea per block**: Landing = hero + one CTA + one “how it works.” No sidebar, no dense nav.
- **Call screen**: Maximum reduction. Prospect avatar + name, optional tiny “Live” dot, mute + end. Timer can be small or absent so attention stays on the conversation.

### Motion

- **Subtle only**: Short fade-ins (200–300ms). No bouncing or playful motion — it’s a practice tool, not a game.
- **Pulse on “Start call”**: Keep a soft pulse so the primary action is obvious; don’t add more animation.

---

## Screen-by-screen intent

| Screen      | Feeling | Key move |
|------------|---------|----------|
| **Landing** | Inviting, clear | Big headline, one CTA, “How it works” as 3 simple steps. No clutter. |
| **Scenarios** | Choose your challenge | Cards with prospect, difficulty, one line. Tap = go. No lock icons until after free use. |
| **Briefing** | Prepared, not rushed | Clear context card, collapsible tips, prominent “Start call” with mic check. |
| **Call** | Just you and them | Full-bleed or centered: avatar, name, “Live” or waveform. Controls at bottom, minimal. |
| **Scorecard** | Coach’s notes | Outcome first, then score + one-line takeaway, then skill bars and key moments. Feels like a report you’d keep. |
| **Pricing** | Simple, trustworthy | One plan, one price, one button. No comparison table. |

---

## One signature move

**The call screen as a “stage.”**

- Background: single soft gradient or solid warm tone (e.g. `#F5F5F4` to `#EDEDEB`), no cards or panels.
- Center: one large circular avatar (or initial), prospect name, optional “Live” dot.
- Bottom: two controls only — Mute, End call — in a slim bar. “Need a hint?” as text link if needed.
- No step numbers, no timers in your face, no waveform unless it’s minimal. The only focus is the conversation.

That one screen, more than any other, should feel like the “ultimate” design: calm, focused, human.

---

## Summary

- **Direction**: Calm confidence — warm light palette, indigo accent, human type, lots of space.
- **Emotion**: “I’m in the right place to practice; the app is on my side.”
- **Signature**: Call screen = stage. Everything else supports that moment.

Implementing this means: new `globals.css` tokens, updated landing and scenarios, and a stripped-back call UI. The scorecard can stay card-based but with the new palette and spacing so it feels like a coach’s report, not a form.
