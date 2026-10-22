import { db } from "@/lib/db";
import { furnitureLabel, parseHolds, type CompartmentStyle } from "@/lib/furniture";

export type PlaceSpot = {
  id: number;
  room_id: number;
  furniture_id: number | null;
  name: string;
  style: CompartmentStyle | null;
  holds: string[];
  sort_order: number;
};

export type PlaceFurniture = {
  id: number;
  room_id: number;
  kind: string;
  name: string;
  spots: PlaceSpot[];
};

export type PlaceRoom = {
  id: number;
  name: string;
  furniture: PlaceFurniture[];
  looseSpots: PlaceSpot[];
};

export type PlaceContainer = {
  id: number;
  name: string;
  room_id: number | null;
  room_name: string | null;
};

export type PlaceTree = { rooms: PlaceRoom[]; containers: PlaceContainer[] };

type SpotRow = Omit<PlaceSpot, "holds"> & { holds_json: string };

export function getPlaceTree(): PlaceTree {
  const rooms = db.prepare("select id, name from rooms order by name").all() as {
    id: number;
    name: string;
  }[];
  const furniture = db
    .prepare("select id, room_id, kind, name from furniture order by sort_order, id")
    .all() as Omit<PlaceFurniture, "spots">[];
  const spots = (
    db
      .prepare(
        "select id, room_id, furniture_id, name, style, holds_json, sort_order from spots order by sort_order, name",
      )
      .all() as SpotRow[]
  ).map(({ holds_json, ...spot }) => ({ ...spot, holds: parseHolds(holds_json) }));
  const containers = db
    .prepare(
      `select i.id, i.name, i.room_id, r.name as room_name
       from items i left join rooms r on r.id = i.room_id
       where i.is_container = 1 order by i.name`,
    )
    .all() as PlaceContainer[];

  return {
    rooms: rooms.map((room) => ({
      ...room,
      furniture: furniture
        .filter((f) => f.room_id === room.id)
        .map((f) => ({ ...f, spots: spots.filter((s) => s.furniture_id === f.id) })),
      looseSpots: spots.filter((s) => s.room_id === room.id && s.furniture_id === null),
    })),
    containers,
  };
}

export type LocationParts = {
  room_name: string | null;
  spot_name: string | null;
  furniture_name: string | null;
  container_name: string | null;
};

export function spotText(spotName: string | null, furnitureName: string | null) {
  if (!spotName) return furnitureName;
  return furnitureName ? `${furnitureName}, ${spotName}` : spotName;
}

export function locationText(item: LocationParts) {
  const parts = [
    item.container_name ? `in the ${item.container_name}` : null,
    spotText(item.spot_name, item.furniture_name),
    item.room_name,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "no place yet";
}

export type Placement = { room_id: number | null; spot_id: number | null; container_id: number | null };

export type PlaceInput = {
  roomId?: number | null;
  spotId?: number | null;
  newSpot?: string | null;
  containerId?: number | null;
};

// Items inside a container always share the container's room and spot, so
// a search by room finds them and moving the container moves its contents.
export function resolvePlacement(input: PlaceInput): Placement | { error: string } {
  if (input.containerId) {
    const container = db
      .prepare("select room_id, spot_id from items where id = ? and is_container = 1")
      .get(input.containerId) as { room_id: number | null; spot_id: number | null } | undefined;
    if (!container) return { error: "That container no longer exists." };
    return { room_id: container.room_id, spot_id: container.spot_id, container_id: input.containerId };
  }

  if (input.spotId) {
    const spot = db.prepare("select room_id from spots where id = ?").get(input.spotId) as
      | { room_id: number }
      | undefined;
    if (!spot) return { error: "That spot no longer exists." };
    return { room_id: spot.room_id, spot_id: input.spotId, container_id: null };
  }

  if (!input.roomId) return { room_id: null, spot_id: null, container_id: null };
  if (!db.prepare("select 1 from rooms where id = ?").get(input.roomId)) {
    return { error: "That room no longer exists." };
  }
  const spotId = input.newSpot ? upsertLooseSpot(input.roomId, input.newSpot) : null;
  return { room_id: input.roomId, spot_id: spotId, container_id: null };
}

export function upsertLooseSpot(roomId: number, name: string) {
  db.prepare(
    `insert into spots (room_id, name) values (?, ?)
     on conflict (room_id, name) where furniture_id is null do nothing`,
  ).run(roomId, name);
  const row = db
    .prepare("select id from spots where room_id = ? and name = ? and furniture_id is null")
    .get(roomId, name) as { id: number };
  return row.id;
}

function descendantsOf(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = db
    .prepare(
      `with recursive inside(id) as (
         select id from items where container_id in (select value from json_each(?))
         union
         select i.id from items i join inside on i.container_id = inside.id
       )
       select id from inside`,
    )
    .all(JSON.stringify(ids)) as { id: number }[];
  return rows.map((row) => row.id);
}

export function placeItems(ids: number[], placement: Placement) {
  if (placement.container_id !== null) {
    const blocked = new Set([...ids, ...descendantsOf(ids)]);
    if (blocked.has(placement.container_id)) {
      return { error: "A container cannot go inside itself or inside something it holds." };
    }
  }

  // A pixel-room tile only means something inside its own room.
  const tile = `grid_x = case when room_id is @room_id then grid_x end,
                grid_y = case when room_id is @room_id then grid_y end`;
  const update = db.prepare(
    `update items set ${tile}, room_id = @room_id, spot_id = @spot_id, container_id = @container_id,
       updated_at = datetime('now') where id = @id`,
  );
  const follow = db.prepare(
    `update items set ${tile}, room_id = @room_id, spot_id = @spot_id, updated_at = datetime('now') where id = @id`,
  );

  db.transaction(() => {
    for (const id of ids) update.run({ ...placement, id });
    for (const id of descendantsOf(ids)) follow.run({ room_id: placement.room_id, spot_id: placement.spot_id, id });
  })();
  return { error: null };
}

export function furnitureTitle(kind: string, name: string) {
  return name || furnitureLabel(kind).toLowerCase();
}
