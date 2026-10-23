import { Img, interpolate, useCurrentFrame } from "remotion";
import { drawer } from "../data";
import { C, mono, sans } from "../theme";
import { card, checker, clamp, Kicker, ModelTag, Stage, Title, useIn } from "../ui";

const PHOTO = { x: 110, y: 240, w: 900 };
const SCALE = PHOTO.w / drawer.size.w;
const PHOTO_H = drawer.size.h * SCALE;
const GRID = { x: 1080, y: 240, cols: 2, cardW: 360, cardH: 150, gap: 20 };
const BOX_AT = (n: number) => 40 + n * 9;
const FLY_AT = (n: number) => 175 + n * 7;

function slot(n: number) {
  const col = n % GRID.cols;
  const row = Math.floor(n / GRID.cols);
  return { x: GRID.x + col * (GRID.cardW + GRID.gap), y: GRID.y + row * (GRID.cardH + GRID.gap) };
}

function Box({ n, name, box }: { n: number; name: string; box: number[] }) {
  const frame = useCurrentFrame();
  const p = useIn(BOX_AT(n), 16);
  const [x1, y1, x2, y2] = box.map((v) => v * SCALE);
  const fade = interpolate(frame, [FLY_AT(n), FLY_AT(n) + 12], [1, 0.25], clamp);
  return (
    <div style={{ position: "absolute", left: x1, top: y1, width: x2 - x1, height: y2 - y1, opacity: p * fade }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `4px solid ${C.card}`,
          outline: `2px solid ${C.accent}`,
          borderRadius: 10,
          transform: `scale(${1.15 - 0.15 * p})`,
          boxShadow: "0 0 0 4000px rgba(28,27,24,0)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 6,
          top: 6,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px 4px 4px",
          borderRadius: 99,
          background: C.ink,
          color: C.card,
          fontFamily: sans,
          fontSize: 19,
          fontWeight: 600,
          whiteSpace: "nowrap",
          transform: `scale(${p})`,
          transformOrigin: "left top",
        }}
      >
        <span style={{ width: 26, height: 26, borderRadius: 99, background: C.accent, display: "grid", placeItems: "center", fontFamily: mono, fontSize: 16 }}>{n + 1}</span>
        {name}
      </div>
    </div>
  );
}

function Flyer({ n, name, box, image }: { n: number; name: string; box: number[]; image: string }) {
  const p = useIn(FLY_AT(n), 15, 0.9);
  const [x1, y1, x2, y2] = box.map((v) => v * SCALE);
  const from = { x: PHOTO.x + x1, y: PHOTO.y + y1, w: x2 - x1, h: y2 - y1 };
  const s = slot(n);
  const to = { x: s.x + 14, y: s.y + 14, w: GRID.cardH - 28, h: GRID.cardH - 28 };
  const x = interpolate(p, [0, 1], [from.x, to.x]);
  const y = interpolate(p, [0, 1], [from.y, to.y]) - Math.sin(p * Math.PI) * 120;
  const w = interpolate(p, [0, 1], [from.w, to.w]);
  const h = interpolate(p, [0, 1], [from.h, to.h]);
  if (p <= 0.001) return null;
  return (
    <Img
      src={image}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        objectFit: "contain",
        filter: `drop-shadow(0 ${16 * Math.sin(p * Math.PI)}px 18px rgba(28,27,24,0.3))`,
        zIndex: 5,
      }}
    />
  );
}

function Slot({ n, name }: { n: number; name: string }) {
  const p = useIn(FLY_AT(n) - 6, 200);
  const s = slot(n);
  return (
    <div
      style={{
        position: "absolute",
        left: s.x,
        top: s.y,
        width: GRID.cardW,
        height: GRID.cardH,
        ...card,
        borderRadius: 22,
        boxShadow: "0 14px 30px rgba(28,27,24,0.08)",
        opacity: p,
        transform: `scale(${0.9 + 0.1 * p})`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ width: GRID.cardH - 28, height: GRID.cardH - 28, marginLeft: 14, borderRadius: 14, ...checker }} />
      <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontFamily: mono, fontSize: 16, color: C.soft }}>#{n + 1}</span>
        <span style={{ fontFamily: sans, fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1.15 }}>{name}</span>
      </div>
    </div>
  );
}

export function Drawer() {
  const frame = useCurrentFrame();
  const enter = useIn(0, 20);
  const found = Math.min(drawer.objects.length, Math.max(0, Math.floor((frame - 40) / 9) + 1));
  return (
    <Stage>
      <div style={{ position: "absolute", left: PHOTO.x, top: 70, display: "flex", flexDirection: "column", gap: 18 }}>
        <Kicker delay={6}>Add a whole drawer, shelf or room</Kicker>
        <Title text="One photo. Every object." delay={10} size={84} />
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: PHOTO.x,
            top: PHOTO.y,
            width: PHOTO.w,
            height: PHOTO_H,
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 40px 90px rgba(28,27,24,0.25)",
            transform: `rotateX(${(1 - enter) * 28}deg) rotateZ(${(1 - enter) * -4}deg) translateY(${(1 - enter) * 120}px)`,
            transformOrigin: "50% 100%",
            opacity: enter,
          }}
        >
          <Img src={drawer.photo} style={{ width: "100%", height: "100%" }} />
          {drawer.objects.map((o) => (
            <Box key={o.n} n={o.n} name={o.name} box={o.box} />
          ))}
        </div>
      </div>
      {drawer.objects.map((o) => (
        <Slot key={o.n} n={o.n} name={o.name} />
      ))}
      {drawer.objects.map((o) => (
        <Flyer key={o.n} {...o} />
      ))}
      <div style={{ position: "absolute", left: PHOTO.x, top: PHOTO.y + PHOTO_H + 34, display: "flex", gap: 16, alignItems: "center" }}>
        <ModelTag name="Qwen3.5 9B" does={frame >= 40 ? `found ${found} things` : "looking..."} delay={30} />
        <ModelTag name="SAM 2.1" does="cut all 8 out in one pass" delay={170} />
      </div>
      <div
        style={{
          position: "absolute",
          left: GRID.x,
          top: GRID.y + 4 * (GRID.cardH + GRID.gap) + 12,
          fontFamily: mono,
          fontSize: 22,
          color: C.soft,
          opacity: interpolate(frame, [260, 280], [0, 1], clamp),
        }}
      >
        untick mistakes, tap anything missed, save the batch
      </div>
    </Stage>
  );
}
