import { db } from "@/lib/db";
import { FURNITURE_TEMPLATES, isFurnitureKind } from "@/lib/furniture";

function nextFurnitureName(roomId: number, base: string) {
  const taken = new Set(
    (db.prepare("select name from furniture where room_id = ?").pluck().all(roomId) as string[]).map((n) =>
      n.toLowerCase(),
    ),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base} ${n}`)) return `${base} ${n}`;
}

export function createFurniture(roomId: number, kind: string, name?: string) {
  if (!isFurnitureKind(kind)) throw new Error("Unknown furniture kind.");
  const template = FURNITURE_TEMPLATES[kind];
  const finalName = name?.trim() || nextFurnitureName(roomId, template.label.toLowerCase());

  return db.transaction(() => {
    const order = db.prepare("select coalesce(max(sort_order), -1) + 1 from furniture where room_id = ?").pluck().get(roomId) as number;
    const furnitureId = Number(
      db
        .prepare("insert into furniture (room_id, kind, name, sort_order) values (?, ?, ?, ?)")
        .run(roomId, kind, finalName, order).lastInsertRowid,
    );
    const insertSpot = db.prepare(
      "insert into spots (room_id, furniture_id, name, style, holds_json, sort_order) values (?, ?, ?, ?, ?, ?)",
    );
    template.compartments.forEach((c, index) =>
      insertSpot.run(roomId, furnitureId, c.name, c.style, JSON.stringify(c.holds), index),
    );
    return furnitureId;
  })();
}
