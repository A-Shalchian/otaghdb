import Link from "next/link";
import { redirect } from "next/navigation";
import { getClosets } from "@/features/furniture/queries";
import { getRooms } from "@/features/items/queries";

export async function ClosetIndex() {
  const [closets, rooms] = await Promise.all([getClosets(), getRooms()]);
  if (closets.length === 1) redirect(`/app/closet/${closets[0].id}`);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Closets</h1>
      {closets.length === 0 ? (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-soft">No closet yet. Open a room and add one under Furniture:</p>
          <ul className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <Link href={`/app/rooms/${room.id}`} className="rounded-full border border-line px-3 py-1.5 hover:bg-card">
                  {room.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {closets.map((closet) => (
            <li key={closet.id}>
              <Link href={`/app/closet/${closet.id}`} className="text-lg hover:underline">
                {closet.name}
              </Link>{" "}
              <span className="font-mono text-xs text-soft">{closet.room_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
