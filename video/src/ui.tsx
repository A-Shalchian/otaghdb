import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, mono, sans } from "./theme";

export function useIn(delay = 0, damping = 18, mass = 0.8) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass } });
}

export function Rise({ delay = 0, y = 36, blur = 10, style, children }: { delay?: number; y?: number; blur?: number; style?: CSSProperties; children: ReactNode }) {
  const p = useIn(delay, 200);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, filter: `blur(${(1 - p) * blur}px)`, ...style }}>{children}</div>
  );
}

export function Words({ text, delay = 0, stagger = 3, style }: { text: string; delay?: number; stagger?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.25em", ...style }}>
      {text.split(" ").map((word, i) => (
        <Rise key={i} delay={delay + i * stagger} y={28} blur={8}>
          {word}
        </Rise>
      ))}
    </div>
  );
}

export function Typed({ text, start, cps = 28, caret = true, style }: { text: string; start: number; cps?: number; caret?: boolean; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = Math.max(0, Math.min(text.length, Math.floor(((frame - start) * cps) / fps)));
  const typing = frame >= start && shown < text.length + 6;
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, shown)}
      {caret && typing ? <span style={{ opacity: blink || shown < text.length ? 1 : 0, fontWeight: 300 }}>|</span> : null}
    </span>
  );
}

export function Kicker({ children, delay = 0, color = C.accent }: { children: ReactNode; delay?: number; color?: string }) {
  return (
    <Rise delay={delay} y={14} blur={4}>
      <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color }}>{children}</div>
    </Rise>
  );
}

export function Title({ text, delay = 0, size = 76, color = C.ink, style }: { text: string; delay?: number; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <Words
      text={text}
      delay={delay}
      style={{ fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.035em", color, ...style }}
    />
  );
}

export function Sub({ text, delay = 0, color = C.soft, style }: { text: string; delay?: number; color?: string; style?: CSSProperties }) {
  return (
    <Rise delay={delay} y={18} blur={6}>
      <div style={{ fontFamily: sans, fontSize: 32, lineHeight: 1.35, color, ...style }}>{text}</div>
    </Rise>
  );
}

export function ModelTag({ name, does, delay = 0, dark = false }: { name: string; does: string; delay?: number; dark?: boolean }) {
  const p = useIn(delay, 14);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 18px 10px 12px",
        borderRadius: 999,
        background: dark ? "rgba(251,250,246,0.08)" : C.card,
        border: `1.5px solid ${dark ? "rgba(251,250,246,0.18)" : C.line}`,
        boxShadow: dark ? "none" : "0 10px 30px rgba(28,27,24,0.08)",
        transform: `scale(${0.6 + 0.4 * p})`,
        opacity: p,
        fontFamily: mono,
        fontSize: 21,
        color: dark ? C.card : C.ink,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 5px ${C.accentSoft}` }} />
      <span style={{ fontWeight: 500 }}>{name}</span>
      <span style={{ color: dark ? "rgba(251,250,246,0.6)" : C.soft }}>{does}</span>
    </div>
  );
}

export function Chip({ children, active = false, style }: { children: ReactNode; active?: boolean; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 16px",
        borderRadius: 999,
        border: `1.5px solid ${active ? C.ink : C.line}`,
        background: active ? C.ink : C.card,
        color: active ? C.card : C.ink,
        fontFamily: mono,
        fontSize: 22,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export const checker: CSSProperties = {
  backgroundColor: "#f7f5ef",
  backgroundImage: "conic-gradient(#ebe7dc 25%, transparent 0 50%, #ebe7dc 0 75%, transparent 0)",
  backgroundSize: "28px 28px",
};

export const card: CSSProperties = {
  background: C.card,
  border: `1.5px solid ${C.line}`,
  borderRadius: 28,
  boxShadow: "0 30px 80px rgba(28,27,24,0.10), 0 4px 14px rgba(28,27,24,0.06)",
};

export function Stage({ dark = false, children }: { dark?: boolean; children: ReactNode }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.035]);
  return (
    <AbsoluteFill style={{ background: dark ? C.ink : C.paper, fontFamily: sans, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dark ? "rgba(251,250,246,0.07)" : "rgba(28,27,24,0.07)"} 1.5px, transparent 1.5px)`,
          backgroundSize: "36px 36px",
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          background: dark
            ? "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45))"
            : "radial-gradient(ellipse at center, transparent 60%, rgba(28,27,24,0.08))",
        }}
      />
    </AbsoluteFill>
  );
}

export function Tap({ x, y, at }: { x: number; y: number; at: number }) {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -14 || t > 30) return null;
  const press = interpolate(t, [-14, 0, 6], [0, 1, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = interpolate(t, [0, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 26,
          top: y - 26,
          width: 52,
          height: 52,
          borderRadius: 99,
          background: "rgba(251,250,246,0.85)",
          border: `3px solid ${C.ink}`,
          transform: `scale(${press})`,
          opacity: interpolate(t, [18, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 60,
          top: y - 60,
          width: 120,
          height: 120,
          borderRadius: 99,
          border: `3px solid ${C.card}`,
          transform: `scale(${ring})`,
          opacity: 1 - ring,
        }}
      />
    </>
  );
}

export function Cursor({ x, y, pressed = false }: { x: number; y: number; pressed?: boolean }) {
  return (
    <svg
      width={44}
      height={44}
      viewBox="0 0 24 24"
      style={{ position: "absolute", left: x - 6, top: y - 3, transform: `scale(${pressed ? 0.88 : 1})`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" }}
    >
      <path d="M5 3l14 8-6.5 1.6L9.5 19z" fill={C.ink} stroke={C.card} strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
}

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
