import { connection } from "next/server";
import { db } from "@/lib/db";
import { getPlaceTree, type PlaceTree } from "@/lib/places";

export type RoomSummary = { id: number; name: string; item_count: number };

export type ItemRow = {
  id: number;
  name: string;
  category: string;
  clothing_type: string | null;
  color: string | null;
  description: string | null;
  is_container: number;
  would_discard: string;
  why_kept: string | null;
  notes: string | null;
  tags_json: string;
  original_file: string | null;
  cutout_file: string | null;
  sprite_file: string | null;
  grid_x: number | null;
  grid_y: number | null;
  room_id: number | null;
  room_name: string | null;
  spot_id: number | null;
  spot_name: string | null;
  furniture_id: number | null;
  furniture_name: string | null;
  furniture_kind: string | null;
  container_id: number | null;
  container_name: string | null;
  created_at: string;
};

export const ITEM_COLUMNS = `
  i.id, i.name, i.category, i.clothing_type, i.color, i.description, i.is_container,
  i.would_discard, i.why_kept, i.notes, i.tags_json, i.original_file, i.cutout_file,
  i.sprite_file, i.grid_x, i.grid_y, i.created_at,
  i.room_id, r.name as room_name, i.spot_id, s.name as spot_name,
  f.id as furniture_id, f.name as furniture_name, f.kind as furniture_kind,
  i.container_id, c.name as container_name`;

export const ITEM_FROM = `
  from items i
  left join rooms r on r.id = i.room_id
  left join spots s on s.id = i.spot_id
  left join furniture f on f.id = s.furniture_id
  left join items c on c.id = i.container_id`;

export const ITEM_SELECT = `select ${ITEM_COLUMNS} ${ITEM_FROM}`;

export const ITEM_SELECT_WITH_EMBEDDING = `select ${ITEM_COLUMNS}, i.embedding ${ITEM_FROM}`;

export type ItemRowWithEmbedding = ItemRow & { embedding: Buffer | null };

export function parseTags(json: string | null): string[] {
  try {
    const value = JSON.parse(json ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export async function getRooms(): Promise<RoomSummary[]> {
  await connection();
  return db
    .prepare(
      `select r.id, r.name, count(i.id) as item_count
       from rooms r left join items i on i.room_id = r.id
       group by r.id
       order by r.name`,
    )
    .all() as RoomSummary[];
}

export type ItemFilter = {
  roomId?: number | null;
  category?: string | null;
  tag?: string | null;
  containerId?: number | null;
};

export async function getItems(filter: ItemFilter = {}): Promise<ItemRow[]> {
  await connection();
  return db
    .prepare(
      `${ITEM_SELECT}
       where (@roomId is null or i.room_id = @roomId)
         and (@category is null or i.category = @category)
         and (@containerId is null or i.container_id = @containerId)
         and (@tag is null or exists (select 1 from json_each(i.tags_json) where value = @tag))
       order by i.created_at desc, i.id desc`,
    )
    .all({
      roomId: filter.roomId ?? null,
      category: filter.category ?? null,
      tag: filter.tag ?? null,
      containerId: filter.containerId ?? null,
    }) as ItemRow[];
}

export async function getItem(id: number): Promise<ItemRow | null> {
  await connection();
  return (db.prepare(`${ITEM_SELECT} where i.id = ?`).get(id) as ItemRow | undefined) ?? null;
}

export function itemsByIds(ids: number[]): ItemRow[] {
  if (ids.length === 0) return [];
  const rows = db
    .prepare(`${ITEM_SELECT} where i.id in (select value from json_each(?))`)
    .all(JSON.stringify(ids)) as ItemRow[];
  const order = new Map(ids.map((id, index) => [id, index]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getPlaces(): Promise<PlaceTree> {
  await connection();
  return getPlaceTree();
}

export async function getTagCounts(roomId: number | null) {
  await connection();
  return db
    .prepare(
      `select t.value as tag, count(*) as count
       from items i, json_each(i.tags_json) t
       where @roomId is null or i.room_id = @roomId
       group by t.value order by count desc, t.value limit 24`,
    )
    .all({ roomId }) as { tag: string; count: number }[];
}

export async function getAiJson(id: number) {
  await connection();
  const raw = db.prepare("select ai_json from items where id = ?").pluck().get(id) as string | null;
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
