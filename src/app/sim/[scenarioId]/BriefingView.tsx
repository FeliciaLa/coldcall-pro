"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Scenario, PRODUCT_BRIEF } from "@/lib/scenarios";

interface BriefingViewProps {
  scenario: Scenario;
  onStartCall: () => void;
}

export function BriefingView({ scenario, onStartCall }: BriefingViewProps) {
  const [tipsOpen, setTipsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(true);
  const [micReady, setMicReady] = useState<boolean | null>(null);
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  const checkMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicReady(true);
    } catch {
      setMicReady(false);
    }
  }, []);

  return (
    <div className="landing-dark min-h-screen bg-[#080b0f] text-[#e6edf3]">
      <header className="mx-auto max-w-2xl px-5 py-6">
        <Link
          href="/scenarios"
          className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          ← Back to scenarios
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-20">
        <h1 className="font-lp-heading text-2xl font-bold tracking-tight text-[#e6edf3]">
          Your briefing
        </h1>

        <div className="mt-8 rounded-xl border border-[#1c2128] bg-[#0d1117] p-6">
          <p className="text-[15px] text-[#e6edf3]">
            You are an SDR at {PRODUCT_BRIEF.name}, a workflow automation platform.
          </p>
          <p className="mt-3 text-[15px] text-[#e6edf3]">
            You&apos;re calling <strong>{scenario.prospectName}</strong>, {scenario.prospectTitle} at {scenario.company}.
          </p>
          <p className="mt-2 text-[13px] text-[#8b949e]">
            {scenario.companyDescription}
          </p>
          <p className="mt-4 text-[15px] text-[#e6edf3]">
            <strong>Objective:</strong> {scenario.objective}
          </p>
          <p className="mt-2 text-[15px] text-[#e6edf3]">
            <strong>Intel:</strong> {scenario.intel}
          </p>
          <p className="mt-4 text-[13px] text-[#8b949e]">
            <strong>How to position for this prospect:</strong> {scenario.productPosition}
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setProductOpen(!productOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1c2128] bg-[#0d1117] px-4 py-3.5 text-left text-[14px] font-semibold text-[#e6edf3] hover:border-[#1c2128]"
          >
            Your product — {PRODUCT_BRIEF.name}
            <span className="font-lp-mono text-[#8b949e]">{productOpen ? "−" : "+"}</span>
          </button>
          {productOpen && (
            <div className="mt-2 space-y-3 rounded-xl border border-[#1c2128] bg-[#0d1117] p-4 text-[14px]">
              <p className="text-[#e6edf3]">{PRODUCT_BRIEF.oneLiner}</p>
              <ul className="list-inside list-disc space-y-1 text-[#8b949e]">
                {PRODUCT_BRIEF.valueProps.map((prop, i) => (
                  <li key={i}>{prop}</li>
                ))}
              </ul>
              <p className="text-[13px] text-[#8b949e]">
                <strong className="text-[#e6edf3]">If they ask what you do:</strong> {PRODUCT_BRIEF.ifTheyAskWhatYouDo}
              </p>
              <p className="text-[13px] text-[#8b949e]">
                <strong className="text-[#e6edf3]">Differentiator:</strong> {PRODUCT_BRIEF.differentiator}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setTipsOpen(!tipsOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1c2128] bg-[#0d1117] px-4 py-3.5 text-left text-[14px] font-semibold text-[#e6edf3] hover:border-[#1c2128]"
          >
            Tips
            <span className="font-lp-mono text-[#8b949e]">{tipsOpen ? "−" : "+"}</span>
          </button>
          {tipsOpen && (
            <ul className="mt-2 list-inside list-disc space-y-1.5 rounded-xl border border-[#1c2128] bg-[#0d1117] p-4 text-[14px] text-[#8b949e]">
              {scenario.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {micReady === null && (
            <button
              type="button"
              onClick={checkMic}
              className="font-lp-mono w-fit rounded-md border border-[#1c2128] bg-[#0d1117] px-4 py-2.5 text-[12px] font-medium text-[#8b949e] hover:border-[#00e676]/30 hover:text-[#e6edf3]"
            >
              Check microphone
            </button>
          )}
          {micReady === true && (
            <p className="font-lp-mono text-[13px] font-medium text-[#00e676]">Microphone ready</p>
          )}
          {micReady === false && (
            <p className="font-lp-mono text-[13px] font-medium text-[#f59e0b]">Microphone access required</p>
          )}

          <button
            type="button"
            disabled={starting}
            onClick={async () => {
              setStarting(true);
              try {
                const res = await fetch("/api/check-access", { credentials: "include" });
                const data = await res.json();
                if (!data.canSimulate) {
                  router.push("/pricing?gate=1");
                  return;
                }
                onStartCall();
              } finally {
                setStarting(false);
              }
            }}
            className="font-lp-mono mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#2979ff] py-4 text-[14px] font-semibold text-white hover:bg-[#1a6ae6] transition-colors animate-pulse disabled:opacity-70"
          >
            {starting ? "Checking…" : "Start call"}
          </button>
        </div>
      </main>
    </div>
  );
}
