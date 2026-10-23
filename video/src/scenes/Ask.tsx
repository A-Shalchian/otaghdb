import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { askPassport } from "../data";
import { C, mono, sans } from "../theme";
import { card, clamp, Kicker, ModelTag, Rise, Stage, Title, Typed, useIn } from "../ui";

export function UserBubble({ text, at }: { text: string; at: number }) {
  const p = useIn(at, 16);
  return (
    <div
      style={{
        alignSelf: "flex-end",
        maxWidth: 820,
        padding: "20px 28px",
        borderRadius: "30px 30px 8px 30px",
        background: C.ink,
        color: C.card,
        fontFamily: sans,
        fontSize: 34,
        fontWeight: 500,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.92 + 0.08 * p})`,
        transformOrigin: "right bottom",
        opacity: p,
      }}
    >
      <Typed text={text} start={at + 4} cps={34} caret={false} />
    </div>
  );
}

export function Status({ text, at, until }: { text: string; at: number; until: number }) {
  const frame = useCurrentFrame();
  const p = useIn(at, 200);
  const done = frame >= until;
  const spin = (frame * 12) % 360;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: p, fontFamily: mono, fontSize: 24, color: C.soft }}>
      {done ? (
        <span style={{ width: 26, height: 26, borderRadius: 99, background: C.accent, color: C.card, display: "grid", placeItems: "center", fontSize: 16 }}>✓</span>
      ) : (
        <span style={{ width: 22, height: 22, borderRadius: 99, border: `3px solid ${C.line}`, borderTopColor: C.accent, transform: `rotate(${spin}deg)` }} />
      )}
      {text}
    </div>
  );
}

export function Streamed({ text, at, wps = 9, style }: { text: string; at: number; wps?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const shown = Math.max(0, Math.floor(((frame - at) * wps) / fps));
  return (
    <div style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < shown ? 1 : i === shown ? 0.35 : 0 }}>
          {w}{" "}
        </span>
      ))}
    </div>
  );
}

export const PANEL = { left: 330, top: 260, width: 1260 };

export function Ask() {
  const frame = useCurrentFrame();
  const cardIn = useIn(150, 15);
  const glow = interpolate(frame, [190, 210, 260], [0, 1, 0.6], clamp);
  return (
    <Stage>
      <div style={{ position: "absolute", left: PANEL.left, top: 70, display: "flex", flexDirection: "column", gap: 16 }}>
        <Kicker delay={4}>Ask</Kicker>
        <Title text="Ask where anything is." delay={8} size={84} />
      </div>
      <div style={{ position: "absolute", ...PANEL, ...card, padding: 44, display: "flex", flexDirection: "column", gap: 30 }}>
        <UserBubble text={askPassport.question} at={20} />
        <Status text={askPassport.status} at={58} until={92} />
        <Streamed
          text={askPassport.answer}
          at={96}
          style={{ fontFamily: sans, fontSize: 40, lineHeight: 1.3, fontWeight: 500, color: C.ink, letterSpacing: "-0.015em", maxWidth: 1100 }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: 22,
            borderRadius: 22,
            border: `2px solid ${glow > 0.05 ? C.accent : C.line}`,
            boxShadow: `0 0 0 ${8 * glow}px ${C.accentSoft}`,
            background: C.paper,
            width: 640,
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 30}px)`,
          }}
        >
          <div style={{ width: 84, height: 84, borderRadius: 16, background: "#24324a", display: "grid", placeItems: "center", color: "#c9b27a", fontFamily: mono, fontSize: 14, letterSpacing: "0.1em" }}>
            PASS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: sans, fontSize: 30, fontWeight: 600, color: C.ink }}>{askPassport.item.name}</span>
            <span style={{ fontFamily: mono, fontSize: 22, color: C.soft }}>{askPassport.item.location.join(" › ")}</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: PANEL.left, top: 940, display: "flex", gap: 16 }}>
        <ModelTag name="Qwen3.5 9B" does="calls search tools on your own database" delay={70} />
        <Rise delay={200}>
          <div style={{ fontFamily: mono, fontSize: 22, color: C.soft, paddingTop: 14 }}>answers only point at items that exist</div>
        </Rise>
      </div>
    </Stage>
  );
}
