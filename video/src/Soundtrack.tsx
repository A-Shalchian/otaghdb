import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { lost } from "./data";
import { SCENE_STARTS } from "./Demo";
import narration from "./narration.json";
import { FPS } from "./theme";
import durations from "./voice-durations.json";

type Sound = "pop" | "tick" | "type" | "tap" | "shutter" | "whoosh" | "swish" | "ding" | "riser";
type Cue = [at: number, sound: Sound, volume: number];

const range = (count: number, start: number, step: number) => Array.from({ length: count }, (_, i) => start + i * step);
const typing = (start: number, frames: number, volume = 0.1): Cue[] => range(Math.ceil(frames / 2), start, 2).map((at) => [at, "type", volume]);

const CUES: Record<string, Cue[]> = {
  hook: [
    ...range(lost.length, 6, 6).map((at): Cue => [at, "pop", 0.1]),
    ...typing(104, 18, 0.14),
    ...lost.map(({ at }, i): Cue => (i === lost.length - 1 ? [at, "pop", 0.32] : [at, "tick", 0.3])),
  ],
  logo: [[6, "ding", 0.22]],
  snap: [
    [28, "shutter", 0.5],
    [50, "tap", 0.45],
    [96, "swish", 0.3],
    ...typing(126, 20),
    [154, "pop", 0.2],
    ...range(3, 184, 5).map((at): Cue => [at, "pop", 0.14]),
    ...range(3, 262, 14).map((at): Cue => [at, "pop", 0.16]),
    [366, "tap", 0.35],
    [372, "ding", 0.28],
  ],
  drawer: [...range(8, 40, 9).map((at): Cue => [at, "pop", 0.18]), ...range(8, 175, 7).map((at): Cue => [at, "swish", 0.16])],
  ask: [
    [20, "pop", 0.24],
    [92, "tick", 0.3],
    [150, "pop", 0.24],
  ],
  packing: [
    [14, "pop", 0.24],
    [76, "tick", 0.3],
    [78, "pop", 0.18],
    [122, "tap", 0.4],
    ...range(5, 160, 6).map((at): Cue => [at, "pop", 0.08]),
    ...range(4, 196, 16).map((at): Cue => [at, "tick", 0.35]),
  ],
  look: [...typing(16, 24), [84, "pop", 0.24], [120, "pop", 0.2], [174, "riser", 0.22], [240, "ding", 0.28]],
  local: [...range(4, 70, 12).map((at): Cue => [at, "pop", 0.18])],
  outro: [[4, "ding", 0.28]],
};

const voices = narration.map((line) => ({
  ...line,
  from: SCENE_STARTS[line.scene] + line.at,
  frames: Math.ceil((durations as Record<string, number>)[line.id] * FPS),
}));

const MUSIC = 0.16;
const DUCKED = 0.06;
const HUSHED = 0.02;
const question = voices.find((v) => v.id === "hook-2")!;

function musicVolume(frame: number, total: number) {
  const duck = Math.max(
    0,
    ...voices.map((v) => interpolate(frame, [v.from - 8, v.from, v.from + v.frames, v.from + v.frames + 12], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
  );
  const edges = interpolate(frame, [0, 45, total - 75, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const volume = (MUSIC - (MUSIC - DUCKED) * duck) * edges;
  // A chord held under the open-ended "my...?" makes it sound like "mine",
  // so the music nearly stops until the words start rolling.
  const roll = SCENE_STARTS.hook + lost[0].at;
  const hush = interpolate(frame, [question.from - 6, question.from, roll, roll + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return volume * (1 - hush) + Math.min(volume, HUSHED) * hush;
}

export function Soundtrack() {
  const { durationInFrames } = useVideoConfig();
  const transitions = Object.entries(SCENE_STARTS).filter(([, start]) => start > 0);
  return (
    <>
      <Audio src={staticFile("audio/music.mp3")} volume={(f) => musicVolume(f, durationInFrames)} />
      {voices.map((v) => (
        <Sequence key={v.id} from={v.from} durationInFrames={v.frames + 6} layout="none">
          <Audio src={staticFile(`audio/voice-${v.id}.wav`)} />
        </Sequence>
      ))}
      {transitions.map(([scene, start]) => (
        <Sequence key={`whoosh-${scene}`} from={start} durationInFrames={24} layout="none">
          <Audio src={staticFile("audio/whoosh.wav")} volume={0.22} />
        </Sequence>
      ))}
      {Object.entries(CUES).flatMap(([scene, cues]) =>
        cues.map(([at, sound, volume], i) => (
          <Sequence key={`${scene}-${i}`} from={SCENE_STARTS[scene] + at} durationInFrames={sound === "riser" ? 64 : 40} layout="none">
            <Audio src={staticFile(`audio/${sound}.wav`)} volume={volume} />
          </Sequence>
        )),
      )}
    </>
  );
}
