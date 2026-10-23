import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const frames = process.argv.slice(2).map(Number);
const out = new URL("../out/stills/", import.meta.url);
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: new URL("../src/index.ts", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1") });
const composition = await selectComposition({ serveUrl, id: "Demo" });
console.log(`duration ${composition.durationInFrames} frames`);
for (const frame of frames) {
  const output = decodeURIComponent(new URL(`f${String(frame).padStart(4, "0")}.png`, out).pathname).replace(/^\/([A-Za-z]:)/, "$1");
  await renderStill({ serveUrl, composition, frame, output, scale: 0.5 });
  console.log(output);
}
