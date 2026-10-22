import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DATA_DIR } from "@/lib/db";

export const IMAGE_FILES = {
  "original.jpg": "image/jpeg",
  "cutout.png": "image/png",
  "sprite.png": "image/png",
} as const;

export type ImageFile = keyof typeof IMAGE_FILES;

const MAX_SIDE = 1024;

export function itemImageDir(itemId: number | string) {
  return path.join(DATA_DIR, "images", String(itemId));
}

export async function saveOriginal(itemId: number, photo: File): Promise<ImageFile> {
  const dir = itemImageDir(itemId);
  await mkdir(dir, { recursive: true });
  await sharp(Buffer.from(await photo.arrayBuffer()))
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(path.join(dir, "original.jpg"));
  return "original.jpg";
}

export async function removeItemImages(itemId: number) {
  await rm(itemImageDir(itemId), { recursive: true, force: true });
}

export function imageUrl(itemId: number, file: string | null) {
  return file ? `/images/${itemId}/${file}` : null;
}
