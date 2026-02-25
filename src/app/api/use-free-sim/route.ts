import { NextRequest, NextResponse } from "next/server";
import { getAnonymousIdFromRequest } from "@/lib/access";
import { getSupabase, hasSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const anonymousId = getAnonymousIdFromRequest(request);
    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymous id (cookie ccp_anon)" },
        { status: 400 }
      );
    }

    if (!hasSupabase()) {
      return NextResponse.json({ ok: true, used: true });
    }

    const supabase = getSupabase();
    await supabase.from("free_sims").upsert(
      { anonymous_id: anonymousId, used: true },
      { onConflict: "anonymous_id" }
    );

    return NextResponse.json({ ok: true, used: true });
  } catch (err) {
    console.error("use-free-sim error:", err);
    return NextResponse.json(
      { error: "Failed to record free sim" },
      { status: 500 }
    );
  }
}
