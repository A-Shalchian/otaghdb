"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function setChecked(listId: number, itemId: number, checked: boolean) {
  db.prepare("update list_items set checked = ? where list_id = ? and item_id = ?").run(checked ? 1 : 0, listId, itemId);
  refresh();
}

export async function removeFromList(listId: number, itemId: number) {
  db.prepare("delete from list_items where list_id = ? and item_id = ?").run(listId, itemId);
  refresh();
}

export async function uncheckAll(listId: number) {
  db.prepare("update list_items set checked = 0 where list_id = ?").run(listId);
  refresh();
}

export async function deleteList(listId: number) {
  db.prepare("delete from lists where id = ?").run(listId);
  redirect("/app/lists");
}
