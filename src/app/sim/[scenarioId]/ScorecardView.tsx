"use client";

import { useState } from "react";
import type { Scenario } from "@/lib/scenarios";
import type { ScorecardData, TranscriptEntry } from "./page";

interface ScorecardViewProps {
  scenario: Scenario;
  transcript: TranscriptEntry[];
  durationSeconds: number;
  scorecard: ScorecardData | null;
  onTryAgain: () => void;
  onDifferentScenario: () => void;
}

const OUTCOME_LABELS: Record<ScorecardData["outcome"], string> = {
  meeting_booked: "Meeting booked",
  soft_maybe: "Soft maybe",
  rejected: "Rejected",
  hung_up: "Hung up",
  time_expired: "Time expired",
};

const OUTCOME_STYLES: Record<ScorecardData["outcome"], string> = {
  meeting_booked: "bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/30",
  soft_maybe: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30",
  rejected: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30",
  hung_up: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30",
  time_expired: "bg-[#1c2128] text-[#8b949e] border border-[#1c2128]",
};

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Solid";
  if (score >= 40) return "Getting there";
  return "Needs work";
}

export function ScorecardView({
  scenario,
  transcript,
  durationSeconds,
  scorecard,
  onTryAgain,
  onDifferentScenario,
}: ScorecardViewProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const duration = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="landing-dark min-h-screen bg-[#080b0f] text-[#e6edf3]">
      <header className="border-b border-[#1c2128] bg-[#0d1117]/80 px-5 py-6 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <h1 className="font-lp-heading text-lg font-bold text-[#e6edf3]">Your scorecard</h1>
          <span className="font-lp-mono text-[13px] text-[#00e676]">{duration}</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        {scorecard ? (
          <>
            <section className="rounded-xl border border-[#1c2128] bg-[#0d1117] p-8">
              <span
                className={`font-lp-mono inline-block rounded border px-3 py-1 text-[12px] font-semibold ${OUTCOME_STYLES[scorecard.outcome]}`}
              >
                {OUTCOME_LABELS[scorecard.outcome]}
              </span>
              <div className="mt-8 flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#00e676] text-3xl font-bold text-[#00e676]">
                  {scorecard.overall_score}
                </div>
                <p className="font-lp-heading mt-3 text-[15px] font-semibold text-[#e6edf3]">
                  {scoreLabel(scorecard.overall_score)}
                </p>
                <p className="mt-2 max-w-md text-center text-[14px] leading-relaxed text-[#8b949e]">
                  {scorecard.overall_summary}
                </p>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-lp-mono text-[11px] font-semibold uppercase tracking-widest text-[#00e676]">
                Skill breakdown
              </h2>
              <div className="mt-4 space-y-4">
                {(
                  [
                    ["opener_hook", "Opener & hook"],
                    ["discovery_questions", "Discovery & questions"],
                    ["objection_handling", "Objection handling"],
                    ["close_next_steps", "Close & next steps"],
                  ] as const
                ).map(([key, label]) => {
                  const s = scorecard.skills[key];
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-[#1c2128] bg-[#0d1117] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-[#e6edf3]">
                          {label}
                        </span>
                        <span className="font-lp-mono text-[14px] font-bold text-[#2979ff]">
                          {s.score}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1c2128]">
                        <div
                          className="h-full rounded-full bg-[#2979ff]"
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-[#8b949e]">
                        {s.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {scorecard.key_moments?.length > 0 && (
              <section className="mt-10">
                <h2 className="font-lp-mono text-[11px] font-semibold uppercase tracking-widest text-[#00e676]">
                  Key moments
                </h2>
                <ul className="mt-4 space-y-4">
                  {scorecard.key_moments.map((m, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-[#1c2128] bg-[#0d1117] p-4"
                    >
                      <span className="font-lp-mono text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
                        {m.timestamp_estimate}
                      </span>
                      <p className="mt-1 text-[14px] text-[#e6edf3]">
                        {m.what_happened}
                      </p>
                      <p className="mt-2 text-[13px] font-medium text-[#2979ff]">
                        What to try: {m.coaching_tip}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1c2128] bg-[#0d1117] p-4">
                <p className="font-lp-mono text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
                  Top strength
                </p>
                <p className="mt-1 text-[14px] text-[#00e676]">
                  {scorecard.top_strength}
                </p>
              </div>
              <div className="rounded-xl border border-[#1c2128] bg-[#0d1117] p-4">
                <p className="font-lp-mono text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
                  Focus next time
                </p>
                <p className="mt-1 text-[14px] text-[#f59e0b]">
                  {scorecard.top_improvement}
                </p>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-[#1c2128] bg-[#0d1117] p-12 text-center">
            <p className="font-lp-mono text-[14px] text-[#8b949e]">Generating your scorecard…</p>
          </div>
        )}

        <section className="mt-10">
          <button
            type="button"
            onClick={() => setTranscriptOpen(!transcriptOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1c2128] bg-[#0d1117] px-4 py-3.5 text-left text-[14px] font-semibold text-[#e6edf3]"
          >
            Transcript ({transcript.length})
            <span className="font-lp-mono text-[#8b949e]">{transcriptOpen ? "−" : "+"}</span>
          </button>
          {transcriptOpen && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#1c2128] bg-[#0d1117] p-4 font-lp-mono text-[13px] text-[#8b949e]">
              {transcript.length === 0 ? (
                <p>No transcript captured.</p>
              ) : (
                transcript.map((e, i) => (
                  <p key={i} className="mt-1">
                    <span className={e.role === "user" ? "font-semibold text-[#2979ff]" : "text-[#8b949e]"}>
                      {e.role === "user" ? "You" : scenario.prospectName}:
                    </span>{" "}
                    <span className="text-[#e6edf3]">{e.text}</span>
                  </p>
                ))
              )}
            </div>
          )}
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onTryAgain}
            className="font-lp-mono rounded-md bg-[#2979ff] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1a6ae6]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onDifferentScenario}
            className="font-lp-mono rounded-md border border-[#1c2128] bg-[#0d1117] px-6 py-2.5 text-[13px] font-semibold text-[#e6edf3] hover:border-[#00e676]/30"
          >
            Different scenario
          </button>
          <button
            type="button"
            className="font-lp-mono rounded-md border border-[#1c2128] bg-[#0d1117] px-6 py-2.5 text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3]"
          >
            Share score
          </button>
        </div>
      </main>
    </div>
  );
}
