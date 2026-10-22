"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { GRID_COLS, GRID_ROWS, WALL_ROWS } from "./queries";

function onFloor(x: number, y: number) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_COLS && y >= WALL_ROWS && y < GRID_ROWS;
}

export async function placeSprite(itemId: number, x: number | null, y: number | null) {
  if (x === null || y === null) {
    db.prepare("update items set grid_x = null, grid_y = null where id = ?").run(itemId);
    return { ok: true };
  }
  if (!onFloor(x, y)) return { ok: false };
  const item = db.prepare("select room_id from items where id = ?").get(itemId) as { room_id: number | null } | undefined;
  if (!item) return { ok: false };
  const taken = db
    .prepare("select 1 from items where room_id is ? and grid_x = ? and grid_y = ? and id != ?")
    .get(item.room_id, x, y, itemId);
  if (taken) return { ok: false };
  db.prepare("update items set grid_x = ?, grid_y = ? where id = ?").run(x, y, itemId);
  return { ok: true };
}

// Lays unplaced items out in reading order, keeping things from the same
// spot next to each other so the room reads like the real one.
export async function arrangeRoom(roomId: number) {
  const items = db
    .prepare(
      `select i.id from items i left join spots s on s.id = i.spot_id
       where i.room_id = ? and i.grid_x is null
       order by s.furniture_id, s.sort_order, s.name, i.name`,
    )
    .pluck()
    .all(roomId) as number[];
  const taken = new Set(
    (
      db.prepare("select grid_x, grid_y from items where room_id = ? and grid_x is not null").all(roomId) as {
        grid_x: number;
        grid_y: number;
      }[]
    ).map((t) => `${t.grid_x},${t.grid_y}`),
  );
  const place = db.prepare("update items set grid_x = ?, grid_y = ? where id = ?");
  db.transaction(() => {
    let cursor = 0;
    for (const id of items) {
      while (cursor < GRID_COLS * (GRID_ROWS - WALL_ROWS)) {
        const x = cursor % GRID_COLS;
        const y = WALL_ROWS + Math.floor(cursor / GRID_COLS);
        cursor++;
        if (!taken.has(`${x},${y}`)) {
          place.run(x, y, id);
          break;
        }
      }
    }
  })();
  refresh();
}
