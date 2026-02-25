import { getSupabase, hasSupabase } from "./supabase";

const COOKIE_NAME = "ccp_anon";

export function getAnonymousId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export async function checkAccess(
  anonymousId: string | null
): Promise<{
  canSimulate: boolean;
  hasFreeSim: boolean;
  simulationsRemaining: number | null;
  hasPaid: boolean;
  reason?: string;
}> {
  if (!hasSupabase()) {
    return {
      canSimulate: true,
      hasFreeSim: true,
      simulationsRemaining: null,
      hasPaid: false,
    };
  }

  if (!anonymousId) {
    return {
      canSimulate: true,
      hasFreeSim: true,
      simulationsRemaining: null,
      hasPaid: false,
    };
  }

  const supabase = getSupabase();

  const { data: freeRow } = await supabase
    .from("free_sims")
    .select("used")
    .eq("anonymous_id", anonymousId)
    .single();

  const freeUsed = freeRow?.used === true;

  const { data: purchase } = await supabase
    .from("anon_purchases")
    .select("simulations_remaining")
    .eq("anonymous_id", anonymousId)
    .single();

  const hasPaid = Boolean(purchase);
  const simulationsRemaining = purchase?.simulations_remaining ?? 0;

  if (freeUsed && !hasPaid) {
    return {
      canSimulate: false,
      hasFreeSim: false,
      simulationsRemaining: null,
      hasPaid: false,
      reason: "free_used",
    };
  }

  if (hasPaid && simulationsRemaining <= 0) {
    return {
      canSimulate: false,
      hasFreeSim: false,
      simulationsRemaining: 0,
      hasPaid: true,
      reason: "no_credits",
    };
  }

  return {
    canSimulate: true,
    hasFreeSim: !freeUsed,
    simulationsRemaining: hasPaid ? simulationsRemaining : null,
    hasPaid,
  };
}

export function getAnonymousIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  return getAnonymousId(cookieHeader);
}

/** Decrement simulations_remaining for a paid anonymous user. Call when starting a sim. */
export async function decrementPaidSim(anonymousId: string): Promise<boolean> {
  if (!hasSupabase()) return true;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("anon_purchases")
    .select("simulations_remaining")
    .eq("anonymous_id", anonymousId)
    .single();
  if (!data || data.simulations_remaining <= 0) return false;
  await supabase
    .from("anon_purchases")
    .update({
      simulations_remaining: Math.max(0, data.simulations_remaining - 1),
    })
    .eq("anonymous_id", anonymousId);
  return true;
}
