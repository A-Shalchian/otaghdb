import { furnitureTitle, type PlaceTree as Places } from "@/lib/places";
import { browseHref, PLACE_CLEAR, type BrowseState } from "./browse";
import { SideLink } from "./browse-parts";

export type PlaceCounts = {
  total: number;
  rooms: Map<number, number>;
  furniture: Map<number, number>;
  spots: Map<number, number>;
  containers: Map<number, number>;
};

function BagIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M3.5 5.5h9l-.8 8h-7.4zM6 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function PlaceTree({ places, counts, state }: { places: Places; counts: PlaceCounts; state: BrowseState }) {
  const nothingPicked = !state.room && !state.furniture && !state.spot && !state.container;

  return (
    <nav aria-label="Places" className="flex flex-col gap-0.5">
      <SideLink href={browseHref(state, PLACE_CLEAR)} active={nothingPicked} count={counts.total}>
        Everywhere
      </SideLink>
      {places.rooms.map((room) => {
        const containers = places.containers.filter((c) => c.room_id === room.id);
        const roomPicked = state.room === room.id;
        return (
          <div key={room.id} className="flex flex-col gap-0.5">
            <SideLink
              href={browseHref(state, { ...PLACE_CLEAR, room: room.id })}
              active={roomPicked && !state.furniture && !state.spot && !state.container}
              count={counts.rooms.get(room.id) ?? 0}
            >
              <span aria-hidden="true" className="text-soft">
                {roomPicked ? "▾" : "▸"}
              </span>
              {room.name}
            </SideLink>
            {roomPicked ? (
              <>
                {room.furniture.map((furniture) => {
                  const furniturePicked = state.furniture === furniture.id;
                  return (
                    <div key={furniture.id} className="flex flex-col gap-0.5">
                      <SideLink
                        depth={1}
                        href={browseHref(state, { ...PLACE_CLEAR, room: room.id, furniture: furniture.id })}
                        active={furniturePicked && !state.spot}
                        count={counts.furniture.get(furniture.id) ?? 0}
                      >
                        {furnitureTitle(furniture.kind, furniture.name)}
                      </SideLink>
                      {furniturePicked
                        ? furniture.spots.map((spot) => (
                            <SideLink
                              key={spot.id}
                              depth={2}
                              href={browseHref(state, {
                                ...PLACE_CLEAR,
                                room: room.id,
                                furniture: furniture.id,
                                spot: spot.id,
                              })}
                              active={state.spot === spot.id}
                              count={counts.spots.get(spot.id) ?? 0}
                            >
                              {spot.name}
                            </SideLink>
                          ))
                        : null}
                    </div>
                  );
                })}
                {room.looseSpots.map((spot) => (
                  <SideLink
                    key={spot.id}
                    depth={1}
                    href={browseHref(state, { ...PLACE_CLEAR, room: room.id, spot: spot.id })}
                    active={state.spot === spot.id}
                    count={counts.spots.get(spot.id) ?? 0}
                  >
                    {spot.name}
                  </SideLink>
                ))}
                {containers.map((container) => (
                  <SideLink
                    key={container.id}
                    depth={1}
                    href={browseHref(state, { ...PLACE_CLEAR, room: room.id, container: container.id })}
                    active={state.container === container.id}
                    count={counts.containers.get(container.id) ?? 0}
                  >
                    <BagIcon />
                    {container.name}
                  </SideLink>
                ))}
              </>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
