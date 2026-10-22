import Link from "next/link";
import { AddItemFlow } from "./add-item-flow";
import { getItem, getPlaces } from "./queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstId(value: string | string[] | undefined) {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function AddItemLoader({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tree = await getPlaces();
  const requestedRoom = firstId(params.room);
  const defaultRoomId = tree.rooms.some((r) => r.id === requestedRoom) ? requestedRoom : (tree.rooms[0]?.id ?? null);
  const requestedContainer = firstId(params.container);
  const defaultContainerId = tree.containers.some((c) => c.id === requestedContainer) ? requestedContainer : null;
  const requestedSpot = firstId(params.spot);
  const spotRoom = tree.rooms.find((r) =>
    [...r.looseSpots, ...r.furniture.flatMap((f) => f.spots)].some((s) => s.id === requestedSpot),
  );
  const savedId = firstId(params.saved);
  const saved = savedId ? await getItem(savedId) : null;

  return (
    <>
      {saved ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/50 bg-card px-4 py-3 text-sm">
          <span>
            Saved <Link href={`/app/items/${saved.id}`} className="font-medium underline">{saved.name}</Link>. Add the
            next one.
          </span>
        </div>
      ) : null}
      <AddItemFlow
        key={savedId ?? "new"}
        tree={tree}
        defaultRoomId={spotRoom?.id ?? defaultRoomId}
        defaultSpotId={spotRoom ? requestedSpot : null}
        defaultContainerId={defaultContainerId}
      />
    </>
  );
}
