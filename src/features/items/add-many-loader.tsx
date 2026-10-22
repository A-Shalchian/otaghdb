import { AddManyFlow } from "./add-many-flow";
import { getPlaces } from "./queries";

export async function AddManyLoader({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { room } = await searchParams;
  const tree = await getPlaces();
  const requested = Number(Array.isArray(room) ? room[0] : room);
  const defaultRoomId = tree.rooms.some((r) => r.id === requested) ? requested : (tree.rooms[0]?.id ?? null);
  return <AddManyFlow tree={tree} defaultRoomId={defaultRoomId} />;
}
