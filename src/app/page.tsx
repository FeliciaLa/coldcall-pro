"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CallInProgressHero } from "./components/CallInProgressHero";

function useFadeUp(once = true) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setVisible(true);
        if (once && el) obs.unobserve(el);
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);
  return { ref, visible };
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [howVisible, setHowVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.target === heroRef.current) setHeroVisible(e.isIntersecting);
          if (e.target === howRef.current) setHowVisible(e.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    if (howRef.current) obs.observe(howRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="landing-dark relative min-h-screen bg-[#080b0f] text-[#e6edf3]">
      <div className="grain-overlay" aria-hidden />
      <div className="scanlines" aria-hidden />

      <nav className="sticky top-0 z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-4 backdrop-blur-md bg-[#080b0f]/80 border-b border-[#1c2128]">
        <span className="font-lp-heading text-[15px] font-semibold tracking-tight text-[#e6edf3]">
          ColdCall Pro
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/scenarios"
            className="font-lp-mono rounded-md bg-[#2979ff] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1a6ae6] transition-colors"
          >
            Try 3 free calls
          </Link>
        </div>
      </nav>

      <main className="relative z-0 mx-auto max-w-6xl px-5">
        <section
          ref={heroRef}
          className="grid gap-10 pt-16 pb-24 md:grid-cols-2 md:items-center md:gap-16 md:pt-24 md:pb-32"
        >
          <div
            className={`transition-all duration-700 ease-out ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h1 className="font-lp-heading max-w-xl text-3xl font-extrabold leading-[1.1] tracking-tight text-[#e6edf3] md:text-4xl lg:text-5xl">
              High-stakes sales combat training. AI prospects that fight back.
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-[#8b949e]">
              The flight simulator for cold calls. Real conversations, real objections, real feedback — before your first live dial.
            </p>
            <Link
              href="/scenarios"
              className="font-lp-mono mt-10 inline-flex items-center gap-2 rounded-md bg-[#2979ff] px-6 py-3.5 text-[13px] font-semibold text-white hover:bg-[#1a6ae6] transition-colors"
            >
              Start a practice call
            </Link>
          </div>
          <div
            className={`transition-all duration-700 ease-out delay-150 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <CallInProgressHero />
          </div>
        </section>

        <section ref={howRef} className="border-t border-[#1c2128] py-20 md:py-28">
          <p
            className={`font-lp-mono transition-all duration-600 ease-out ${
              howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#00e676]">
              How it works
            </span>
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick a scenario",
                body: "Five prospect types — gatekeeper, skeptic, hostile CFO, and more. Each tests a different skill.",
                icon: "scenario",
              },
              {
                step: "02",
                title: "Make the call",
                body: "Voice-to-voice with an AI that stays in character. No scripts — react in real time.",
                icon: "call",
              },
              {
                step: "03",
                title: "Get your scorecard",
                body: "Coaching feedback, key moments, and what to try next time.",
                icon: "score",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`rounded-xl border border-[#1c2128] bg-[#0d1117] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#00e676]/30 hover:shadow-lg hover:shadow-[#00e676]/5 ${
                  howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: howVisible ? `${180 + i * 80}ms` : "0ms",
                }}
              >
                <p className="font-lp-mono text-[12px] font-medium text-[#8b949e]">
                  {item.step} —
                </p>
                <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#1c2128] bg-[#080b0f] text-[#00e676]">
                  {item.icon === "scenario" && (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M4 6h16M4 10h12M4 14h16M4 18h8" />
                    </svg>
                  )}
                  {item.icon === "call" && (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )}
                  {item.icon === "score" && (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  )}
                </div>
                <h3 className="font-lp-heading mt-4 text-[17px] font-bold text-[#e6edf3]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#8b949e]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#1c2128] py-16">
          <p className="font-lp-mono text-[13px] text-[#8b949e]">
            Built for aspiring SDRs who want to walk into interviews ready.
          </p>
        </section>
      </main>

      <footer className="relative z-0 border-t border-[#1c2128] py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 font-lp-mono text-[12px] text-[#8b949e]">
          <span>© ColdCall Pro</span>
          <div className="flex gap-8">
            <Link href="/pricing" className="hover:text-[#e6edf3] transition-colors">Pricing</Link>
            <a href="#" className="hover:text-[#e6edf3] transition-colors">Contact</a>
            <a href="#" className="hover:text-[#e6edf3] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
