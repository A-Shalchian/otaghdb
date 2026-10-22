"use client";

import { startTransition, useActionState, useState, useSyncExternalStore } from "react";
import { CATEGORIES, DISCARD_LEVELS } from "@/lib/categories";
import { addItem, type AddItemState } from "./actions";
import { PhotoPicker } from "./photo-picker";
import type { Container, Spot } from "./queries";

const field =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none placeholder:text-soft focus:border-ink";

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-soft">{text}</span>
      {children}
    </label>
  );
}

const initialState: AddItemState = { error: null };

const noSubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

export function AddItemForm({
  rooms,
  spots,
  containers,
  defaultRoomId,
}: {
  rooms: { id: number; name: string }[];
  spots: Spot[];
  containers: Container[];
  defaultRoomId: number;
}) {
  const [state, formAction, pending] = useActionState(addItem, initialState);
  const [roomId, setRoomId] = useState(defaultRoomId);
  const roomSpots = spots.filter((spot) => spot.room_id === roomId);
  const hydrated = useHydrated();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <PhotoPicker />

      <div className="flex flex-col gap-4">
        <Label text="Name">
          <input name="name" required maxLength={80} placeholder="black zip hoodie" className={field} />
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <Label text="Category">
            <select name="category" defaultValue="other" className={field}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Label>
          <Label text="Room">
            <select
              name="roomId"
              value={roomId}
              onChange={(event) => setRoomId(Number(event.target.value))}
              className={field}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Label text="Spot">
            <input
              name="spot"
              list="spot-options"
              maxLength={60}
              placeholder="closet shelf"
              className={field}
            />
            <datalist id="spot-options">
              {roomSpots.map((spot) => (
                <option key={spot.id} value={spot.name} />
              ))}
            </datalist>
          </Label>
          <Label text="Inside">
            <select name="containerId" defaultValue="" className={field}>
              <option value="">nothing</option>
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                  {container.room_name ? ` (${container.room_name})` : ""}
                </option>
              ))}
            </select>
          </Label>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="isContainer" className="size-4 accent-[var(--accent)]" />
          This holds other things (a bag, box, drawer)
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-soft">
            Would you throw it out?
          </legend>
          <div className="flex gap-2">
            {DISCARD_LEVELS.map((level) => (
              <label key={level} className="flex-1">
                <input
                  type="radio"
                  name="wouldDiscard"
                  value={level}
                  defaultChecked={level === "never"}
                  className="peer sr-only"
                />
                <span className="block cursor-pointer rounded-xl border border-line px-3 py-2 text-center text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Label text="Why I keep it">
          <input name="whyKept" maxLength={280} placeholder="gift from my sister" className={field} />
        </Label>

        <Label text="Notes">
          <textarea name="notes" rows={3} maxLength={1000} className={field} />
        </Label>

        {state.error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !hydrated}
          className="mt-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save item"}
        </button>
      </div>
    </form>
  );
}
