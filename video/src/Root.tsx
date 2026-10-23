import { AbsoluteFill, Composition } from "remotion";
import { Demo, DURATION } from "./Demo";
import { Soundtrack } from "./Soundtrack";
import { FPS, HEIGHT, WIDTH } from "./theme";

function Video() {
  return (
    <AbsoluteFill>
      <Demo />
      <Soundtrack />
    </AbsoluteFill>
  );
}

export function Root() {
  return <Composition id="Demo" component={Video} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />;
}
