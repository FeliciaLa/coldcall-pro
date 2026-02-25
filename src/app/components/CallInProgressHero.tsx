"use client";

import { useState, useEffect, useRef } from "react";

const PROSPECT_NAME = "Sarah Chen";
const TRANSCRIPT_LINES: { role: "you" | "prospect"; text: string }[] = [
  { role: "you", text: "Hi Sarah, this is Alex from Vertex — do you have 30 seconds?" },
  { role: "prospect", text: "I'm in back-to-backs. Can you email me?" },
  { role: "you", text: "Happy to. What's the one thing you'd want to see in the first line?" },
  { role: "prospect", text: "How it saves us time. We're drowning in manual reports." },
  { role: "you", text: "Got it. I'll send something focused on that. When's your next 15 min free?" },
  { role: "prospect", text: "Thursday 2pm works. Send the calendar link." },
  { role: "you", text: "Done. Talk Thursday." },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function CallInProgressHero() {
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState<typeof TRANSCRIPT_LINES>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (transcript.length >= TRANSCRIPT_LINES.length) return;
    const delay = 2500 + Math.random() * 1500;
    const id = setTimeout(() => {
      setTranscript((prev) => [...prev, TRANSCRIPT_LINES[prev.length]]);
    }, delay);
    return () => clearTimeout(id);
  }, [transcript.length]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript]);

  const bars = (n: number) => Array.from({ length: n }, (_, i) => i);

  return (
    <div
      className="relative rounded-xl border border-[#1c2128] bg-[#0d1117] shadow-2xl"
      style={{
        transform: "perspective(1200px) rotateY(-6deg) rotateX(2deg)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,118,0.08)",
      }}
    >
      <div className="border-b border-[#1c2128] px-4 py-3 flex items-center justify-between">
        <span className="font-lp-mono text-[11px] uppercase tracking-wider text-[#8b949e]">
          Live call
        </span>
        <span className="font-lp-mono flex items-center gap-1.5 text-[12px] text-[#00e676]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00e676] animate-pulse" />
          {formatTime(seconds)}
        </span>
      </div>

      <div className="px-4 py-3 border-b border-[#1c2128]">
        <span className="font-lp-mono text-[10px] uppercase tracking-wider text-[#8b949e]">
          Prospect
        </span>
        <p className="mt-0.5 text-[15px] font-semibold text-[#e6edf3]">{PROSPECT_NAME}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <p className="font-lp-mono text-[10px] uppercase tracking-wider text-[#2979ff] mb-2">
            You
          </p>
          <div className="flex items-center gap-0.5 h-6">
            {bars(20).map((i) => (
              <div
                key={i}
                className="lp-wave-bar w-1 rounded-full bg-[#2979ff]/80 origin-center"
                style={{ height: "80%" }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="font-lp-mono text-[10px] uppercase tracking-wider text-[#00e676] mb-2">
            Prospect
          </p>
          <div className="flex items-center gap-0.5 h-6">
            {bars(20).map((i) => (
              <div
                key={i}
                className="lp-wave-bar w-1 rounded-full bg-[#00e676]/80 origin-center"
                style={{ height: "80%" }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1c2128] px-4 py-3">
        <p className="font-lp-mono text-[10px] uppercase tracking-wider text-[#8b949e] mb-2">
          Transcript
        </p>
        <div className="font-lp-mono h-32 overflow-y-auto rounded border border-[#1c2128] bg-[#080b0f] p-2 text-[11px] text-[#8b949e]">
          {transcript.length === 0 ? (
            <p className="text-[#6e7681]">Waiting for speech…</p>
          ) : (
            transcript.map((line, i) => (
              <p key={i} className="mt-1 first:mt-0">
                <span className={line.role === "you" ? "text-[#2979ff]" : "text-[#00e676]"}>
                  {line.role === "you" ? "You" : PROSPECT_NAME}:
                </span>{" "}
                <span className="text-[#e6edf3]">{line.text}</span>
              </p>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}
