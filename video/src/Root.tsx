import { Composition } from "remotion";
import { Demo, DURATION } from "./Demo";
import { FPS, HEIGHT, WIDTH } from "./theme";

export function Root() {
  return <Composition id="Demo" component={Demo} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />;
}
