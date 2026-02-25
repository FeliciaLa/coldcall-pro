import { NextRequest, NextResponse } from "next/server";
import { getAnonymousIdFromRequest, FREE_SIMS_LIMIT } from "@/lib/access";
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
    const { data: row } = await supabase
      .from("free_sims")
      .select("used_count")
      .eq("anonymous_id", anonymousId)
      .single();

    const nextCount = Math.min((row?.used_count ?? 0) + 1, FREE_SIMS_LIMIT);
    await supabase.from("free_sims").upsert(
      { anonymous_id: anonymousId, used_count: nextCount },
      { onConflict: "anonymous_id" }
    );

    return NextResponse.json({ ok: true, used: nextCount >= FREE_SIMS_LIMIT });
  } catch (err) {
    console.error("use-free-sim error:", err);
    return NextResponse.json(
      { error: "Failed to record free sim" },
      { status: 500 }
    );
  }
}
