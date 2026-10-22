"use client";

import { useState } from "react";
import { fieldClass, Label } from "@/components/form";
import { holdsLabel, isOddPlace, suggestSpot } from "@/lib/furniture";
import type { PlaceSpot, PlaceTree } from "@/lib/places";

export type PlaceValue = { roomId: number | null; spotId: number | null; containerId: number | null };

const NEW_SPOT = "new";

export function PlacePicker({
  tree,
  initial,
  category,
  clothingType,
  excludeContainerId,
}: {
  tree: PlaceTree;
  initial: PlaceValue;
  category: string;
  clothingType: string | null;
  excludeContainerId?: number;
}) {
  const [roomId, setRoomId] = useState<number | null>(initial.roomId ?? tree.rooms[0]?.id ?? null);
  const [spotKey, setSpotKey] = useState(initial.spotId ? String(initial.spotId) : "");
  const [newSpot, setNewSpot] = useState("");
  const [containerId, setContainerId] = useState(initial.containerId ? String(initial.containerId) : "");

  const room = tree.rooms.find((r) => r.id === roomId) ?? null;
  const compartments = room?.furniture.flatMap((f) => f.spots.map((spot) => ({ spot, furniture: f.name }))) ?? [];
  const allSpots: { spot: PlaceSpot; furniture: string | null }[] = [
    ...compartments,
    ...(room?.looseSpots.map((spot) => ({ spot, furniture: null })) ?? []),
  ];
  const selected = allSpots.find(({ spot }) => String(spot.id) === spotKey) ?? null;
  const suggestion = suggestSpot(
    compartments.map((entry) => ({ ...entry, holds: entry.spot.holds })),
    category,
    clothingType,
  );
  const insideContainer = containerId !== "";
  const containers = tree.containers.filter((c) => c.id !== excludeContainerId);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4">
        <Label text="Room">
          <select
            value={roomId ?? ""}
            disabled={insideContainer}
            onChange={(event) => {
              setRoomId(Number(event.target.value) || null);
              setSpotKey("");
            }}
            className={fieldClass}
          >
            {tree.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Spot">
          <select
            value={spotKey}
            disabled={insideContainer}
            onChange={(event) => setSpotKey(event.target.value)}
            className={fieldClass}
          >
            <option value="">anywhere in the room</option>
            {room?.furniture.map((f) => (
              <optgroup key={f.id} label={f.name}>
                {f.spots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {f.name}, {spot.name}
                  </option>
                ))}
              </optgroup>
            ))}
            {room && room.looseSpots.length > 0 ? (
              <optgroup label="other spots">
                {room.looseSpots.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            <option value={NEW_SPOT}>+ new spot</option>
          </select>
        </Label>
      </div>

      {spotKey === NEW_SPOT && !insideContainer ? (
        <input
          value={newSpot}
          onChange={(event) => setNewSpot(event.target.value)}
          maxLength={60}
          placeholder="floor by the door"
          aria-label="New spot name"
          className={fieldClass}
        />
      ) : null}

      {suggestion && !insideContainer && String(suggestion.spot.id) !== spotKey ? (
        <button
          type="button"
          onClick={() => setSpotKey(String(suggestion.spot.id))}
          className="self-start rounded-full border border-dashed border-accent px-3 py-1.5 text-left text-xs text-accent hover:bg-card"
        >
          Suggested: {suggestion.furniture}, {suggestion.spot.name}
        </button>
      ) : null}

      {selected && !insideContainer && isOddPlace(selected.spot.holds, category) ? (
        <p className="text-xs text-soft">
          Heads up: {spotTitle(selected)} usually holds {holdsLabel(selected.spot.holds)}. It will still save.
        </p>
      ) : null}

      <Label text="Inside">
        <select value={containerId} onChange={(event) => setContainerId(event.target.value)} className={fieldClass}>
          <option value="">nothing</option>
          {containers.map((container) => (
            <option key={container.id} value={container.id}>
              {container.name}
              {container.room_name ? ` (${container.room_name})` : ""}
            </option>
          ))}
        </select>
      </Label>
      {insideContainer ? (
        <p className="text-xs text-soft">Room and spot follow the container it goes in.</p>
      ) : null}

      <input type="hidden" name="roomId" value={insideContainer ? "" : (roomId ?? "")} />
      <input type="hidden" name="spotId" value={insideContainer || spotKey === NEW_SPOT ? "" : spotKey} />
      <input type="hidden" name="newSpot" value={!insideContainer && spotKey === NEW_SPOT ? newSpot : ""} />
      <input type="hidden" name="containerId" value={containerId} />
    </div>
  );
}

function spotTitle({ spot, furniture }: { spot: PlaceSpot; furniture: string | null }) {
  return furniture ? `the ${furniture} ${spot.name}` : spot.name;
}
