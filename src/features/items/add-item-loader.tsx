import { AddItemForm } from "./add-item-form";
import { getContainers, getRooms, getSpots } from "./queries";

export async function AddItemLoader({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { room } = await searchParams;
  const [rooms, spots, containers] = await Promise.all([getRooms(), getSpots(), getContainers()]);
  const requested = Number(Array.isArray(room) ? room[0] : room);
  const defaultRoomId = rooms.some((r) => r.id === requested) ? requested : (rooms[0]?.id ?? 0);

  return (
    <AddItemForm
      rooms={rooms.map(({ id, name }) => ({ id, name }))}
      spots={spots}
      containers={containers}
      defaultRoomId={defaultRoomId}
    />
  );
}
