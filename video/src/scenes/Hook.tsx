import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { lost } from "../data";
import { C, sans } from "../theme";
import { clamp, Stage, Typed, useIn, Words } from "../ui";

const LEAD = "Where did I put my";

const SPOTS = [
  { x: 300, y: 240, h: 150, r: -14 },
  { x: 1610, y: 830, h: 170, r: -8 },
  { x: 1620, y: 250, h: 300, r: 8 },
  { x: 310, y: 830, h: 190, r: 6 },
  { x: 960, y: 150, h: 120, r: -5 },
  { x: 980, y: 890, h: 250, r: 9 },
];

function shownIndex(frame: number) {
  return lost.reduce((last, w, i) => (frame >= w.at ? i : last), -1);
}

function lit(index: number, frame: number) {
  const on = interpolate(frame, [lost[index].at - 2, lost[index].at + 3], [0, 1], clamp);
  const next = lost[index + 1];
  return next ? Math.min(on, interpolate(frame, [next.at - 2, next.at + 3], [1, 0], clamp)) : on;
}

function Thing({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const spot = SPOTS[index];
  const p = useIn(6 + index * 6, 12);
  const l = lit(index, frame);
  const drift = Math.sin((frame + index * 40) / 45) * 10;
  const spin = Math.sin((frame + index * 25) / 70) * 4 * (1 - l);
  const dim = interpolate(frame, [95, 120], [1, 0.3], clamp);
  return (
    <Img
      src={lost[index].src}
      style={{
        position: "absolute",
        left: spot.x,
        top: spot.y + drift * (1 - l),
        height: spot.h,
        transform: `translate(-50%, -50%) rotate(${spot.r * (1 - 0.6 * l) + spin}deg) scale(${p * (1 + 0.35 * l)})`,
        opacity: p * (dim + (1 - dim) * l),
        filter: `drop-shadow(0 18px 24px rgba(0,0,0,0.45)) drop-shadow(0 0 ${28 * l}px rgba(225,231,239,${0.45 * l}))`,
      }}
    />
  );
}

function Slot() {
  const frame = useCurrentFrame();
  const i = shownIndex(frame);
  if (i < 0) return null;
  const t = frame - lost[i].at;
  const enter = interpolate(t, [0, 5], [1, 0], clamp);
  const landed = i === lost.length - 1 ? interpolate(t, [3, 8, 14], [1, 1.07, 1], clamp) : 1;
  const prev = i > 0 ? lost[i - 1] : null;
  return (
    <span style={{ position: "relative", display: "inline-block", transform: `scale(${landed})`, transformOrigin: "left center" }}>
      <span style={{ display: "inline-block", transform: `translateY(${enter * 0.5}em)`, opacity: 1 - enter, filter: `blur(${enter * 8}px)` }}>{lost[i].word}?</span>
      {prev && enter > 0 ? (
        <span style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${-(1 - enter) * 0.5}em)`, opacity: enter, filter: `blur(${(1 - enter) * 8}px)` }}>
          {prev.word}?
        </span>
      ) : null}
    </span>
  );
}

export function Hook() {
  const frame = useCurrentFrame();
  const first = interpolate(frame, [86, 100], [1, 0], clamp);
  return (
    <Stage dark>
      {lost.map((w, i) => (
        <Thing key={w.word} index={i} />
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
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.26em",
              fontFamily: sans,
              fontWeight: 800,
              fontSize: 112,
              letterSpacing: "-0.045em",
              color: C.card,
              lineHeight: 1.05,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ position: "relative" }}>
              <span style={{ visibility: "hidden" }}>{LEAD}</span>
              <span style={{ position: "absolute", left: 0, top: 0 }}>
                <Typed text={LEAD} start={104} cps={30} caret={false} />
              </span>
            </span>
            <span style={{ display: "inline-grid" }}>
              {lost.map((w) => (
                <span key={w.word} style={{ gridArea: "1 / 1", visibility: "hidden" }}>
                  {w.word}?
                </span>
              ))}
              <span style={{ gridArea: "1 / 1" }}>
                <Slot />
              </span>
            </span>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
}
