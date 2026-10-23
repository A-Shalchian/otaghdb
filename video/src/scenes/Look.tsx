import { Img, interpolate, useCurrentFrame } from "remotion";
import { check, item, lookSearch } from "../data";
import { C, mono, sans } from "../theme";
import { card, checker, clamp, Kicker, ModelTag, Rise, Stage, Title, Typed, useIn } from "../ui";

const LEFT = { x: 110, y: 250, w: 800, h: 640 };
const RIGHT = { x: 1010, y: 250, w: 800, h: 640 };

function SearchPanel() {
  const result = useIn(84, 14);
  return (
    <div style={{ position: "absolute", left: LEFT.x, top: LEFT.y, width: LEFT.w, height: LEFT.h, ...card, padding: 40, display: "flex", flexDirection: "column", gap: 28 }}>
      <span style={{ fontFamily: mono, fontSize: 21, color: C.soft, textTransform: "uppercase", letterSpacing: "0.1em" }}>Search by look</span>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderRadius: 18, border: `2px solid ${C.ink}`, background: C.paper }}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2.4}>
          <circle cx={11} cy={11} r={7} />
          <path d="M20 20l-4-4" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: sans, fontSize: 34, color: C.ink }}>
          <Typed text={lookSearch.query} start={16} cps={24} />
        </span>
      </div>
      <div style={{ opacity: result, transform: `translateY(${(1 - result) * 30}px) scale(${0.94 + 0.06 * result})`, display: "flex", gap: 26, alignItems: "center" }}>
        <div style={{ width: 210, height: 210, borderRadius: 22, display: "grid", placeItems: "center", ...checker }}>
          <Img src={item(lookSearch.result.id, "cutout.png")} style={{ maxWidth: 170, maxHeight: 180 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontFamily: mono, fontSize: 19, color: C.accent }}>LOOKS LIKE IT</span>
          <span style={{ fontFamily: sans, fontSize: 38, fontWeight: 700, color: C.ink }}>{lookSearch.result.name}</span>
          <span style={{ fontFamily: mono, fontSize: 21, color: C.soft }}>{lookSearch.result.location}</span>
        </div>
      </div>
      <Rise delay={110}>
        <div style={{ fontFamily: sans, fontSize: 26, color: C.soft, lineHeight: 1.35 }}>No name or tag says &ldquo;reading&rdquo;. It matched how the lamp looks.</div>
      </Rise>
    </div>
  );
}

function CheckPanel() {
  const frame = useCurrentFrame();
  const photo = useIn(120, 16);
  const cut = interpolate(frame, [150, 172], [0, 1], clamp);
  const fill = interpolate(frame, [176, 236], [0, check.score], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const verdict = useIn(240, 14);
  return (
    <div style={{ position: "absolute", left: RIGHT.x, top: RIGHT.y, width: RIGHT.w, height: RIGHT.h, ...card, padding: 40, display: "flex", flexDirection: "column", gap: 26 }}>
      <span style={{ fontFamily: mono, fontSize: 21, color: C.soft, textTransform: "uppercase", letterSpacing: "0.1em" }}>Do I already own this?</span>
      <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
        <div style={{ position: "relative", width: 250, height: 250, borderRadius: 22, overflow: "hidden", opacity: photo, transform: `scale(${0.9 + 0.1 * photo})`, ...checker }}>
          <Img src={check.photo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 1 - cut }} />
          <Img src={check.cutout} style={{ position: "absolute", inset: 20, width: 210, height: 210, objectFit: "contain", opacity: cut }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 110, letterSpacing: "-0.05em", color: C.ink, lineHeight: 1 }}>{Math.round(fill * 100)}%</span>
          <div style={{ height: 16, borderRadius: 99, background: C.line, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${fill * 100}%`, background: C.accent, borderRadius: 99 }} />
          </div>
          <span style={{ fontFamily: mono, fontSize: 19, color: C.soft }}>same thing above 85%</span>
        </div>
      </div>
      <div style={{ opacity: verdict, transform: `translateY(${(1 - verdict) * 24}px)`, display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 20, background: C.accentSoft }}>
        <Img src={item(10, "cutout.png")} style={{ width: 64, height: 64, objectFit: "contain" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: sans, fontSize: 30, fontWeight: 700, color: C.ink }}>Yes, you already own this: {check.name}</span>
          <span style={{ fontFamily: mono, fontSize: 20, color: C.soft }}>{check.location}</span>
        </div>
      </div>
    </div>
  );
}

export function Look() {
  return (
    <Stage>
      <div style={{ position: "absolute", left: LEFT.x, top: 70, display: "flex", flexDirection: "column", gap: 16 }}>
        <Kicker delay={4}>By look, not just by name</Kicker>
        <Title text="Find things by how they look." delay={8} size={84} />
      </div>
      <SearchPanel />
      <CheckPanel />
      <div style={{ position: "absolute", left: LEFT.x, top: 930 }}>
        <ModelTag name="SigLIP 2" does="turns photos and words into comparable vectors" delay={60} />
      </div>
    </Stage>
  );
}
