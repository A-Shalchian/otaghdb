import Link from "next/link";
import { AddRoomForm } from "@/features/rooms/add-room-form";
import { RoomTabs } from "@/features/rooms/room-tabs";
import { ItemCard } from "./item-card";
import { getItems, getRooms } from "./queries";

function parseRoomId(value: string | string[] | undefined) {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function Inventory({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const roomId = parseRoomId((await searchParams).room);
  const [rooms, items] = await Promise.all([getRooms(), getItems(roomId)]);
  const activeRoom = rooms.find((room) => room.id === roomId) ?? null;
  const total = rooms.reduce((sum, room) => sum + room.item_count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {activeRoom ? activeRoom.name : "Everything"}
          </h1>
          <p className="mt-1 font-mono text-xs text-soft">
            {items.length} {items.length === 1 ? "item" : "items"}
            {activeRoom ? ` of ${total} total` : ` across ${rooms.length} rooms`}
          </p>
        </div>
        <AddRoomForm />
      </div>

      <RoomTabs rooms={rooms} activeId={roomId} total={total} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-sm text-soft">
            Nothing in {activeRoom ? activeRoom.name : "the database"} yet.
          </p>
          <Link
            href={activeRoom ? `/app/add?room=${activeRoom.id}` : "/app/add"}
            className="mt-4 inline-block rounded-full border border-line px-4 py-2 text-sm hover:bg-card"
          >
            Add the first item
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-12 w-48 rounded-lg bg-card" />
      <div className="h-9 w-full max-w-lg rounded-full bg-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="aspect-[4/5] rounded-2xl border border-line bg-card" />
        ))}
      </div>
    </div>
  );
}
