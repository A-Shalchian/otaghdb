import { interpolate, useCurrentFrame } from "remotion";
import { models } from "../data";
import { C, mono, sans } from "../theme";
import { clamp, Rise, Stage, useIn, Words } from "../ui";

function WifiOff({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const p = useIn(at, 14);
  const strike = interpolate(frame, [at + 12, at + 26], [0, 1], clamp);
  return (
    <svg width={150} height={150} viewBox="0 0 24 24" fill="none" stroke={C.card} strokeWidth={1.8} strokeLinecap="round" style={{ opacity: p, transform: `scale(${0.7 + 0.3 * p})` }}>
      <path d="M2 8.8a15 15 0 0 1 20 0" opacity={0.85} />
      <path d="M5 12.5a10 10 0 0 1 14 0" opacity={0.85} />
      <path d="M8.5 16a5 5 0 0 1 7 0" opacity={0.85} />
      <circle cx={12} cy={19.5} r={0.9} fill={C.card} />
      <path d="M3 3l18 18" stroke="#e2725b" strokeWidth={2.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
    </svg>
  );
}

function ModelCard({ i, name, job, runs }: { i: number; name: string; job: string; runs: string }) {
  const p = useIn(70 + i * 12, 15);
  return (
    <div
      style={{
        width: 390,
        height: 300,
        padding: 32,
        borderRadius: 28,
        background: "rgba(251,250,246,0.06)",
        border: "1.5px solid rgba(251,250,246,0.16)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: p,
        transform: `translateY(${(1 - p) * 80}px) rotateX(${(1 - p) * 30}deg)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontFamily: sans, fontSize: 42, fontWeight: 700, color: C.card, letterSpacing: "-0.03em" }}>{name}</span>
        <span style={{ fontFamily: sans, fontSize: 25, lineHeight: 1.35, color: "rgba(251,250,246,0.7)" }}>{job}</span>
      </div>
      <div style={{ display: "flex", gap: 10, fontFamily: mono, fontSize: 18 }}>
        <span style={{ padding: "5px 12px", borderRadius: 99, background: C.accent, color: C.card }}>Apache 2.0</span>
        <span style={{ padding: "5px 12px", borderRadius: 99, border: "1.5px solid rgba(251,250,246,0.25)", color: "rgba(251,250,246,0.75)" }}>{runs}</span>
      </div>
    </div>
  );
}

export function Local() {
  return (
    <Stage dark>
      <div style={{ position: "absolute", left: 0, right: 0, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <WifiOff at={20} />
        <Words
          text="Runs 100% on your laptop."
          delay={6}
          stagger={4}
          style={{ fontFamily: sans, fontWeight: 800, fontSize: 104, letterSpacing: "-0.045em", color: C.card, justifyContent: "center" }}
        />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", gap: 28, perspective: 1600 }}>
        {models.map((m, i) => (
          <ModelCard key={m.name} i={i} {...m} />
        ))}
      </div>
      <Rise delay={170} style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 30, color: "rgba(251,250,246,0.75)" }}>No API keys. No cloud. Your photos never leave the laptop.</div>
      </Rise>
    </Stage>
  );
}
