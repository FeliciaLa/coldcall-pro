import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase, hasSupabase } from "@/lib/supabase";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  let event: Stripe.Event;
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const anonymousId = session.client_reference_id || session.metadata?.anonymous_id;
    if (!anonymousId) {
      console.error("Stripe webhook: no client_reference_id or anonymous_id");
      return NextResponse.json({ received: true }, { status: 200 });
    }
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (hasSupabase()) {
      const supabase = getSupabase();
      await supabase.from("anon_purchases").upsert(
        {
          anonymous_id: anonymousId,
          stripe_session_id: session.id,
          simulations_remaining: 50,
          purchased_at: new Date().toISOString(),
        },
        { onConflict: "anonymous_id" }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
