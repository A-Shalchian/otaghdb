import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { clutter } from "../data";
import { C, sans } from "../theme";
import { clamp, Stage, Typed, useIn, Words } from "../ui";

const QUESTION = "Where did I put my passport?";

const SPOTS = [
  { x: 210, y: 210, h: 120, r: -14 },
  { x: 520, y: 120, h: 150, r: 9 },
  { x: 1500, y: 150, h: 170, r: -6 },
  { x: 1760, y: 380, h: 220, r: 12 },
  { x: 150, y: 560, h: 260, r: 4 },
  { x: 1650, y: 820, h: 170, r: -10 },
  { x: 330, y: 900, h: 150, r: 14 },
  { x: 1240, y: 960, h: 140, r: -4 },
  { x: 780, y: 960, h: 130, r: 8 },
  { x: 1320, y: 110, h: 90, r: -18 },
];

function Thing({ src, index }: { src: string; index: number }) {
  const frame = useCurrentFrame();
  const spot = SPOTS[index];
  const p = useIn(6 + index * 5, 12);
  const drift = Math.sin((frame + index * 40) / 45) * 10;
  const spin = Math.sin((frame + index * 25) / 70) * 4;
  const leave = interpolate(frame, [95, 120], [1, 0.35], clamp);
  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        left: spot.x,
        top: spot.y + drift,
        height: spot.h,
        transform: `translate(-50%, -50%) rotate(${spot.r + spin}deg) scale(${p})`,
        opacity: p * leave,
        filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))",
      }}
    />
  );
}

export function Hook() {
  const frame = useCurrentFrame();
  const first = interpolate(frame, [86, 100], [1, 0], clamp);
  return (
    <Stage dark>
      {clutter.map((src, i) => (
        <Thing key={src} src={src} index={i} />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: first }}>
        <Words text="I just moved." delay={8} stagger={5} style={{ fontFamily: sans, fontWeight: 800, fontSize: 150, letterSpacing: "-0.045em", color: C.card }} />
        <Words
          text="And I have so much stuff."
          delay={34}
          stagger={4}
          style={{ fontFamily: sans, fontWeight: 500, fontSize: 64, letterSpacing: "-0.02em", color: "rgba(251,250,246,0.6)", marginTop: 18 }}
        />
      </AbsoluteFill>
      {frame >= 100 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", fontFamily: sans, fontWeight: 800, fontSize: 112, letterSpacing: "-0.045em", color: C.card, lineHeight: 1.05, whiteSpace: "nowrap" }}>
            <span style={{ visibility: "hidden" }}>{QUESTION}</span>
            <span style={{ position: "absolute", left: 0, top: 0 }}>
              <Typed text={QUESTION} start={104} cps={26} />
            </span>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
}
