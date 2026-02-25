"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const searchParams = useSearchParams();
  const gate = searchParams.get("gate") === "1";
  const success = searchParams.get("success") === "1";
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          successUrl: `${window.location.origin}/pricing?success=1`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL");
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-dark min-h-screen bg-[#080b0f] text-[#e6edf3]">
      <nav className="sticky top-0 z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-4 backdrop-blur-md bg-[#080b0f]/80 border-b border-[#1c2128]">
        <Link href="/" className="font-lp-heading text-[15px] font-semibold tracking-tight text-[#e6edf3]">
          ColdCall Pro
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/scenarios"
            className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Scenarios
          </Link>
          <Link
            href="/"
            className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto flex max-w-md flex-col items-center px-5 py-16">
        <h1 className="font-lp-heading text-2xl font-bold tracking-tight text-[#e6edf3] md:text-3xl">
          Unlock practice
        </h1>
        <p className="font-lp-mono mt-2 text-[14px] text-[#8b949e]">
          One free call · then unlock 50 simulations
        </p>

        {gate && (
          <div className="mt-6 w-full rounded-xl border border-[#00e676]/30 bg-[#00e676]/5 p-4 text-center">
            <p className="font-lp-mono text-[14px] text-[#00e676]">
              You&apos;ve used your free call. Unlock 50 more below.
            </p>
          </div>
        )}

        {success && (
          <div className="mt-6 w-full rounded-xl border border-[#00e676]/30 bg-[#00e676]/5 p-4 text-center">
            <p className="font-lp-mono text-[14px] text-[#00e676]">
              Thanks for purchasing. You have 50 simulations — head to Scenarios to start.
            </p>
          </div>
        )}

        <div className="mt-10 w-full rounded-xl border border-[#1c2128] bg-[#0d1117] p-8">
          <p className="font-lp-heading text-4xl font-extrabold tracking-tight text-[#e6edf3]">
            £19
          </p>
          <p className="font-lp-mono mt-1 text-[13px] text-[#8b949e]">One-time</p>
          <ul className="mt-6 space-y-2.5 text-[14px] text-[#e6edf3]">
            <li>50 practice simulations</li>
            <li>All 5 prospect scenarios</li>
            <li>Coaching scorecards</li>
            <li>Full transcripts</li>
          </ul>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={loading}
            className="font-lp-mono mt-8 w-full rounded-md bg-[#2979ff] py-3.5 text-[14px] font-semibold text-white hover:bg-[#1a6ae6] disabled:opacity-70"
          >
            {loading ? "Redirecting…" : "Unlock now"}
          </button>
          {checkoutError && (
            <p className="font-lp-mono mt-3 text-center text-[13px] text-[#ef4444]">{checkoutError}</p>
          )}
          <p className="font-lp-mono mt-4 text-center text-[12px] text-[#8b949e]">
            No subscription. Practice at your pace.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="landing-dark min-h-screen bg-[#080b0f]" />}>
      <PricingContent />
    </Suspense>
  );
}
