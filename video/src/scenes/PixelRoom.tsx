import { Img, interpolate, useCurrentFrame } from "remotion";
import { item, sprites } from "../data";
import { C, mono, pixel } from "../theme";
import { clamp, Cursor, Rise, Stage, useIn } from "../ui";

const COLS = 16;
const ROWS = 10;
const WALL_ROWS = 2;
const TILE = 68;
const GRID = { x: (1920 - COLS * TILE) / 2, y: 300 };
const DRAG = { id: 9, to: { x: 10, y: 5 }, grab: 170, drop: 206 };

const center = (x: number, y: number) => ({ x: GRID.x + x * TILE + TILE / 2, y: GRID.y + y * TILE + TILE / 2 });

function Sprite({ id, x, y, i }: { id: number; x: number; y: number; i: number }) {
  const frame = useCurrentFrame();
  const drop = useIn(40 + i * 8, 9, 0.7);
  let pos = center(x, y);
  if (id === DRAG.id && frame >= DRAG.grab) {
    const t = interpolate(frame, [DRAG.grab + 4, DRAG.drop], [0, 1], { ...clamp, easing: (v) => v * v * (3 - 2 * v) });
    const to = center(DRAG.to.x, DRAG.to.y);
    pos = { x: interpolate(t, [0, 1], [pos.x, to.x]), y: interpolate(t, [0, 1], [pos.y, to.y]) };
  }
  const lifted = id === DRAG.id && frame >= DRAG.grab && frame < DRAG.drop + 4;
  const size = TILE - 4;
  return (
    <Img
      src={item(id, "sprite.png")}
      style={{
        position: "absolute",
        left: pos.x - size / 2,
        top: pos.y - size / 2 - (1 - drop) * 400 - (lifted ? 10 : 0),
        width: size,
        height: size,
        imageRendering: "pixelated",
        opacity: drop > 0.01 ? 1 : 0,
        filter: lifted ? "drop-shadow(0 12px 0 rgba(28,27,24,0.25))" : "drop-shadow(0 4px 0 rgba(28,27,24,0.18))",
        zIndex: lifted ? 5 : 1,
      }}
    />
  );
}

export function PixelRoom() {
  const frame = useCurrentFrame();
  const enter = useIn(0, 18);
  const from = { x: 1500, y: 1000 };
  const start = center(12, 7);
  const end = center(DRAG.to.x, DRAG.to.y);
  const approach = interpolate(frame, [140, 168], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
  const carry = interpolate(frame, [DRAG.grab + 4, DRAG.drop], [0, 1], { ...clamp, easing: (v) => v * v * (3 - 2 * v) });
  const cursor =
    frame < DRAG.grab
      ? { x: interpolate(approach, [0, 1], [from.x, start.x]), y: interpolate(approach, [0, 1], [from.y, start.y]) }
      : { x: interpolate(carry, [0, 1], [start.x, end.x]), y: interpolate(carry, [0, 1], [start.y, end.y]) };
  const pressed = frame >= DRAG.grab && frame < DRAG.drop;
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <Rise delay={4}>
          <div style={{ fontFamily: pixel, fontSize: 92, color: C.ink, letterSpacing: "0.02em" }}>Your room, in pixels</div>
        </Rise>
        <Rise delay={16}>
          <div style={{ fontFamily: mono, fontSize: 26, color: C.soft }}>every sprite is the item&apos;s own cutout, shrunk to 48 px and 16 colors</div>
        </Rise>
      </div>
      <div
        style={{
          position: "absolute",
          left: GRID.x - 8,
          top: GRID.y - 8,
          width: COLS * TILE + 16,
          height: ROWS * TILE + 16,
          border: `8px solid ${C.ink}`,
          borderRadius: 14,
          overflow: "hidden",
          opacity: enter,
          transform: `scale(${0.94 + 0.06 * enter})`,
          boxShadow: "0 30px 70px rgba(28,27,24,0.2)",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: WALL_ROWS * TILE, background: C.wall, borderBottom: `10px solid ${C.wallEdge}` }} />
        {Array.from({ length: (ROWS - WALL_ROWS) * COLS }, (_, k) => {
          const x = k % COLS;
          const y = WALL_ROWS + Math.floor(k / COLS);
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: x * TILE,
                top: y * TILE,
                width: TILE,
                height: TILE,
                background: (x + y) % 2 === 0 ? C.floorA : C.floorB,
              }}
            />
          );
        })}
      </div>
      {sprites.map((s, i) => (
        <Sprite key={s.id} {...s} i={i} />
      ))}
      {frame >= 140 ? <Cursor x={cursor.x} y={cursor.y} pressed={pressed} /> : null}
    </Stage>
  );
}
