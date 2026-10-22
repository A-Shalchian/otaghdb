import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldClass, monoLabel, secondaryButton } from "@/components/form";
import { ItemThumbs } from "@/features/items/item-thumbs";
import { FURNITURE_KINDS, FURNITURE_TEMPLATES, furnitureLabel } from "@/lib/furniture";
import { addFurniture } from "./actions";
import { getRoomOverview } from "./queries";

export async function RoomOverview({ params }: { params: Promise<{ id: string }> }) {
  const room = await getRoomOverview(Number((await params).id));
  if (!room) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/app" className="text-sm text-soft hover:underline">
          ← Everything
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{room.name}</h1>
        <p className="mt-1 font-mono text-xs text-soft">
          {room.itemCount} items ·{" "}
          <Link href={`/app?room=${room.id}`} className="underline underline-offset-2">
            grid
          </Link>{" "}
          ·{" "}
          <Link href={`/app/rooms/${room.id}/pixel`} className="underline underline-offset-2">
            pixel room
          </Link>{" "}
          ·{" "}
          <Link href={`/app/add/many?room=${room.id}`} className="underline underline-offset-2">
            photograph a drawer here
          </Link>
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className={monoLabel}>Furniture</h2>
        {room.furniture.length === 0 ? (
          <p className="text-sm text-soft">
            No furniture yet. Add a closet, desk or dresser and it comes with its usual drawers and shelves.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {room.furniture.map((f) => {
              const count = f.compartments.reduce((sum, c) => sum + c.items.length, 0);
              return (
                <li key={f.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link href={`/app/furniture/${f.id}`} className="text-lg font-medium hover:underline">
                      {f.name}
                    </Link>
                    <span className="font-mono text-[11px] text-soft">
                      {furnitureLabel(f.kind).toLowerCase()} · {count} items
                    </span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {f.compartments.map((c) => (
                      <li key={c.id} className="flex flex-col gap-1.5">
                        <span className="text-xs text-soft">
                          {c.name} ({c.items.length})
                        </span>
                        <ItemThumbs items={c.items} limit={5} empty="Empty." />
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Link href={`/app/furniture/${f.id}`} className={secondaryButton}>
                      Open
                    </Link>
                    {f.kind === "closet" ? (
                      <Link href={`/app/closet/${f.id}`} className={secondaryButton}>
                        Closet view
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form action={addFurniture.bind(null, room.id)} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1.5">
            <span className={monoLabel}>Add furniture</span>
            <select name="kind" defaultValue="closet" className={fieldClass}>
              {FURNITURE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {FURNITURE_TEMPLATES[kind].label}
                </option>
              ))}
            </select>
          </label>
          <span className="w-44">
            <input name="name" maxLength={40} placeholder="name (optional)" aria-label="Furniture name" className={fieldClass} />
          </span>
          <button type="submit" className={secondaryButton}>
            Add
          </button>
        </form>
      </section>

      {room.looseSpots.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className={monoLabel}>Other spots</h2>
          <ul className="flex flex-col gap-4">
            {room.looseSpots.map((spot) => (
              <li key={spot.id} className="flex flex-col gap-1.5">
                <span className="text-sm">
                  {spot.name} <span className="text-soft">({spot.items.length})</span>
                </span>
                <ItemThumbs items={spot.items} empty="Empty." />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className={monoLabel}>Anywhere in the room ({room.unplaced.length})</h2>
        <ItemThumbs items={room.unplaced} empty="Everything here has a spot." />
      </section>
    </div>
  );
}
