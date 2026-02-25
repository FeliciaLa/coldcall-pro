import { NextRequest, NextResponse } from "next/server";
import { getAnonymousIdFromRequest, checkAccess } from "@/lib/access";

export async function GET(request: NextRequest) {
  try {
    const anonymousId = getAnonymousIdFromRequest(request);
    const access = await checkAccess(anonymousId);
    return NextResponse.json({
      canSimulate: access.canSimulate,
      hasFreeSim: access.hasFreeSim,
      simulationsRemaining: access.simulationsRemaining,
      hasPaid: access.hasPaid,
      reason: access.reason,
    });
  } catch (err) {
    console.error("check-access error:", err);
    return NextResponse.json(
      { error: "Failed to check access" },
      { status: 500 }
    );
  }
}
