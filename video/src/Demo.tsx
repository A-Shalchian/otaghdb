import { Fragment } from "react";
import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Ask } from "./scenes/Ask";
import { Drawer } from "./scenes/Drawer";
import { Hook } from "./scenes/Hook";
import { Local } from "./scenes/Local";
import { Logo } from "./scenes/Logo";
import { Look } from "./scenes/Look";
import { Outro } from "./scenes/Outro";
import { Packing } from "./scenes/Packing";
import { PixelRoom } from "./scenes/PixelRoom";
import { SnapOne } from "./scenes/SnapOne";

const TRANSITION = 16;
const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION });

type Into = "fade" | "slide-right" | "slide-up" | "wipe-right" | "wipe-left";

function transition(into: Into) {
  if (into === "slide-right") return <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />;
  if (into === "slide-up") return <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />;
  if (into === "wipe-right") return <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />;
  if (into === "wipe-left") return <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />;
  return <TransitionSeries.Transition presentation={fade()} timing={timing} />;
}

const SCENES: { id: string; frames: number; Scene: () => React.JSX.Element; into: Into }[] = [
  { id: "hook", frames: 240, Scene: Hook, into: "fade" },
  { id: "logo", frames: 120, Scene: Logo, into: "fade" },
  { id: "snap", frames: 420, Scene: SnapOne, into: "slide-right" },
  { id: "drawer", frames: 330, Scene: Drawer, into: "slide-up" },
  { id: "ask", frames: 300, Scene: Ask, into: "wipe-right" },
  { id: "packing", frames: 300, Scene: Packing, into: "slide-right" },
  { id: "look", frames: 300, Scene: Look, into: "slide-up" },
  { id: "pixel", frames: 250, Scene: PixelRoom, into: "wipe-left" },
  { id: "local", frames: 270, Scene: Local, into: "fade" },
  { id: "outro", frames: 150, Scene: Outro, into: "fade" },
];

export const DURATION = SCENES.reduce((sum, s) => sum + s.frames, 0) - TRANSITION * (SCENES.length - 1);

export function Demo() {
  return (
    <TransitionSeries>
      {SCENES.map(({ id, frames, Scene, into }, i) => (
        <Fragment key={id}>
          {i > 0 ? transition(into) : null}
          <TransitionSeries.Sequence durationInFrames={frames}>
            <Scene />
          </TransitionSeries.Sequence>
        </Fragment>
      ))}
    </TransitionSeries>
  );
}

export const SCENE_STARTS = SCENES.reduce<Record<string, number>>((acc, s, i) => {
  const prev = SCENES.slice(0, i).reduce((sum, p) => sum + p.frames - TRANSITION, 0);
  acc[s.id] = prev;
  return acc;
}, {});
