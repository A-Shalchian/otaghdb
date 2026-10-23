import { AbsoluteFill } from "remotion";
import { C, mono, sans } from "../theme";
import { Rise, Stage, useIn } from "../ui";

export function Outro() {
  const p = useIn(4, 14);
  return (
    <Stage>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 200,
            letterSpacing: "-0.06em",
            color: C.ink,
            opacity: p,
            transform: `scale(${0.9 + 0.1 * p})`,
            filter: `blur(${(1 - p) * 12}px)`,
          }}
        >
          Otagh<span style={{ color: C.accent }}>DB</span>
        </div>
        <Rise delay={20}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 52, letterSpacing: "-0.03em", color: C.ink }}>Know where everything is.</div>
        </Rise>
        <Rise delay={36}>
          <div style={{ fontFamily: mono, fontSize: 28, color: C.soft }}>open source · MIT license · open-weight models · runs offline</div>
        </Rise>
      </AbsoluteFill>
    </Stage>
  );
}
