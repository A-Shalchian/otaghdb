import { Img, interpolate, useCurrentFrame } from "remotion";
import { single } from "../data";
import { C, mono, sans } from "../theme";
import { checker, Chip, clamp, Kicker, ModelTag, Rise, Stage, Sub, Tap, Title, Typed, useIn } from "../ui";

const PHONE = { x: 250, y: 70, w: 470, h: 940, bezel: 16 };
const SCREEN_W = PHONE.w - PHONE.bezel * 2;
const PHOTO = { top: 96, w: SCREEN_W, h: (SCREEN_W * single.photoSize.h) / single.photoSize.w };
const S = PHOTO.w / single.photoSize.w;

function Field({ label, at, children }: { label: string; at: number; children: React.ReactNode }) {
  const p = useIn(at, 200);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 12}px)`, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 16, color: C.soft, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      {children}
    </div>
  );
}

function PopChip({ at, children, active }: { at: number; children: React.ReactNode; active?: boolean }) {
  const p = useIn(at, 12);
  return (
    <span style={{ transform: `scale(${p})`, display: "inline-block", opacity: Math.min(1, p * 1.5) }}>
      <Chip active={active} style={{ fontSize: 18, padding: "4px 12px" }}>
        {children}
      </Chip>
    </span>
  );
}

function Screen() {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [28, 30, 40], [0, 1, 0], clamp);
  const fade = interpolate(frame, [64, 92], [1, 0], clamp);
  const lift = useIn(96, 16);
  const box = { x: single.box.x * S, y: single.box.y * S, w: single.box.w * S, h: single.box.h * S };
  const targetW = 330;
  const k = 1 + (targetW / box.w - 1) * lift;
  const cx = interpolate(lift, [0, 1], [box.x + box.w / 2, PHOTO.w / 2]);
  const cy = interpolate(lift, [0, 1], [box.y + box.h / 2, PHOTO.h / 2]);
  const saved = useIn(372, 14);

  return (
    <div style={{ position: "absolute", inset: PHONE.bezel, borderRadius: 50, overflow: "hidden", background: C.card }}>
      <div style={{ position: "absolute", top: 18, left: "50%", width: 120, height: 32, marginLeft: -60, borderRadius: 99, background: C.ink }} />
      <div style={{ position: "absolute", top: 60, left: 24, fontFamily: sans, fontWeight: 600, fontSize: 22, color: C.ink }}>Photograph one thing</div>
      <div style={{ position: "absolute", top: PHOTO.top, left: 0, width: PHOTO.w, height: PHOTO.h, overflow: "hidden", ...checker }}>
        <Img
          src={single.photo}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: fade,
            filter: `blur(${(1 - fade) * 6}px)`,
            transform: `scale(${frame < 30 ? 1.06 : 1})`,
          }}
        />
        {frame >= 64 ? (
          <Img
            src={single.cutout}
            style={{
              position: "absolute",
              left: cx - (box.w * k) / 2,
              top: cy - (box.h * k) / 2,
              width: box.w * k,
              height: box.h * k,
              filter: `drop-shadow(0 ${14 * lift}px ${18 * lift}px rgba(28,27,24,0.28))`,
              transform: `rotate(${-8 * lift}deg)`,
            }}
          />
        ) : null}
        <Tap x={box.x + box.w / 2} y={box.y + box.h / 2} at={50} />
        <div style={{ position: "absolute", inset: 0, background: "white", opacity: flash }} />
      </div>
      <div style={{ position: "absolute", top: PHOTO.top + PHOTO.h + 22, left: 24, right: 24, display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Name" at={122}>
          <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 600, color: C.ink, minHeight: 34 }}>
            <Typed text={single.name} start={126} cps={30} />
          </div>
        </Field>
        <Field label="Category · color" at={150}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <PopChip at={154} active>
              {single.category}
            </PopChip>
            <span style={{ fontFamily: sans, fontSize: 22, color: C.ink }}>
              <Typed text={single.color} start={160} cps={34} caret={false} />
            </span>
          </div>
        </Field>
        <Field label="Tags" at={180}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {single.tags.slice(0, 3).map((tag, i) => (
              <PopChip key={tag} at={184 + i * 5}>
                #{tag}
              </PopChip>
            ))}
          </div>
        </Field>
        <Field label="Where it goes" at={250}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {single.place.map((part, i) => (
              <span key={part} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {i > 0 ? <span style={{ fontFamily: mono, fontSize: 18, color: C.soft }}>›</span> : null}
                <PopChip at={262 + i * 14} active={i === single.place.length - 1}>
                  {part}
                </PopChip>
              </span>
            ))}
          </div>
        </Field>
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 22,
          height: 60,
          borderRadius: 99,
          background: saved > 0.05 ? C.accent : C.ink,
          color: C.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 24,
          transform: `scale(${1 - 0.05 * interpolate(frame, [364, 370, 378], [0, 1, 0], clamp)})`,
        }}
      >
        {saved > 0.05 ? "✓ Saved" : "Save item"}
      </div>
    </div>
  );
}

export function SnapOne() {
  const frame = useCurrentFrame();
  const enter = useIn(0, 20);
  const tilt = interpolate(enter, [0, 1], [-26, -9]);
  const second = interpolate(frame, [236, 250], [1, 0], clamp);
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        <div
          style={{
            position: "absolute",
            left: PHONE.x,
            top: PHONE.y,
            width: PHONE.w,
            height: PHONE.h,
            borderRadius: 66,
            background: C.ink,
            boxShadow: "0 60px 120px rgba(28,27,24,0.28), 0 10px 30px rgba(28,27,24,0.18)",
            transform: `translateY(${(1 - enter) * 160}px) rotateY(${tilt}deg) rotateX(4deg)`,
            opacity: enter,
          }}
        >
          <Screen />
        </div>
      </div>
      <div style={{ position: "absolute", left: 880, top: 220, width: 900, display: "flex", flexDirection: "column", gap: 26 }}>
        <Kicker delay={10}>Add one thing</Kicker>
        <div style={{ position: "relative", height: 330 }}>
          <div style={{ position: "absolute", inset: 0, opacity: second, display: "flex", flexDirection: "column", gap: 26 }}>
            <Title text="Snap it. Tap it." delay={16} size={96} />
            <Sub text="The background disappears, then Qwen fills in the name, category, color and tags." delay={34} />
          </div>
          {frame >= 244 ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 26 }}>
              <Title text="Then say where it lives." delay={248} size={96} />
              <Sub text="Room, furniture, compartment. Even a bag inside a closet." delay={266} />
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          <ModelTag name="SAM 2.1" does="cut out what you tapped" delay={62} />
          <ModelTag name="Qwen3.5 9B" does="named it, sorted it, tagged it" delay={124} />
        </div>
      </div>
      <Rise delay={390} style={{ position: "absolute", left: 880, top: 860 }}>
        <div style={{ fontFamily: mono, fontSize: 24, color: C.soft }}>cut out and named in about 5 seconds, on a laptop</div>
      </Rise>
    </Stage>
  );
}
