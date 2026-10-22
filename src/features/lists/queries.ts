import { connection } from "next/server";
import { ITEM_COLUMNS, ITEM_FROM, type ItemRow } from "@/features/items/queries";
import { db } from "@/lib/db";

export type ListSummary = {
  id: number;
  title: string;
  created_at: string;
  total: number;
  checked: number;
  missing: number;
};

export type ListItem = ItemRow & { checked: number };

function parseMissing(json: string) {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export async function getLists(): Promise<ListSummary[]> {
  await connection();
  return db
    .prepare(
      `select l.id, l.title, l.created_at, json_array_length(l.missing_json) as missing,
              count(li.item_id) as total, coalesce(sum(li.checked), 0) as checked
       from lists l left join list_items li on li.list_id = l.id
       group by l.id order by l.created_at desc, l.id desc`,
    )
    .all() as ListSummary[];
}

export async function getList(id: number) {
  await connection();
  const list = db.prepare("select id, title, missing_json, created_at from lists where id = ?").get(id) as
    | { id: number; title: string; missing_json: string; created_at: string }
    | undefined;
  if (!list) return null;
  const items = db
    .prepare(
      `select li.checked, ${ITEM_COLUMNS} ${ITEM_FROM}
       join list_items li on li.item_id = i.id
       where li.list_id = ?
       order by r.name, f.sort_order, f.name, s.sort_order, s.name, c.name, i.name`,
    )
    .all(id) as ListItem[];
  return { ...list, missing: parseMissing(list.missing_json), items };
}
