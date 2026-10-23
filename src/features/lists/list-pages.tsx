import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-button";
import { monoLabel, secondaryButton } from "@/components/form";
import { imageUrl } from "@/lib/images";
import { spotText } from "@/lib/places";
import { deleteList, uncheckAll } from "./actions";
import { Checklist, type ChecklistGroup } from "./checklist";
import { getList, getLists } from "./queries";

export async function ListIndex() {
  const lists = await getLists();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packing lists</h1>
        <p className="mt-1 text-sm text-soft">
          Ask for one in{" "}
          <Link href="/app/ask" className="underline underline-offset-4">
            Ask
          </Link>
          , like &quot;I&apos;m going camping for 3 days&quot;. It finds what you own and where it is.
        </p>
      </div>
      {lists.length === 0 ? (
        <p className="text-sm text-soft">No lists yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href={`/app/lists/${list.id}`} className="flex flex-col gap-1 rounded-2xl border border-line bg-card p-4 hover:border-ink">
                <span className="text-lg font-medium">{list.title}</span>
                <span className="font-mono text-[11px] text-soft">
                  {list.checked} of {list.total} packed
                  {list.missing ? ` · ${list.missing} you don't own` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function ListDetail({ params }: { params: Promise<{ id: string }> }) {
  const list = await getList(Number((await params).id));
  if (!list) notFound();

  const groups = new Map<string, ChecklistGroup>();
  for (const item of list.items) {
    const label = item.room_name ?? "no room";
    const group = groups.get(label) ?? { label, items: [] };
    const where = [spotText(item.spot_name, item.furniture_name), item.container_name ? `in the ${item.container_name}` : null]
      .filter(Boolean)
      .join(" · ");
    group.items.push({
      id: item.id,
      name: item.name,
      imageUrl: imageUrl(item.id, item.cutout_file ?? item.original_file),
      detail: where || null,
      checked: Boolean(item.checked),
    });
    groups.set(label, group);
  }
  const packed = list.items.filter((i) => i.checked).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <Link href="/app/lists" className="text-sm text-soft hover:underline">
          ← Lists
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{list.title}</h1>
        <p className="mt-1 font-mono text-xs text-soft">
          {packed} of {list.items.length} packed · grouped by room so you collect everything in one walk
        </p>
      </div>

      {list.items.length ? (
        <Checklist listId={list.id} groups={[...groups.values()]} />
      ) : (
        <p className="text-sm text-soft">You don&apos;t own anything on this list yet.</p>
      )}

      {list.missing.length ? (
        <section className="flex flex-col gap-2">
          <h2 className={monoLabel}>You don&apos;t own these</h2>
          <ul className="flex flex-wrap gap-2">
            {list.missing.map((thing) => (
              <li key={thing} className="rounded-full border border-dashed border-line px-3 py-1 text-sm">
                {thing}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <form action={uncheckAll.bind(null, list.id)}>
          <button type="submit" className={secondaryButton}>
            Untick everything
          </button>
        </form>
        <form action={deleteList.bind(null, list.id)}>
          <ConfirmButton message="Delete this list? Your things stay as they are." className={`${secondaryButton} text-red-700`}>
            Delete list
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
