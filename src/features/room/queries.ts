import { connection } from "next/server";
import { ITEM_SELECT, type ItemRow } from "@/features/items/queries";
import { db } from "@/lib/db";
import { imageUrl, makeSprite, readItemImage, saveItemImages } from "@/lib/images";
import { spotText } from "@/lib/places";

export const GRID_COLS = 16;
export const GRID_ROWS = 10;
export const WALL_ROWS = 2;

export type Sprite = {
  id: number;
  name: string;
  src: string | null;
  place: string | null;
  x: number | null;
  y: number | null;
};

async function ensureSprite(item: ItemRow) {
  if (item.sprite_file) return item.sprite_file;
  const cutout = await readItemImage(item.id, "cutout.png");
  const image = cutout ?? (await readItemImage(item.id, "original.jpg"));
  if (!image) return null;
  await saveItemImages(item.id, { "sprite.png": await makeSprite(image, item.category, Boolean(cutout)) });
  db.prepare("update items set sprite_file = 'sprite.png' where id = ?").run(item.id);
  return "sprite.png";
}

export async function getPixelRoom(roomId: number) {
  await connection();
  const room = db.prepare("select id, name from rooms where id = ?").get(roomId) as
    | { id: number; name: string }
    | undefined;
  if (!room) return null;
  const items = db.prepare(`${ITEM_SELECT} where i.room_id = ? order by i.name`).all(roomId) as ItemRow[];
  const sprites: Sprite[] = [];
  for (const item of items) {
    const file = await ensureSprite(item);
    sprites.push({
      id: item.id,
      name: item.name,
      src: imageUrl(item.id, file),
      place: [item.container_name ? `in the ${item.container_name}` : null, spotText(item.spot_name, item.furniture_name)]
        .filter(Boolean)
        .join(" · ") || null,
      x: item.grid_x,
      y: item.grid_y,
    });
  }
  return { ...room, sprites };
}
