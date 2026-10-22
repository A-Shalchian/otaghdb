import Link from "next/link";
import { fieldClass, secondaryButton } from "@/components/form";
import { AddRoomForm } from "@/features/rooms/add-room-form";
import { RoomTabs } from "@/features/rooms/room-tabs";
import { CATEGORIES } from "@/lib/categories";
import { ItemGrid } from "./item-card";
import { getItems, getRooms, getTagCounts } from "./queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

function parseId(value: string | null) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function filterHref(base: Record<string, string | null>, change: Record<string, string | null>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...change })) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/app?${query}` : "/app";
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] ${
        active ? "border-ink bg-ink text-paper" : "border-line text-soft hover:bg-card"
      }`}
    >
      {label}
    </Link>
  );
}

export async function Inventory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const roomId = parseId(first(params.room));
  const category = first(params.category);
  const tag = first(params.tag);
  const activeCategory = category && (CATEGORIES as readonly string[]).includes(category) ? category : null;

  const [rooms, items, tags] = await Promise.all([
    getRooms(),
    getItems({ roomId, category: activeCategory, tag }),
    getTagCounts(roomId),
  ]);
  const activeRoom = rooms.find((room) => room.id === roomId) ?? null;
  const total = rooms.reduce((sum, room) => sum + room.item_count, 0);
  const base = { room: roomId ? String(roomId) : null, category: activeCategory, tag };

  return (
    <div className="flex flex-col gap-6">
      <form action="/app/search" className="flex gap-2">
        <input
          name="q"
          placeholder='Search by name or by look: "charger", "something red and round"'
          aria-label="Search your things"
          className={fieldClass}
        />
        <button type="submit" className={secondaryButton}>
          Search
        </button>
      </form>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{activeRoom ? activeRoom.name : "Everything"}</h1>
          <p className="mt-1 font-mono text-xs text-soft">
            {items.length} {items.length === 1 ? "item" : "items"}
            {activeRoom ? ` of ${total} total` : ` across ${rooms.length} rooms`}
            {activeRoom ? (
              <>
                {" · "}
                <Link href={`/app/rooms/${activeRoom.id}`} className="underline underline-offset-2">
                  furniture and pixel room
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <AddRoomForm />
      </div>

      <RoomTabs rooms={rooms} activeId={roomId} total={total} />

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href={filterHref(base, { category: null })} label="all categories" active={!activeCategory} />
        {CATEGORIES.map((c) => (
          <Chip key={c} href={filterHref(base, { category: c })} label={c} active={c === activeCategory} />
        ))}
      </div>

      {tags.length > 0 ? (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {tag ? <Chip href={filterHref(base, { tag: null })} label="× clear tag" active={false} /> : null}
          {tags.map((t) => (
            <Chip key={t.tag} href={filterHref(base, { tag: t.tag })} label={`#${t.tag}`} active={t.tag === tag} />
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-sm text-soft">Nothing here yet.</p>
          <Link
            href={activeRoom ? `/app/add?room=${activeRoom.id}` : "/app/add"}
            className={`mt-4 inline-block ${secondaryButton}`}
          >
            Add something
          </Link>
        </div>
      ) : (
        <ItemGrid items={items} />
      )}
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-11 w-full rounded-xl bg-card" />
      <div className="h-12 w-48 rounded-lg bg-card" />
      <div className="h-9 w-full max-w-lg rounded-full bg-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="aspect-[4/5] rounded-2xl border border-line bg-card" />
        ))}
      </div>
    </div>
  );
}
