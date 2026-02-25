import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getScenario, type ScenarioId } from "@/lib/scenarios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scenarioId = body.scenarioId as ScenarioId | undefined;
    const transcript = body.transcript as TranscriptEntry[] | undefined;
    const duration = body.duration as number | undefined;

    if (!scenarioId || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: "scenarioId and transcript are required" },
        { status: 400 }
      );
    }

    const scenario = getScenario(scenarioId);
    const transcriptText = transcript
      .map(
        (e) =>
          `${e.role === "user" ? "SDR" : scenario.prospectName}: ${e.text}`
      )
      .join("\n");

    const prompt = `You are an expert SDR coach analysing a cold call simulation. You have been given the full transcript of a practice cold call between a trainee SDR and an AI prospect.

CONTEXT:
- Scenario: ${scenario.name}
- Prospect: ${scenario.prospectName}, ${scenario.prospectTitle} at ${scenario.company}
- Prospect personality: ${scenario.challengeDescription}
- Objective: ${scenario.objective}
- Call duration: ${duration ?? 0} seconds

TRANSCRIPT:
${transcriptText || "(No transcript provided)"}

SCORING RULES — BE STRICT ON SHORT/MINIMAL CALLS:
- If the call was very short (e.g. under 30–60 seconds) or the SDR said almost nothing (only a few words, one short line, or no real engagement), scores must be LOW. Overall score and all skill scores should be in the 0–20 range. Do not give 30+ for a call where the SDR barely spoke; that would be too generous.
- Only give moderate or high scores (e.g. 40+) when there was real back-and-forth: multiple SDR turns, questions asked, some attempt at discovery or handling objections. Short calls with minimal SDR contribution should get overall_score and skill scores in the 0–25 range.

Analyse this call and return a JSON object with the following structure. Be specific, cite exact moments from the transcript, and be constructively critical — this person is here to improve, not to be flattered.

{
  "outcome": "meeting_booked" | "soft_maybe" | "rejected" | "hung_up" | "time_expired",
  "overall_score": <0-100>,
  "overall_summary": "<1-2 sentence summary of performance>",
  "skills": {
    "opener_hook": {
      "score": <0-100>,
      "feedback": "<2-3 sentences. How was their opening? Did they earn attention quickly?>"
    },
    "discovery_questions": {
      "score": <0-100>,
      "feedback": "<2-3 sentences. Did they ask smart questions? Did they listen?>"
    },
    "objection_handling": {
      "score": <0-100>,
      "feedback": "<2-3 sentences. How did they handle pushback?>"
    },
    "close_next_steps": {
      "score": <0-100>,
      "feedback": "<2-3 sentences. Did they drive toward a concrete outcome?>"
    }
  },
  "key_moments": [
    {
      "timestamp_estimate": "<approximate timestamp, e.g. '0:42'>",
      "what_happened": "<what the caller or prospect said/did>",
      "coaching_tip": "<specific advice on what to do differently>"
    }
  ],
  "top_strength": "<one thing they did well, be specific>",
  "top_improvement": "<one thing to focus on next time, be specific>"
}

Be honest but encouraging. The goal is to make this person better, not to discourage them. If they did something well, celebrate it. If they made a mistake, explain exactly what to do instead — with a concrete example of what they could have said.

Remember: a call where the SDR spoke for only a few seconds with little or no substance should get overall_score and skill scores in the 0–20 range, not 30+. Save higher scores for real engagement.

Return ONLY the JSON object. No markdown, no backticks, no explanation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    const scorecard = JSON.parse(raw) as object;

    // TODO: Store simulation in database (user_id, anonymous_id, scenario_id, transcript, scorecard, duration, outcome, overall_score)

    return NextResponse.json({ scorecard });
  } catch (err) {
    console.error("generate-scorecard error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate scorecard" },
      { status: 500 }
    );
  }
}
