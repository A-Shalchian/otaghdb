import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { monoLabel } from "@/components/form";
import { getClothesElsewhere, getFurniture, type Compartment } from "@/features/furniture/queries";
import type { ItemRow } from "@/features/items/queries";
import { CLOSET_CATEGORIES, DISCARD_LEVELS } from "@/lib/categories";
import { imageUrl } from "@/lib/images";
import { locationText } from "@/lib/places";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Filters = { type: string | null; color: string | null; discard: string | null; all: boolean };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) || null;
}

function kindOf(item: ItemRow) {
  return item.clothing_type ?? item.category;
}

function matches(item: ItemRow, filters: Filters) {
  if (!filters.all && !CLOSET_CATEGORIES.includes(item.category)) return false;
  if (filters.type && kindOf(item) !== filters.type) return false;
  if (filters.color && (item.color ?? "").toLowerCase() !== filters.color) return false;
  if (filters.discard && item.would_discard !== filters.discard) return false;
  return true;
}

function href(id: number, filters: Filters, change: Partial<Filters>) {
  const next = { ...filters, ...change };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.color) params.set("color", next.color);
  if (next.discard) params.set("discard", next.discard);
  if (next.all) params.set("all", "1");
  const query = params.toString();
  return `/app/closet/${id}${query ? `?${query}` : ""}`;
}

function Chip({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      href={to}
      scroll={false}
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] ${
        active ? "border-ink bg-ink text-paper" : "border-line text-soft hover:bg-card"
      }`}
    >
      {label}
    </Link>
  );
}

function Picture({ item, className }: { item: ItemRow; className: string }) {
  const src = imageUrl(item.id, item.cutout_file ?? item.original_file);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={item.name} className={`${className} ${item.cutout_file ? "object-contain" : "object-cover"}`} />
  ) : (
    <span className={`${className} flex items-center justify-center rounded-xl border border-line font-mono text-[10px] text-soft`}>
      no photo
    </span>
  );
}

function Hanger() {
  return (
    <svg viewBox="0 0 64 24" className="h-6 w-16 text-soft" aria-hidden>
      <path
        d="M32 2 a4 4 0 1 1 4 4 c0 3 -4 3 -4 7 L4 22 h56 L32 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Rod({ items }: { items: ItemRow[] }) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-[3px] h-1.5 rounded-full bg-soft/60" />
      <ul className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
        {items.map((item) => (
          <li key={item.id} className="flex w-36 shrink-0 snap-start flex-col items-center">
            <Hanger />
            <Link href={`/app/items/${item.id}`} className="-mt-1 flex w-full flex-col items-center gap-1.5 rounded-2xl p-2 hover:bg-card">
              <Picture item={item} className="h-44 w-full object-top" />
              <span className="line-clamp-2 text-center text-xs">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stacks({ items }: { items: ItemRow[] }) {
  const groups = new Map<string, ItemRow[]>();
  for (const item of items) groups.set(kindOf(item), [...(groups.get(kindOf(item)) ?? []), item]);
  return (
    <div>
      <ul className="flex flex-wrap items-end gap-4">
        {[...groups.entries()].map(([kind, stack]) => (
          <li key={kind}>
            <details className="group">
              <summary className="flex w-32 cursor-pointer list-none flex-col items-center gap-1.5">
                <span className="relative block h-24 w-28">
                  {stack.slice(1, 3).map((item, index) => (
                    <span
                      key={item.id}
                      className="absolute inset-0 rounded-xl border border-line bg-card"
                      style={{ transform: `translate(${(index + 1) * 5}px, ${(index + 1) * -5}px)` }}
                    />
                  ))}
                  <span className="absolute inset-0 rounded-xl border border-line bg-card p-1">
                    <Picture item={stack[0]} className="h-full w-full" />
                  </span>
                </span>
                <span className="text-xs">
                  {stack.length} {stack.length === 1 ? kind : `${kind}${kind.endsWith("s") ? "" : "s"}`}
                </span>
              </summary>
              <ul className="mt-2 flex flex-wrap gap-2">
                {stack.map((item) => (
                  <li key={item.id}>
                    <Link href={`/app/items/${item.id}`} className="flex w-24 flex-col items-center gap-1 rounded-xl p-1 hover:bg-card">
                      <Picture item={item} className="size-20" />
                      <span className="line-clamp-2 text-center text-[11px]">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
      <div className="mt-2 h-2 rounded-sm bg-line" />
    </div>
  );
}

function Row({ items, floor, caption }: { items: ItemRow[]; floor?: boolean; caption?: (item: ItemRow) => string }) {
  return (
    <div>
      <ul className="flex snap-x gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <li key={item.id} className="w-28 shrink-0 snap-start">
            <Link href={`/app/items/${item.id}`} className="flex flex-col items-center gap-1 rounded-xl p-1 hover:bg-card">
              <Picture item={item} className="h-24 w-full" />
              <span className="line-clamp-2 text-center text-[11px]">{item.name}</span>
              {caption ? <span className="text-center font-mono text-[10px] text-soft">{caption(item)}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
      {floor ? <div className="h-3 rounded-sm bg-line" /> : null}
    </div>
  );
}

function CompartmentShelf({ compartment, items }: { compartment: Compartment; items: ItemRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={monoLabel}>
        {compartment.name} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-soft">Empty.</p>
      ) : compartment.style === "rod" ? (
        <Rod items={items} />
      ) : compartment.style === "floor" ? (
        <Row items={items} floor />
      ) : compartment.style === "hooks" ? (
        <Row items={items} />
      ) : (
        <Stacks items={items} />
      )}
    </section>
  );
}

export async function ClosetView({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const closet = await getFurniture(Number((await params).id));
  if (!closet) notFound();
  if (closet.kind !== "closet") redirect(`/app/furniture/${closet.id}`);

  const query = await searchParams;
  const filters: Filters = {
    type: first(query.type),
    color: first(query.color),
    discard: first(query.discard),
    all: first(query.all) === "1",
  };
  const elsewhere = await getClothesElsewhere(closet.id);
  const everything = [...closet.compartments.flatMap((c) => c.items), ...elsewhere].filter((item) =>
    matches(item, { ...filters, type: null, color: null, discard: null }),
  );
  const types = [...new Set(everything.map(kindOf))].sort();
  const colors = [...new Set(everything.map((i) => (i.color ?? "").toLowerCase()).filter(Boolean))].sort();
  const shownElsewhere = elsewhere.filter((item) => matches(item, filters));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href={`/app/furniture/${closet.id}`} className="text-sm text-soft hover:underline">
          ← {closet.name}, {closet.room_name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">The {closet.name}</h1>
        <p className="mt-1 text-sm text-soft">Swipe the rod like sliding hangers. Tap a stack on a shelf to open it.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip to={href(closet.id, filters, { type: null })} label="every type" active={!filters.type} />
          {types.map((t) => (
            <Chip key={t} to={href(closet.id, filters, { type: t })} label={t} active={filters.type === t} />
          ))}
        </div>
        {colors.length > 1 ? (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip to={href(closet.id, filters, { color: null })} label="every color" active={!filters.color} />
            {colors.map((c) => (
              <Chip key={c} to={href(closet.id, filters, { color: c })} label={c} active={filters.color === c} />
            ))}
          </div>
        ) : null}
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip to={href(closet.id, filters, { discard: null })} label="keep or not" active={!filters.discard} />
          {DISCARD_LEVELS.map((d) => (
            <Chip key={d} to={href(closet.id, filters, { discard: d })} label={`would discard: ${d}`} active={filters.discard === d} />
          ))}
          <Chip
            to={href(closet.id, filters, { all: !filters.all })}
            label={filters.all ? "clothes only" : "show everything"}
            active={filters.all}
          />
        </div>
      </div>

      {closet.compartments.map((c) => (
        <CompartmentShelf key={c.id} compartment={c} items={c.items.filter((item) => matches(item, filters))} />
      ))}

      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className={monoLabel}>Elsewhere ({shownElsewhere.length})</h2>
        {shownElsewhere.length ? (
          <Row items={shownElsewhere} caption={(item) => locationText(item)} />
        ) : (
          <p className="text-sm text-soft">Every piece of clothing you own is in this closet.</p>
        )}
      </section>
    </div>
  );
}
