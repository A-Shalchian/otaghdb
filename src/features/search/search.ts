import { findSimilar, itemsWithEmbeddings, type SimilarItem } from "@/features/items/analysis";
import { ITEM_SELECT, itemsByIds, type ItemRow } from "@/features/items/queries";
import { db } from "@/lib/db";
import { readItemImage } from "@/lib/images";
import { errorMessage } from "@/lib/services";
import { textMatches, toBlob } from "@/lib/vectors";
import { embedImage, embedText } from "@/lib/vision";

export type SearchHit = { item: ItemRow; how: "name" | "look"; score: number };

export type SearchFilter = { roomId?: number | null; category?: string | null };

const STOPWORDS = new Set(
  "a an and are as at be by do for from have i in is it its me my of on or some something thing things that the this to what where which with".split(
    " ",
  ),
);

function ftsQuery(text: string, joiner: " " | " OR ") {
  const words = text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
  return words.map((word) => `"${word}"*`).join(joiner);
}

function keywordIds(text: string, limit: number): number[] {
  for (const joiner of [" ", " OR "] as const) {
    const match = ftsQuery(text, joiner);
    if (!match) return [];
    const rows = db
      .prepare("select rowid from items_fts where items_fts match ? order by bm25(items_fts) limit ?")
      .pluck()
      .all(match, limit) as number[];
    if (rows.length) return rows;
  }
  return [];
}

// Items saved while the vision service was off have no vector yet. Fill a
// few in on each search so they become findable by look without a script.
export async function backfillEmbeddings(max = 12) {
  const missing = db
    .prepare(
      `select id from items where embedding is null and (cutout_file is not null or original_file is not null) limit ?`,
    )
    .pluck()
    .all(max) as number[];
  for (const id of missing) {
    const image = (await readItemImage(id, "cutout.png")) ?? (await readItemImage(id, "original.jpg"));
    if (!image) continue;
    const vector = await embedImage(image);
    db.prepare("update items set embedding = ? where id = ?").run(toBlob(vector), id);
  }
}

function passes(item: ItemRow, filter: SearchFilter) {
  if (filter.roomId && item.room_id !== filter.roomId) return false;
  if (filter.category && item.category !== filter.category) return false;
  return true;
}

export async function searchItems(text: string, filter: SearchFilter = {}, limit = 24) {
  const byName = itemsByIds(keywordIds(text, limit)).filter((item) => passes(item, filter));
  const hits: SearchHit[] = byName.map((item) => ({ item, how: "name", score: 1 }));
  const seen = new Set(byName.map((item) => item.id));

  let lookError: string | null = null;
  try {
    const [vector] = await Promise.all([embedText(text), backfillEmbeddings()]);
    for (const { row, score } of textMatches(vector, itemsWithEmbeddings())) {
      if (hits.length >= limit) break;
      if (seen.has(row.id) || !passes(row, filter)) continue;
      hits.push({ item: row, how: "look", score });
      seen.add(row.id);
    }
  } catch (error) {
    lookError = errorMessage(error);
  }
  return { hits, lookError };
}

export async function matchPhoto(image: Buffer, limit = 5): Promise<SimilarItem[]> {
  await backfillEmbeddings();
  return findSimilar(await embedImage(image), limit);
}

export function itemsInPlace(where: { containerId?: number; spotId?: number }) {
  if (where.containerId) {
    return db.prepare(`${ITEM_SELECT} where i.container_id = ? order by i.name`).all(where.containerId) as ItemRow[];
  }
  return db.prepare(`${ITEM_SELECT} where i.spot_id = ? order by i.name`).all(where.spotId ?? 0) as ItemRow[];
}
