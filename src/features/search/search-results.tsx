import { fieldClass, monoLabel, secondaryButton } from "@/components/form";
import { ItemGrid } from "@/features/items/item-card";
import { connection } from "next/server";
import { searchItems } from "./search";

export async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200) ?? "";
  const { hits, lookError } = q ? await searchItems(q) : { hits: [], lookError: null };
  const byName = hits.filter((hit) => hit.how === "name");
  const byLook = hits.filter((hit) => hit.how === "look");

  return (
    <div className="flex flex-col gap-8">
      <form action="/app/search" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          autoFocus={!q}
          placeholder='"passport", "charger", "something red and round"'
          aria-label="Search your things"
          className={fieldClass}
        />
        <button type="submit" className={secondaryButton}>
          Search
        </button>
      </form>

      {q ? (
        <>
          <section className="flex flex-col gap-3">
            <h2 className={monoLabel}>Matches by name and tags ({byName.length})</h2>
            {byName.length ? (
              <ItemGrid items={byName.map((hit) => hit.item)} />
            ) : (
              <p className="text-sm text-soft">No name, tag or note mentions that.</p>
            )}
          </section>
          <section className="flex flex-col gap-3">
            <h2 className={monoLabel}>Looks like &quot;{q}&quot; ({byLook.length})</h2>
            {lookError ? <p className="text-sm text-soft">Search by look is off: {lookError}</p> : null}
            {byLook.length ? (
              <ItemGrid items={byLook.map((hit) => hit.item)} />
            ) : lookError ? null : (
              <p className="text-sm text-soft">Nothing looks like that.</p>
            )}
          </section>
        </>
      ) : (
        <p className="text-sm text-soft">
          Search by name, or describe how something looks. SigLIP 2 compares your words with every photo.
        </p>
      )}
    </div>
  );
}
