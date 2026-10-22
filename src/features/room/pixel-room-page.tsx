import Link from "next/link";
import { notFound } from "next/navigation";
import { secondaryButton } from "@/components/form";
import { arrangeRoom } from "./actions";
import { PixelRoom } from "./pixel-room";
import { getPixelRoom, GRID_COLS, GRID_ROWS, WALL_ROWS } from "./queries";

export async function PixelRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const room = await getPixelRoom(Number((await params).id));
  if (!room) notFound();
  const unplaced = room.sprites.filter((s) => s.x === null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/app/rooms/${room.id}`} className="text-sm text-soft hover:underline">
            ← {room.name}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">The {room.name}, in pixels</h1>
          <p className="mt-1 text-sm text-soft">Every sprite is made from the item&apos;s own cutout, shrunk to 48 pixels and 16 colors.</p>
        </div>
        {unplaced > 0 ? (
          <form action={arrangeRoom.bind(null, room.id)}>
            <button type="submit" className={secondaryButton}>
              Arrange the {unplaced} unplaced
            </button>
          </form>
        ) : null}
      </div>
      <PixelRoom
        key={room.sprites.map((s) => `${s.id}:${s.x},${s.y}`).join("|")}
        sprites={room.sprites}
        cols={GRID_COLS}
        rows={GRID_ROWS}
        wallRows={WALL_ROWS}
      />
    </div>
  );
}
