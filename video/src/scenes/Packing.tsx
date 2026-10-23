import { Img, interpolate, useCurrentFrame } from "remotion";
import { item, packing } from "../data";
import { C, mono, sans } from "../theme";
import { card, checker, clamp, Kicker, Stage, Title, useIn } from "../ui";
import { PANEL, Status, UserBubble } from "./Ask";

const TICK_AT = (i: number) => 196 + i * 16;

function OwnedRow({ i, id, name, location }: { i: number; id: number; name: string; location: string }) {
  const frame = useCurrentFrame();
  const p = useIn(150 + i * 6, 200);
  const ticked = frame >= TICK_AT(i);
  const pop = useIn(TICK_AT(i), 10);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          border: `2.5px solid ${ticked ? C.accent : C.line}`,
          background: ticked ? C.accent : C.card,
          color: C.card,
          display: "grid",
          placeItems: "center",
          fontSize: 22,
          transform: `scale(${ticked ? 0.8 + 0.2 * pop : 1})`,
        }}
      >
        {ticked ? "✓" : ""}
      </div>
      <div style={{ width: 70, height: 70, borderRadius: 14, display: "grid", placeItems: "center", ...checker }}>
        <Img src={item(id, "cutout.png")} style={{ maxWidth: 60, maxHeight: 60 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: sans, fontSize: 27, fontWeight: 600, color: C.ink, textDecoration: ticked ? "line-through" : "none", textDecorationColor: C.soft }}>{name}</span>
        <span style={{ fontFamily: mono, fontSize: 19, color: C.soft }}>{location}</span>
      </div>
    </div>
  );
}

export function Packing() {
  const frame = useCurrentFrame();
  const proposal = useIn(78, 15);
  const press = interpolate(frame, [120, 126, 134], [0, 1, 0], clamp);
  const applied = frame >= 128;
  const list = useIn(140, 18);
  const collapse = interpolate(frame, [128, 146], [1, 0], clamp);
  return (
    <Stage>
      <div style={{ position: "absolute", left: PANEL.left, top: 70, display: "flex", flexDirection: "column", gap: 16 }}>
        <Kicker delay={4}>Plan a trip</Kicker>
        <Title text="Pack from what you own." delay={8} size={84} />
      </div>
      <div style={{ position: "absolute", ...PANEL, height: 700, ...card, padding: 44, display: "flex", flexDirection: "column", gap: 26, overflow: "hidden" }}>
        <UserBubble text={packing.question} at={14} />
        <Status text={packing.status} at={50} until={76} />
        <div
          style={{
            opacity: proposal * collapse,
            transform: `translateY(${(1 - proposal) * 24}px)`,
            maxHeight: 200 * collapse,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 30,
            padding: "24px 28px",
            borderRadius: 22,
            border: `2px solid ${C.line}`,
            background: C.paper,
          }}
        >
          <span style={{ fontFamily: sans, fontSize: 28, color: C.ink, lineHeight: 1.3 }}>
            Make the list <b>&ldquo;{packing.title}&rdquo;</b> with {packing.owned.length} things you own and {packing.missing.length} you don&apos;t
          </span>
          <span
            style={{
              padding: "14px 30px",
              borderRadius: 99,
              background: applied ? C.accent : C.ink,
              color: C.card,
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 24,
              transform: `scale(${1 - 0.08 * press})`,
              whiteSpace: "nowrap",
            }}
          >
            {applied ? "Applied" : "Apply"}
          </span>
        </div>
        {frame >= 136 ? (
          <div style={{ display: "flex", gap: 60, opacity: list }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1.4 }}>
              <span style={{ fontFamily: mono, fontSize: 20, color: C.soft, textTransform: "uppercase", letterSpacing: "0.1em" }}>You own · {packing.title}</span>
              {packing.owned.map((o, i) => (
                <OwnedRow key={o.id} i={i} {...o} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              <span style={{ fontFamily: mono, fontSize: 20, color: C.soft, textTransform: "uppercase", letterSpacing: "0.1em" }}>To buy</span>
              {packing.missing.map((m, i) => (
                <MissingRow key={m} name={m} at={160 + i * 6} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Stage>
  );
}

function MissingRow({ name, at }: { name: string; at: number }) {
  const p = useIn(at, 200);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
      <span style={{ width: 10, height: 10, borderRadius: 99, background: C.soft }} />
      <span style={{ fontFamily: sans, fontSize: 27, color: C.ink }}>{name}</span>
    </div>
  );
}
