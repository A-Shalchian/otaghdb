"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES, CLOTHING_TYPES } from "@/lib/categories";
import { db } from "@/lib/db";
import { cropBox, isStagingToken, makeSprite, readStaged, removeStaging, saveItemImages } from "@/lib/images";
import { resolvePlacement } from "@/lib/places";
import { toBlob } from "@/lib/vectors";
import { embedImage } from "@/lib/vision";
import { PlaceFields } from "./form-schema";
import { readSceneObjects, type SceneObject } from "./scene";

export type SceneSaveState = { error: string | null };

const SceneItems = z
  .array(
    z.object({
      n: z.number().int().nonnegative(),
      name: z.string().trim().min(1, "Every ticked thing needs a name.").max(80),
      category: z.enum(CATEGORIES),
      clothingType: z.enum(CLOTHING_TYPES).nullable(),
      color: z.string().trim().max(40),
    }),
  )
  .min(1, "Tick at least one thing to save.")
  .max(60);

export async function saveScene(_prev: SceneSaveState, formData: FormData): Promise<SceneSaveState> {
  const token = formData.get("token");
  if (!isStagingToken(token)) return { error: "Take a photo first." };

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Could not read the list of things." };
  }
  const items = SceneItems.safeParse(rawItems);
  if (!items.success) return { error: items.error.issues[0]?.message ?? "Check the list and try again." };
  const place = PlaceFields.safeParse(Object.fromEntries(formData));
  if (!place.success) return { error: "Pick a place for these things." };

  const placement = resolvePlacement(place.data);
  if ("error" in placement) return { error: placement.error };

  const scene = await readStaged(token, "scene.jpg");
  const objects = new Map((await readSceneObjects(token)).map((o) => [o.n, o]));
  if (!scene) return { error: "That photo expired. Take it again." };

  const prepared: {
    item: z.infer<typeof SceneItems>[number];
    object: SceneObject;
    cutout: Buffer;
    original: Buffer;
    sprite: Buffer;
    embedding: Buffer | null;
  }[] = [];
  for (const item of items.data) {
    const object = objects.get(item.n);
    const cutout = await readStaged(token, `obj-${item.n}.png`);
    if (!object || !cutout) continue;
    prepared.push({
      item,
      object,
      cutout,
      original: await cropBox(scene, object.box),
      sprite: await makeSprite(cutout, item.category, object.cutout),
      embedding: await embedImage(cutout).then(toBlob).catch(() => null),
    });
  }

  const insert = db.prepare(
    `insert into items (name, category, clothing_type, color, ai_json, embedding, room_id, spot_id,
       container_id, original_file, cutout_file, sprite_file)
     values (@name, @category, @clothingType, @color, @aiJson, @embedding, @room_id, @spot_id,
       @container_id, 'original.jpg', @cutoutFile, 'sprite.png')`,
  );
  const ids = db.transaction(() =>
    prepared.map(({ item, object, embedding }) =>
      Number(
        insert.run({
          name: item.name,
          category: item.category,
          clothingType: item.category === "clothing" ? item.clothingType : null,
          color: item.color || null,
          aiJson: JSON.stringify(object),
          embedding,
          cutoutFile: object.cutout ? "cutout.png" : null,
          ...placement,
        }).lastInsertRowid,
      ),
    ),
  )();

  await Promise.all(
    prepared.map(({ original, cutout, sprite, object }, index) =>
      saveItemImages(ids[index], {
        "original.jpg": original,
        "cutout.png": object.cutout ? cutout : undefined,
        "sprite.png": sprite,
      }),
    ),
  );
  await removeStaging(token);
  redirect(placement.room_id ? `/app?room=${placement.room_id}` : "/app");
}
