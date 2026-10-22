"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";

const RoomName = z.string().trim().min(1).max(40);

export async function addRoom(formData: FormData) {
  const parsed = RoomName.safeParse(formData.get("name"));
  if (!parsed.success) return;

  db.prepare("insert into rooms (name) values (?) on conflict (name) do nothing").run(parsed.data);
  const room = db.prepare("select id from rooms where name = ?").get(parsed.data) as { id: number };
  redirect(`/app?room=${room.id}`);
}
