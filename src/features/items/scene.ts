import { describeItem, detectObjects } from "@/lib/ollama";
import {
  cropBox,
  onWhite,
  readSceneCutSource,
  readStaged,
  scaleBox,
  SCENE_MAX_SIDE,
  stagedUrl,
  stagePhoto,
  stageSceneCopy,
  writeStaged,
} from "@/lib/images";
import { errorMessage } from "@/lib/services";
import { segment } from "@/lib/vision";

export type SceneObject = {
  n: number;
  name: string;
  category: string;
  clothingType: string | null;
  color: string;
  box: [number, number, number, number];
  cutout: boolean;
};

export type SceneCandidate = SceneObject & { imageUrl: string };

export function candidate(token: string, object: SceneObject): SceneCandidate {
  return { ...object, imageUrl: stagedUrl(token, `obj-${object.n}.png`) };
}

export async function readSceneObjects(token: string): Promise<SceneObject[]> {
  const raw = await readStaged(token, "objects.json");
  return raw ? (JSON.parse(raw.toString("utf8")) as SceneObject[]) : [];
}

async function writeSceneObjects(token: string, objects: SceneObject[]) {
  await writeStaged(token, "objects.json", JSON.stringify(objects));
}

async function cutBoxes(scene: Buffer, boxes: SceneObject["box"][]) {
  try {
    return { pngs: (await segment(scene, { boxes })).map((s) => s.png), cutout: true };
  } catch {
    const crops = await Promise.all(boxes.map((box) => cropBox(scene, box, 0)));
    return { pngs: crops, cutout: false };
  }
}

export async function analyzeScene(photo: Buffer) {
  const staged = await stagePhoto(photo, SCENE_MAX_SIDE, "scene.jpg");
  const full = await stageSceneCopy(staged.token, photo);
  const scale = full.width / staged.width;
  const base = { token: staged.token, width: staged.width, height: staged.height };

  let detections;
  try {
    detections = (await detectObjects(staged.jpg, staged.width, staged.height)).objects;
  } catch (error) {
    await writeSceneObjects(staged.token, []);
    return { ...base, candidates: [], warning: `${errorMessage(error)} Tap each thing on the photo instead.` };
  }

  const { pngs, cutout } = await cutBoxes(full.jpg, detections.map((d) => scaleBox(d.box, scale)));
  const objects: SceneObject[] = detections.map((d, n) => ({ ...d, n, cutout }));
  await Promise.all(objects.map((o) => writeStaged(staged.token, `obj-${o.n}.png`, pngs[o.n])));
  await writeSceneObjects(staged.token, objects);

  return {
    ...base,
    candidates: objects.map((o) => candidate(staged.token, o)),
    warning: cutout ? null : "The vision service is off, so these are plain crops without cutouts.",
  };
}

export async function addScenePoint(token: string, x: number, y: number) {
  const source = await readSceneCutSource(token);
  if (!source) throw new Error("That photo expired. Take it again.");
  const point: [number, number] = [Math.round(x * source.scale), Math.round(y * source.scale)];
  const [object] = await segment(source.full, { points: [point] });
  if (!object) throw new Error("Nothing found there. Tap closer to the middle of the thing.");

  const { guess } = await describeItem(await onWhite(object.png));
  const objects = await readSceneObjects(token);
  const added: SceneObject = {
    n: objects.reduce((max, o) => Math.max(max, o.n + 1), 0),
    name: guess.name,
    category: guess.category,
    clothingType: guess.clothingType,
    color: guess.color,
    box: scaleBox(object.box, 1 / source.scale),
    cutout: true,
  };
  await writeStaged(token, `obj-${added.n}.png`, object.png);
  await writeSceneObjects(token, [...objects, added]);
  return candidate(token, added);
}
