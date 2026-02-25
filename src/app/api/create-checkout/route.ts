import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAnonymousIdFromRequest } from "@/lib/access";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PRICE_ID = process.env.STRIPE_PRICE_ID;

export async function POST(request: NextRequest) {
  if (!stripe || !PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  try {
    const anonymousId = getAnonymousIdFromRequest(request);
    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymous id. Refresh the page and try again." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const successUrl =
      (body.successUrl as string) || `${request.nextUrl.origin}/pricing?success=1`;
    const cancelUrl =
      (body.cancelUrl as string) || `${request.nextUrl.origin}/pricing`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: anonymousId,
      metadata: { anonymous_id: anonymousId },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
