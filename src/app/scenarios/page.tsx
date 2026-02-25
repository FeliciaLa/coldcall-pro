"use client";

import { useState } from "react";
import Link from "next/link";
import { getScenarioList, type ScenarioId } from "@/lib/scenarios";

function PersonaAvatar({ avatarUrl, prospectName }: { avatarUrl?: string; prospectName: string }) {
  const [error, setError] = useState(false);
  const showImg = avatarUrl && !error;
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#1c2128] bg-[#080b0f] ring-1 ring-[#1c2128] group-hover:border-[#00e676]/40">
      {showImg ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-[#00e676]">
          {prospectName.charAt(0)}
        </span>
      )}
    </div>
  );
}

const ROUTES: Record<ScenarioId, string> = {
  gatekeeper: "gatekeeper",
  skeptic: "skeptic",
  "friendly-dead-end": "friendly-dead-end",
  hostile: "hostile",
  "warm-referral": "warm-referral",
};

export default function ScenariosPage() {
  const scenarios = getScenarioList();

  return (
    <div className="landing-dark min-h-screen bg-[#080b0f] text-[#e6edf3]">
      <nav className="sticky top-0 z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-4 backdrop-blur-md bg-[#080b0f]/80 border-b border-[#1c2128]">
        <Link href="/" className="font-lp-heading text-[15px] font-semibold tracking-tight text-[#e6edf3]">
          ColdCall Pro
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/"
            className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        <h1 className="font-lp-heading mt-8 text-2xl font-bold tracking-tight text-[#e6edf3] md:text-3xl">
          Choose your scenario
        </h1>
        <p className="font-lp-mono mt-2 text-[13px] text-[#8b949e]">
          Each prospect tests a different skill. Pick one and start your call.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <Link
              key={s.id}
              href={`/sim/${ROUTES[s.id]}`}
              className="group flex flex-col rounded-xl border border-[#1c2128] bg-[#0d1117] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00e676]/30 hover:shadow-lg hover:shadow-[#00e676]/5"
            >
              <PersonaAvatar avatarUrl={s.avatarUrl} prospectName={s.prospectName} />
              <h2 className="font-lp-heading mt-4 text-lg font-bold text-[#e6edf3]">
                {s.prospectName}
              </h2>
              <p className="font-lp-mono mt-0.5 text-[12px] text-[#8b949e]">
                {s.prospectTitle} · {s.company}
              </p>
              <span className="font-lp-mono mt-3 inline-flex w-fit rounded border border-[#1c2128] bg-[#080b0f] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#00e676]">
                {s.difficulty}
              </span>
              <p className="mt-3 text-[14px] leading-relaxed text-[#8b949e]">
                {s.challengeDescription}
              </p>
              <span className="font-lp-mono mt-4 text-[12px] font-semibold text-[#2979ff]">
                {s.skillTag} →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
