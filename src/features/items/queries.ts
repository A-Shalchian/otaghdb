import { connection } from "next/server";
import { db } from "@/lib/db";

export type RoomSummary = { id: number; name: string; item_count: number };

export type Spot = { id: number; room_id: number; name: string };

export type Container = { id: number; name: string; room_name: string | null };

export type ItemCard = {
  id: number;
  name: string;
  category: string;
  room_name: string | null;
  spot_name: string | null;
  container_name: string | null;
  is_container: number;
  original_file: string | null;
  cutout_file: string | null;
};

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

export async function getItems(roomId: number | null): Promise<ItemCard[]> {
  await connection();
  return db
    .prepare(
      `select i.id, i.name, i.category, i.is_container, i.original_file, i.cutout_file,
              r.name as room_name, s.name as spot_name, c.name as container_name
       from items i
       left join rooms r on r.id = i.room_id
       left join spots s on s.id = i.spot_id
       left join items c on c.id = i.container_id
       where @roomId is null or i.room_id = @roomId
       order by i.created_at desc, i.id desc`,
    )
    .all({ roomId }) as ItemCard[];
}

export async function getSpots(): Promise<Spot[]> {
  await connection();
  return db.prepare("select id, room_id, name from spots order by name").all() as Spot[];
}

export async function getContainers(): Promise<Container[]> {
  await connection();
  return db
    .prepare(
      `select i.id, i.name, r.name as room_name
       from items i left join rooms r on r.id = i.room_id
       where i.is_container = 1
       order by i.name`,
    )
    .all() as Container[];
}
