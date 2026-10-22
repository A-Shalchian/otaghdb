import { connection } from "next/server";
import { ITEM_SELECT, type ItemRow } from "@/features/items/queries";
import { CLOSET_CATEGORIES } from "@/lib/categories";
import { db } from "@/lib/db";
import { parseHolds, type CompartmentStyle } from "@/lib/furniture";

export type Compartment = {
  id: number;
  name: string;
  style: CompartmentStyle | null;
  holds: string[];
  sort_order: number;
  items: ItemRow[];
};

export type FurnitureDetail = {
  id: number;
  kind: string;
  name: string;
  room_id: number;
  room_name: string;
  compartments: Compartment[];
};

type SpotRow = { id: number; name: string; style: CompartmentStyle | null; holds_json: string; sort_order: number };

function compartmentsOf(furnitureId: number): Compartment[] {
  const spots = db
    .prepare(
      "select id, name, style, holds_json, sort_order from spots where furniture_id = ? order by sort_order, id",
    )
    .all(furnitureId) as SpotRow[];
  const items = db
    .prepare(`${ITEM_SELECT} where s.furniture_id = ? order by i.name`)
    .all(furnitureId) as ItemRow[];
  return spots.map(({ holds_json, ...spot }) => ({
    ...spot,
    holds: parseHolds(holds_json),
    items: items.filter((item) => item.spot_id === spot.id),
  }));
}

export async function getFurniture(id: number): Promise<FurnitureDetail | null> {
  await connection();
  const row = db
    .prepare(
      `select f.id, f.kind, f.name, f.room_id, r.name as room_name
       from furniture f join rooms r on r.id = f.room_id where f.id = ?`,
    )
    .get(id) as Omit<FurnitureDetail, "compartments"> | undefined;
  return row ? { ...row, compartments: compartmentsOf(row.id) } : null;
}

export type RoomOverview = {
  id: number;
  name: string;
  itemCount: number;
  furniture: FurnitureDetail[];
  looseSpots: { id: number; name: string; items: ItemRow[] }[];
  unplaced: ItemRow[];
};

export async function getRoomOverview(roomId: number): Promise<RoomOverview | null> {
  await connection();
  const room = db.prepare("select id, name from rooms where id = ?").get(roomId) as
    | { id: number; name: string }
    | undefined;
  if (!room) return null;

  const furniture = (
    db
      .prepare("select f.id, f.kind, f.name, f.room_id from furniture f where f.room_id = ? order by sort_order, id")
      .all(roomId) as Omit<FurnitureDetail, "compartments" | "room_name">[]
  ).map((f) => ({ ...f, room_name: room.name, compartments: compartmentsOf(f.id) }));

  const items = db.prepare(`${ITEM_SELECT} where i.room_id = ? order by i.name`).all(roomId) as ItemRow[];
  const loose = db
    .prepare("select id, name from spots where room_id = ? and furniture_id is null order by name")
    .all(roomId) as { id: number; name: string }[];

  return {
    ...room,
    itemCount: items.length,
    furniture,
    looseSpots: loose.map((spot) => ({ ...spot, items: items.filter((i) => i.spot_id === spot.id) })),
    unplaced: items.filter((i) => i.spot_id === null),
  };
}

export async function getClosets() {
  await connection();
  return db
    .prepare(
      `select f.id, f.name, r.name as room_name from furniture f join rooms r on r.id = f.room_id
       where f.kind = 'closet' order by r.name, f.sort_order, f.id`,
    )
    .all() as { id: number; name: string; room_name: string }[];
}

export async function getClothesElsewhere(furnitureId: number): Promise<ItemRow[]> {
  await connection();
  return db
    .prepare(
      `${ITEM_SELECT}
       where i.category in (select value from json_each(?))
         and (s.furniture_id is null or s.furniture_id != ?)
       order by i.name`,
    )
    .all(JSON.stringify(CLOSET_CATEGORIES), furnitureId) as ItemRow[];
}
