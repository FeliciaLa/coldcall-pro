import { NextRequest, NextResponse } from "next/server";
import { getScenario, getSystemPromptForSession, type ScenarioId } from "@/lib/scenarios";
import {
  getAnonymousIdFromRequest,
  checkAccess,
  decrementPaidSim,
} from "@/lib/access";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const anonymousId = getAnonymousIdFromRequest(request);
    const access = await checkAccess(anonymousId);
    if (!access.canSimulate) {
      return NextResponse.json(
        {
          error:
            access.reason === "free_used"
              ? "You've used your 3 free calls. Unlock more to continue."
              : "No simulations remaining. Purchase more to continue.",
          code: access.reason,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const scenarioId = body.scenarioId as ScenarioId | undefined;
    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (access.hasPaid && anonymousId) {
      const ok = await decrementPaidSim(anonymousId);
      if (!ok) {
        return NextResponse.json(
          { error: "No simulations remaining." },
          { status: 403 }
        );
      }
    }

    const scenario = getScenario(scenarioId);

    // Use GA Realtime API client_secrets (required for /v1/realtime/calls in the browser)
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: getSystemPromptForSession(scenario),
          audio: {
            output: { voice: scenario.voice },
            input: {
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI client_secrets error:", response.status, err);
      return NextResponse.json(
        { error: err || "Failed to create client secret" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as { value?: string };
    const token = data.value;
    if (!token) {
      return NextResponse.json(
        { error: "No client secret in OpenAI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
      sessionConfig: { model: "gpt-realtime", voice: scenario.voice },
    });
  } catch (err) {
    console.error("voice-session error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create session" },
      { status: 500 }
    );
  }
}
