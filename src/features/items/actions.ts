"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES, DISCARD_LEVELS } from "@/lib/categories";
import { db } from "@/lib/db";
import { removeItemImages, saveOriginal } from "@/lib/images";

export type AddItemState = { error: string | null };

const blankToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

const ItemForm = z.object({
  name: z.string().trim().min(1, "Give it a name.").max(80, "Keep the name under 80 characters."),
  category: z.enum(CATEGORIES),
  roomId: z.coerce.number().int().positive(),
  spot: optionalText(60),
  containerId: z.preprocess(blankToUndefined, z.coerce.number().int().positive().optional()),
  isContainer: z.preprocess((value) => value === "on", z.boolean()),
  wouldDiscard: z.enum(DISCARD_LEVELS),
  whyKept: optionalText(280),
  notes: optionalText(1000),
});

function upsertSpot(roomId: number, name: string) {
  db.prepare(
    "insert into spots (room_id, name) values (?, ?) on conflict (room_id, name) do nothing",
  ).run(roomId, name);
  const row = db
    .prepare("select id from spots where room_id = ? and name = ?")
    .get(roomId, name) as { id: number };
  return row.id;
}

export async function addItem(_prev: AddItemState, formData: FormData): Promise<AddItemState> {
  const parsed = ItemForm.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const input = parsed.data;

  if (!db.prepare("select 1 from rooms where id = ?").get(input.roomId)) {
    return { error: "That room no longer exists." };
  }
  if (
    input.containerId &&
    !db.prepare("select 1 from items where id = ? and is_container = 1").get(input.containerId)
  ) {
    return { error: "That container no longer exists." };
  }

  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto && !photo.type.startsWith("image/")) {
    return { error: "The photo has to be an image file." };
  }

  const spotId = input.spot ? upsertSpot(input.roomId, input.spot) : null;
  const { lastInsertRowid } = db
    .prepare(
      `insert into items (name, category, room_id, spot_id, container_id, is_container, would_discard, why_kept, notes)
       values (@name, @category, @roomId, @spotId, @containerId, @isContainer, @wouldDiscard, @whyKept, @notes)`,
    )
    .run({
      name: input.name,
      category: input.category,
      roomId: input.roomId,
      spotId,
      containerId: input.containerId ?? null,
      isContainer: input.isContainer ? 1 : 0,
      wouldDiscard: input.wouldDiscard,
      whyKept: input.whyKept ?? null,
      notes: input.notes ?? null,
    });
  const itemId = Number(lastInsertRowid);

  if (hasPhoto) {
    try {
      const file = await saveOriginal(itemId, photo);
      db.prepare("update items set original_file = ? where id = ?").run(file, itemId);
    } catch {
      db.prepare("delete from items where id = ?").run(itemId);
      await removeItemImages(itemId);
      return { error: "Could not read that photo. Try a JPG or PNG." };
    }
  }

  redirect(`/app?room=${input.roomId}`);
}
