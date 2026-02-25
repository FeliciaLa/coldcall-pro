"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  getScenario,
  type ScenarioId,
  SCENARIO_IDS,
} from "@/lib/scenarios";
import { BriefingView } from "./BriefingView";
import { CallView } from "./CallView";
import { ScorecardView } from "./ScorecardView";

export type SimPhase = "briefing" | "call" | "scorecard";

export interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
}

export interface ScorecardData {
  outcome: "meeting_booked" | "soft_maybe" | "rejected" | "hung_up" | "time_expired";
  overall_score: number;
  overall_summary: string;
  skills: {
    opener_hook: { score: number; feedback: string };
    discovery_questions: { score: number; feedback: string };
    objection_handling: { score: number; feedback: string };
    close_next_steps: { score: number; feedback: string };
  };
  key_moments: Array<{
    timestamp_estimate: string;
    what_happened: string;
    coaching_tip: string;
  }>;
  top_strength: string;
  top_improvement: string;
}

export default function SimPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = (params?.scenarioId as string) ?? "";
  const validId = SCENARIO_IDS.includes(scenarioId as ScenarioId)
    ? (scenarioId as ScenarioId)
    : null;

  const [phase, setPhase] = useState<SimPhase>("briefing");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);

  const scenario = validId ? getScenario(validId) : null;

  const handleStartCall = useCallback(() => {
    setPhase("call");
  }, []);

  const handleCallEnd = useCallback(
    async (finalTranscript: TranscriptEntry[], duration: number) => {
      setTranscript(finalTranscript);
      setDurationSeconds(duration);
      setPhase("scorecard");

      try {
        await fetch("/api/use-free-sim", { method: "POST", credentials: "include" });
      } catch {
        // non-blocking
      }

      if (!validId) return;
      try {
        const res = await fetch("/api/generate-scorecard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: validId,
            transcript: finalTranscript,
            duration,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setScorecard(data.scorecard);
        }
      } catch (e) {
        console.error("Scorecard generation failed:", e);
      }
    },
    [validId]
  );

  if (!validId || !scenario) {
    return (
      <div className="landing-dark flex min-h-screen items-center justify-center bg-[#080b0f]">
        <div className="text-center">
          <p className="font-lp-mono text-[14px] text-[#8b949e]">Scenario not found.</p>
          <button
            onClick={() => router.push("/scenarios")}
            className="font-lp-mono mt-4 text-[14px] font-semibold text-[#2979ff] hover:underline"
          >
            Back to scenarios
          </button>
        </div>
      </div>
    );
  }

  if (phase === "briefing") {
    return (
      <BriefingView
        scenario={scenario}
        onStartCall={handleStartCall}
      />
    );
  }

  if (phase === "call") {
    return (
      <CallView
        scenario={scenario}
        onEndCall={handleCallEnd}
      />
    );
  }

  return (
    <ScorecardView
      scenario={scenario}
      transcript={transcript}
      durationSeconds={durationSeconds}
      scorecard={scorecard}
      onTryAgain={() => {
        setPhase("briefing");
        setTranscript([]);
        setScorecard(null);
      }}
      onDifferentScenario={() => router.push("/scenarios")}
    />
  );
}
