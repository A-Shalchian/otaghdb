import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-button";
import { fieldClass, monoLabel, secondaryButton } from "@/components/form";
import { ItemGrid } from "@/features/items/item-card";
import { furnitureLabel, holdsLabel } from "@/lib/furniture";
import {
  addCompartment,
  deleteCompartment,
  deleteFurniture,
  renameCompartment,
  renameFurniture,
} from "./actions";
import { getFurniture } from "./queries";

const smallButton = "rounded-full border border-line px-3 py-1 text-xs hover:bg-card";

export async function FurnitureDetail({ params }: { params: Promise<{ id: string }> }) {
  const furniture = await getFurniture(Number((await params).id));
  if (!furniture) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Link href={`/app/rooms/${furniture.room_id}`} className="text-sm text-soft hover:underline">
          ← {furniture.room_name}
        </Link>
        <form action={renameFurniture.bind(null, furniture.id)} className="flex flex-wrap items-center gap-2">
          <input
            name="name"
            defaultValue={furniture.name}
            maxLength={40}
            aria-label="Furniture name"
            className="min-w-0 rounded-lg border border-transparent bg-transparent px-1 text-2xl font-semibold tracking-tight outline-none hover:border-line focus:border-ink"
          />
          <button type="submit" className={smallButton}>
            Rename
          </button>
        </form>
        <p className="font-mono text-xs text-soft">
          {furnitureLabel(furniture.kind).toLowerCase()} in the {furniture.room_name}
        </p>
        <div className="flex flex-wrap gap-2">
          {furniture.kind === "closet" ? (
            <Link href={`/app/closet/${furniture.id}`} className={secondaryButton}>
              Open the closet view
            </Link>
          ) : null}
          <form action={deleteFurniture.bind(null, furniture.id)}>
            <ConfirmButton
              message="Delete this furniture? Its things stay in the room without a spot."
              className={`${secondaryButton} text-red-700 dark:text-red-400`}
            >
              Delete
            </ConfirmButton>
          </form>
        </div>
      </div>

      {furniture.compartments.map((c) => (
        <section key={c.id} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <form action={renameCompartment.bind(null, c.id)} className="flex items-center gap-2">
                <input
                  name="name"
                  defaultValue={c.name}
                  maxLength={40}
                  aria-label="Compartment name"
                  className="min-w-0 rounded-md border border-transparent bg-transparent px-1 text-lg font-medium outline-none hover:border-line focus:border-ink"
                />
                <span className="font-mono text-[11px] text-soft">({c.items.length})</span>
              </form>
              {c.holds.length ? (
                <p className="px-1 font-mono text-[11px] text-soft">usually holds {holdsLabel(c.holds)}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Link href={`/app/add?room=${furniture.room_id}&spot=${c.id}`} className={smallButton}>
                Add here
              </Link>
              <form action={deleteCompartment.bind(null, c.id)}>
                <ConfirmButton message={`Remove "${c.name}"? Its things stay in the room.`} className={smallButton}>
                  Remove
                </ConfirmButton>
              </form>
            </div>
          </div>
          {c.items.length ? <ItemGrid items={c.items} /> : <p className="text-sm text-soft">Empty.</p>}
        </section>
      ))}

      <form action={addCompartment.bind(null, furniture.id)} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1.5">
          <span className={monoLabel}>Add a compartment</span>
          <span className="w-56">
            <input name="name" maxLength={40} placeholder="left drawer" required className={fieldClass} />
          </span>
        </label>
        <button type="submit" className={secondaryButton}>
          Add
        </button>
      </form>
    </div>
  );
}
