import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DATA_DIR } from "@/lib/db";

export const IMAGE_FILES = {
  "original.jpg": "image/jpeg",
  "cutout.png": "image/png",
  "sprite.png": "image/png",
} as const;

export type ImageFile = keyof typeof IMAGE_FILES;

export const SINGLE_MAX_SIDE = 1024;
export const SCENE_MAX_SIDE = 1280;
const SCENE_CUT_MAX_SIDE = 2048;

const STAGING_DIR = path.join(DATA_DIR, "staging");
const STAGING_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SERVED_STAGED_FILE = /^(original\.jpg|cutout\.png|scene\.jpg|obj-\d{1,3}\.png)$/;

export function itemImageDir(itemId: number | string) {
  return path.join(DATA_DIR, "images", String(itemId));
}

export function imageUrl(itemId: number, file: string | null) {
  return file ? `/images/${itemId}/${file}` : null;
}

export function isStagingToken(token: unknown): token is string {
  return typeof token === "string" && TOKEN.test(token);
}

export function isServedStagedFile(file: string) {
  return SERVED_STAGED_FILE.test(file);
}

export function stagedUrl(token: string, file: string) {
  return `/staging/${token}/${file}`;
}

function stagedPath(token: string, file: string) {
  if (!isStagingToken(token)) throw new Error("bad staging token");
  return path.join(STAGING_DIR, token, path.basename(file));
}

export async function readStaged(token: string, file: string): Promise<Buffer | null> {
  try {
    return await readFile(stagedPath(token, file));
  } catch {
    return null;
  }
}

export async function writeStaged(token: string, file: string, data: Buffer | string) {
  await writeFile(stagedPath(token, file), data);
}

export async function removeStaged(token: string, file: string) {
  await rm(stagedPath(token, file), { force: true });
}

export async function removeStaging(token: string) {
  if (!isStagingToken(token)) return;
  await rm(path.join(STAGING_DIR, token), { recursive: true, force: true });
}

async function cleanOldStaging() {
  const entries = await readdir(STAGING_DIR).catch(() => []);
  const cutoff = Date.now() - STAGING_MAX_AGE_MS;
  for (const entry of entries) {
    const dir = path.join(STAGING_DIR, entry);
    const info = await stat(dir).catch(() => null);
    if (info && info.mtimeMs < cutoff) await rm(dir, { recursive: true, force: true });
  }
}

function resizePhoto(photo: Buffer, maxSide: number, quality = 88) {
  return sharp(photo)
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer({ resolveWithObject: true });
}

export async function stagePhoto(photo: Buffer, maxSide: number, file: "original.jpg" | "scene.jpg") {
  const { data, info } = await resizePhoto(photo, maxSide);

  const token = randomUUID();
  await mkdir(path.join(STAGING_DIR, token), { recursive: true });
  await writeStaged(token, file, data);
  void cleanOldStaging();
  return { token, jpg: data, width: info.width, height: info.height };
}

// Qwen sees the 1280-pixel scene.jpg, but a drawer's cutouts and crops come from
// a larger copy so each item keeps its detail. Boxes stay in scene.jpg pixels.
export async function stageSceneCopy(token: string, photo: Buffer) {
  const { data, info } = await resizePhoto(photo, SCENE_CUT_MAX_SIDE, 92);
  await writeStaged(token, "scene-full.jpg", data);
  return { jpg: data, width: info.width };
}

export async function readSceneCutSource(token: string) {
  const scene = await readStaged(token, "scene.jpg");
  if (!scene) return null;
  const full = (await readStaged(token, "scene-full.jpg")) ?? scene;
  const [sceneMeta, fullMeta] = await Promise.all([sharp(scene).metadata(), sharp(full).metadata()]);
  return { full, scale: (fullMeta.width ?? 1) / (sceneMeta.width ?? 1) };
}

export function scaleBox(box: [number, number, number, number], scale: number) {
  return box.map((value) => Math.round(value * scale)) as [number, number, number, number];
}

export async function onWhite(image: Buffer) {
  return sharp(image).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer();
}

export async function cropBox(photo: Buffer, box: [number, number, number, number], padding = 0.08) {
  const { width = 0, height = 0 } = await sharp(photo).metadata();
  const padX = (box[2] - box[0]) * padding;
  const padY = (box[3] - box[1]) * padding;
  const left = Math.max(0, Math.floor(box[0] - padX));
  const top = Math.max(0, Math.floor(box[1] - padY));
  const right = Math.min(width, Math.ceil(box[2] + padX));
  const bottom = Math.min(height, Math.ceil(box[3] + padY));
  return sharp(photo)
    .extract({ left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) })
    .jpeg({ quality: 88 })
    .toBuffer();
}

export function spriteSize(category: string) {
  return category === "jewelry" ? 64 : 48;
}

// A cutout keeps its transparent background; a plain photo is cropped to a
// square so the sprite is not mostly letterbox.
export async function makeSprite(image: Buffer, category: string, isCutout: boolean) {
  const size = spriteSize(category);
  const { data, info } = await sharp(image)
    .ensureAlpha()
    .resize(size, size, {
      fit: isCutout ? "contain" : "cover",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 3; i < data.length; i += 4) data[i] = data[i] > 128 ? 255 : 0;

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ palette: true, colors: 16 })
    .toBuffer();
}

export async function saveItemImages(itemId: number, files: Partial<Record<ImageFile, Buffer>>) {
  const dir = itemImageDir(itemId);
  await mkdir(dir, { recursive: true });
  for (const [file, data] of Object.entries(files)) {
    if (data) await writeFile(path.join(dir, file), data);
  }
}

export async function readItemImage(itemId: number, file: ImageFile): Promise<Buffer | null> {
  try {
    return await readFile(path.join(itemImageDir(itemId), file));
  } catch {
    return null;
  }
}

export async function removeItemImages(itemId: number) {
  await rm(itemImageDir(itemId), { recursive: true, force: true });
}

export async function photoFromUpload(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!value.type.startsWith("image/")) throw new Error("The photo has to be an image file.");
  return Buffer.from(await value.arrayBuffer());
}
