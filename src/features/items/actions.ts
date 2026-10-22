"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES, CLOTHING_TYPES, DISCARD_LEVELS } from "@/lib/categories";
import { db } from "@/lib/db";
import {
  isStagingToken,
  makeSprite,
  readItemImage,
  readStaged,
  removeItemImages,
  removeStaging,
  saveItemImages,
} from "@/lib/images";
import { placeItems, resolvePlacement } from "@/lib/places";
import { toBlob } from "@/lib/vectors";
import { embedImage } from "@/lib/vision";
import { optionalEnum, optionalText, PlaceFields } from "./form-schema";

export type ItemFormState = { error: string | null; saved?: boolean };

const ItemFields = PlaceFields.extend({
  name: z.string().trim().min(1, "Give it a name.").max(80, "Keep the name under 80 characters."),
  category: z.enum(CATEGORIES),
  clothingType: optionalEnum(CLOTHING_TYPES),
  color: optionalText(40),
  tags: optionalText(400),
  description: optionalText(300),
  isContainer: z.preprocess((value) => value === "on", z.boolean()),
  wouldDiscard: z.enum(DISCARD_LEVELS),
  whyKept: optionalText(280),
  notes: optionalText(1000),
});

type ItemInput = z.infer<typeof ItemFields>;

function parseFields(formData: FormData) {
  const parsed = ItemFields.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." } as const;
  }
  return { data: parsed.data } as const;
}

function tagList(text: string | undefined) {
  const tags = (text ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return JSON.stringify([...new Set(tags)].slice(0, 12));
}

function columns(input: ItemInput) {
  return {
    name: input.name,
    category: input.category,
    clothingType: input.category === "clothing" ? (input.clothingType ?? null) : null,
    color: input.color ?? null,
    tags: tagList(input.tags),
    description: input.description ?? null,
    isContainer: input.isContainer ? 1 : 0,
    wouldDiscard: input.wouldDiscard,
    whyKept: input.whyKept ?? null,
    notes: input.notes ?? null,
  };
}

export async function createItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const fields = parseFields(formData);
  if ("error" in fields) return { error: fields.error ?? null };
  const input = fields.data;
  const token = formData.get("token");

  const placement = resolvePlacement(input);
  if ("error" in placement) return { error: placement.error };

  const original = isStagingToken(token) ? await readStaged(token, "original.jpg") : null;
  const cutoutPng = isStagingToken(token) ? await readStaged(token, "cutout.png") : null;
  const subject = cutoutPng ?? original;
  const aiJson = isStagingToken(token) ? ((await readStaged(token, "ai.json"))?.toString("utf8") ?? null) : null;
  let embedding = isStagingToken(token) ? await readStaged(token, "embedding.bin") : null;
  if (!embedding && subject) embedding = await embedImage(subject).then(toBlob).catch(() => null);

  const { lastInsertRowid } = db
    .prepare(
      `insert into items (name, category, clothing_type, color, tags_json, description, is_container,
         would_discard, why_kept, notes, ai_json, embedding, room_id, spot_id, container_id,
         original_file, cutout_file, sprite_file)
       values (@name, @category, @clothingType, @color, @tags, @description, @isContainer,
         @wouldDiscard, @whyKept, @notes, @aiJson, @embedding, @room_id, @spot_id, @container_id,
         @originalFile, @cutoutFile, @spriteFile)`,
    )
    .run({
      ...columns(input),
      ...placement,
      aiJson,
      embedding,
      originalFile: original ? "original.jpg" : null,
      cutoutFile: cutoutPng ? "cutout.png" : null,
      spriteFile: subject ? "sprite.png" : null,
    });
  const itemId = Number(lastInsertRowid);

  if (subject) {
    try {
      await saveItemImages(itemId, {
        "original.jpg": original ?? undefined,
        "cutout.png": cutoutPng ?? undefined,
        "sprite.png": await makeSprite(subject, input.category, Boolean(cutoutPng)),
      });
    } catch {
      db.prepare("delete from items where id = ?").run(itemId);
      await removeItemImages(itemId);
      return { error: "Could not save the photo. Try a JPG or PNG." };
    }
  }
  if (isStagingToken(token)) await removeStaging(token);

  const params = new URLSearchParams({ saved: String(itemId) });
  if (placement.room_id) params.set("room", String(placement.room_id));
  if (placement.spot_id) params.set("spot", String(placement.spot_id));
  if (placement.container_id) params.set("container", String(placement.container_id));
  redirect(`/app/add?${params}`);
}

export async function updateItem(itemId: number, _prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const fields = parseFields(formData);
  if ("error" in fields) return { error: fields.error ?? null };
  const input = fields.data;

  const before = db.prepare("select category, cutout_file from items where id = ?").get(itemId) as
    | { category: string; cutout_file: string | null }
    | undefined;
  if (!before) return { error: "That item no longer exists." };

  const placement = resolvePlacement(input);
  if ("error" in placement) return { error: placement.error };
  const moved = placeItems([itemId], placement);
  if (moved.error) return { error: moved.error };

  db.prepare(
    `update items set name = @name, category = @category, clothing_type = @clothingType, color = @color,
       tags_json = @tags, description = @description, is_container = @isContainer,
       would_discard = @wouldDiscard, why_kept = @whyKept, notes = @notes, updated_at = datetime('now')
     where id = @id`,
  ).run({ ...columns(input), id: itemId });

  if (before.category !== input.category) {
    const subject =
      (await readItemImage(itemId, "cutout.png")) ?? (await readItemImage(itemId, "original.jpg"));
    if (subject) {
      await saveItemImages(itemId, {
        "sprite.png": await makeSprite(subject, input.category, Boolean(before.cutout_file)),
      });
    }
  }

  refresh();
  return { error: null, saved: true };
}

export async function deleteItem(itemId: number) {
  const item = db.prepare("select room_id from items where id = ?").get(itemId) as
    | { room_id: number | null }
    | undefined;
  db.prepare("delete from items where id = ?").run(itemId);
  await removeItemImages(itemId);
  redirect(item?.room_id ? `/app?room=${item.room_id}` : "/app");
}
