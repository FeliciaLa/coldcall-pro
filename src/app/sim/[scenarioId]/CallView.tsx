"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Scenario } from "@/lib/scenarios";
import type { TranscriptEntry } from "./page";

const MAX_CALL_SECONDS = 10 * 60;
const WARNING_AT_SECONDS = 8 * 60;

/** Classic two-tone phone ring using Web Audio. Returns a stop function. */
function useRingingTone(playing: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    function playBeep(freq: number, startTime: number, duration: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    function playRingCycle() {
      const t = ctx.currentTime;
      playBeep(440, t, 0.2);
      playBeep(480, t + 0.25, 0.2);
      playBeep(440, t + 0.5, 0.2);
      playBeep(480, t + 0.75, 0.2);
    }

    playRingCycle();
    intervalRef.current = setInterval(playRingCycle, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      ctx.close();
      ctxRef.current = null;
    };
  }, [playing]);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (ctxRef.current) ctxRef.current.close();
  };
}

interface CallViewProps {
  scenario: Scenario;
  onEndCall: (transcript: TranscriptEntry[], durationSeconds: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function CallView({ scenario, onEndCall }: CallViewProps) {
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speaking, setSpeaking] = useState<"user" | "prospect" | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  transcriptRef.current = transcript;

  const callResourcesRef = useRef<{ pc: RTCPeerConnection; audio: HTMLAudioElement; stream: MediaStream }[]>([]);

  const stopAllCallAudio = useCallback(() => {
    callResourcesRef.current.forEach(({ pc, audio, stream }) => {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        audio.pause();
        audio.srcObject = null;
        audio.remove();
      } catch {}
      try {
        pc.close();
      } catch {}
    });
    callResourcesRef.current = [];
  }, []);

  const endCall = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAllCallAudio();
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    onEndCall(transcriptRef.current, duration);
  }, [onEndCall, stopAllCallAudio]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= MAX_CALL_SECONDS && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setTimeout(() => endCall(), 500);
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endCall]);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const connectionIdRef = useRef(0);

  useRingingTone(connecting && !error);

  useEffect(() => {
    let cancelled = false;
    const myId = ++connectionIdRef.current;

    async function connect() {
      try {
        const res = await fetch("/api/voice-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: scenario.id }),
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const err = new Error(data.error || "Failed to create voice session") as Error & { code?: string };
          err.code = data.code;
          throw err;
        }
        const { token } = await res.json();
        if (cancelled || connectionIdRef.current !== myId) return;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled || connectionIdRef.current !== myId) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;

        const discardThisConnection = () => {
          stream.getTracks().forEach((t) => t.stop());
          audioEl.pause();
          audioEl.srcObject = null;
          audioEl.remove();
          pc.close();
        };

        if (connectionIdRef.current !== myId) {
          discardThisConnection();
          return;
        }

        peerConnectionRef.current = pc;
        audioElRef.current = audioEl;
        callResourcesRef.current.push({ pc, audio: audioEl, stream });

        pc.ontrack = (e) => {
          if (e.streams?.[0]) audioEl.srcObject = e.streams[0];
        };

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const dc = pc.createDataChannel("oai-events");
        dc.addEventListener("message", (e) => {
          try {
            const event = JSON.parse(e.data as string) as {
              type?: string;
              item?: { content?: Array<{ text?: string; transcript?: string }>; role?: string };
            };
            if (event.type === "response.audio_transcript.done" && event.item?.content) {
              const text = event.item.content.map((c) => (c as { text?: string }).text).filter(Boolean).join("");
              if (text) {
                setTranscript((prev) => [...prev, { role: "assistant", text }]);
              }
            }
            if (event.type === "conversation.item.input_audio_transcription.completed" && event.item?.content) {
              const text = event.item.content.map((c) => (c as { transcript?: string }).transcript).filter(Boolean).join("");
              if (text) {
                setTranscript((prev) => [...prev, { role: "user", text }]);
              }
            }
          } catch {
            // ignore parse errors
          }
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (cancelled || connectionIdRef.current !== myId) {
          discardThisConnection();
          return;
        }

        const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp ?? undefined,
        });
        if (!sdpRes.ok) {
          const errText = await sdpRes.text();
          throw new Error(sdpRes.status === 401 ? "Session expired — try starting the call again" : errText || "Realtime connection failed");
        }
        const answerSdp = await sdpRes.text();
        await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: answerSdp }));

        if (cancelled || connectionIdRef.current !== myId) {
          discardThisConnection();
          const idx = callResourcesRef.current.findIndex((r) => r.pc === pc);
          if (idx !== -1) callResourcesRef.current.splice(idx, 1);
          return;
        }

        setTranscript([{ role: "assistant", text: getGreeting(scenario) }]);
        setConnecting(false);
      } catch (err) {
        if (!cancelled && connectionIdRef.current === myId) {
          const message = err instanceof Error ? err.message : "Connection failed";
          const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined;
          setError(message);
          setAccessDenied(code === "free_used" || message.includes("free call") || message.includes("Unlock"));
          setConnecting(false);
        }
      }
    }

    connect();
    return () => {
      cancelled = true;
      connectionIdRef.current = 0;
      stopAllCallAudio();
    };
  }, [scenario, stopAllCallAudio]);

  const timeWarning = elapsed >= WARNING_AT_SECONDS && elapsed < MAX_CALL_SECONDS;

  return (
    <div
      className="landing-dark flex min-h-screen flex-col bg-[#080b0f]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(13,17,23,0.98) 0%, rgba(8,11,15,0.99) 50%, #080b0f 100%)",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex h-40 w-40 shrink-0 overflow-hidden rounded-full border border-[#1c2128] bg-[#0d1117] shadow-xl ring-2 ring-[#00e676]/20">
          {scenario.avatarUrl && !avatarError ? (
            <img
              src={scenario.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#00e676]">
              {scenario.prospectName.charAt(0)}
            </span>
          )}
        </div>
        <h2 className="font-lp-heading mt-6 text-2xl font-bold tracking-tight text-[#e6edf3]">
          {scenario.prospectName}
        </h2>
        <p className="font-lp-mono mt-1 text-[12px] text-[#8b949e]">
          {scenario.prospectTitle} · {scenario.company}
        </p>

        <div className="mt-8 flex items-center gap-2">
          <span className="font-lp-mono rounded border border-[#1c2128] bg-[#0d1117] px-3 py-1.5 text-[13px] font-medium tabular-nums text-[#00e676]">
            {formatTime(elapsed)}
          </span>
          {timeWarning && (
            <span className="font-lp-mono rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-1.5 text-[12px] font-medium text-[#f59e0b]">
              Wrapping up soon
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="lp-wave-bar h-1.5 w-5 rounded-full bg-[#00e676]/60"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {connecting && (
          <p className="font-lp-mono mt-6 text-[13px] text-[#00e676]">Ringing...</p>
        )}
        {error && (
          <div className="font-lp-mono mt-6 text-center">
            <p className="text-[13px] font-medium text-[#ef4444]">{error}</p>
            {accessDenied && (
              <a
                href="/pricing?gate=1"
                className="mt-3 inline-block rounded-md bg-[#2979ff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1a6ae6]"
              >
                Unlock 50 calls for £9.99
              </a>
            )}
          </div>
        )}
        {speaking && !connecting && (
          <p className="font-lp-mono mt-6 text-[13px] text-[#8b949e]">
            {speaking === "prospect" ? `${scenario.prospectName} is speaking` : "You're speaking"}
          </p>
        )}
      </div>

      <div className="border-t border-[#1c2128] bg-[#080b0f]/95 px-6 py-5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xs items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              localStreamRef.current?.getAudioTracks().forEach((t) => {
                t.enabled = !next;
              });
            }}
            className="font-lp-mono rounded-md border border-[#1c2128] bg-[#0d1117] px-5 py-2.5 text-[12px] font-semibold text-[#e6edf3] hover:border-[#00e676]/30 hover:text-[#00e676]"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            onClick={endCall}
            className="font-lp-mono rounded-md bg-[#dc2626] px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-[#b91c1c]"
          >
            End call
          </button>
        </div>
        <div className="mx-auto mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="font-lp-mono text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3]"
          >
            Need a hint?
          </button>
        </div>
        {showHint && scenario.hint && (
          <p className="font-lp-mono mx-auto mt-3 max-w-sm text-center text-[13px] text-[#8b949e]">
            {scenario.hint}
          </p>
        )}
      </div>
    </div>
  );
}

function getGreeting(scenario: Scenario): string {
  const greetings: Record<string, string> = {
    gatekeeper: "Mark Davidson.",
    skeptic: "This is Rachel.",
    "friendly-dead-end": "Hey there! Tom speaking, how can I help?",
    hostile: "Diana Kessler. What is it?",
    "warm-referral": "James Obi, hey.",
  };
  return greetings[scenario.id] ?? "Hello.";
}
