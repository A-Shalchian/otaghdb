"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isFurnitureKind } from "@/lib/furniture";
import { createFurniture } from "./mutations";

const Name = z.string().trim().min(1).max(40);

export async function addFurniture(roomId: number, formData: FormData) {
  if (!db.prepare("select 1 from rooms where id = ?").get(roomId)) return;
  const kind = String(formData.get("kind") ?? "");
  if (!isFurnitureKind(kind)) return;
  const name = Name.safeParse(formData.get("name"));
  const id = createFurniture(roomId, kind, name.success ? name.data : undefined);
  redirect(`/app/furniture/${id}`);
}

export async function renameFurniture(id: number, formData: FormData) {
  const name = Name.safeParse(formData.get("name"));
  if (!name.success) return;
  db.prepare("update furniture set name = ? where id = ?").run(name.data, id);
  refresh();
}

export async function deleteFurniture(id: number) {
  const row = db.prepare("select room_id from furniture where id = ?").get(id) as { room_id: number } | undefined;
  db.prepare("delete from furniture where id = ?").run(id);
  redirect(row ? `/app/rooms/${row.room_id}` : "/app");
}

export async function addCompartment(furnitureId: number, formData: FormData) {
  const name = Name.safeParse(formData.get("name"));
  const furniture = db.prepare("select room_id from furniture where id = ?").get(furnitureId) as
    | { room_id: number }
    | undefined;
  if (!name.success || !furniture) return;
  db.prepare(
    `insert into spots (room_id, furniture_id, name, style, sort_order)
     values (?, ?, ?, 'shelf', (select coalesce(max(sort_order), -1) + 1 from spots where furniture_id = ?))
     on conflict (furniture_id, name) where furniture_id is not null do nothing`,
  ).run(furniture.room_id, furnitureId, name.data, furnitureId);
  refresh();
}

export async function renameCompartment(spotId: number, formData: FormData) {
  const name = Name.safeParse(formData.get("name"));
  if (!name.success) return;
  try {
    db.prepare("update spots set name = ? where id = ?").run(name.data, spotId);
  } catch {
    return;
  }
  refresh();
}

export async function deleteCompartment(spotId: number) {
  db.prepare("delete from spots where id = ?").run(spotId);
  refresh();
}
