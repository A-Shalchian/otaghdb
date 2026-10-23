import { AbsoluteFill } from "remotion";
import { C, mono, sans } from "../theme";
import { Rise, Stage, useIn, Wordmark, Words } from "../ui";

export function Logo() {
  const p = useIn(4, 14);
  return (
    <Stage>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Wordmark size={220} style={{ transform: `scale(${0.86 + 0.14 * p})`, opacity: p, filter: `blur(${(1 - p) * 14}px)` }} />
        <Rise delay={22} y={16} blur={6}>
          <div style={{ fontFamily: mono, fontSize: 30, color: C.soft, display: "flex", gap: 18, alignItems: "center" }}>
            <span>otagh</span>
            <span style={{ fontFamily: "Segoe UI, Tahoma, sans-serif", fontSize: 36, color: C.ink }}>اتاق</span>
            <span>= room, in Persian</span>
          </div>
        </Rise>
        <Words
          text="Your room, as a searchable database."
          delay={40}
          stagger={3}
          style={{ fontFamily: sans, fontWeight: 600, fontSize: 56, letterSpacing: "-0.03em", color: C.ink, marginTop: 20 }}
        />
      </AbsoluteFill>
    </Stage>
  );
}
