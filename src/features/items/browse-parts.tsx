import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { secondaryButton } from "@/components/form";
import { imageUrl } from "@/lib/images";
import { locationText } from "@/lib/places";
import {
  browseHref,
  COLORS,
  FILTER_CLEAR,
  hasFilters,
  PLACE_CLEAR,
  SORTS,
  type BrowseState,
  type Sort,
} from "./browse";
import { ItemGrid } from "./item-card";
import type { ItemRow } from "./queries";

export type PlaceNames = {
  rooms: Map<number, string>;
  furniture: Map<number, string>;
  spots: Map<number, string>;
  containers: Map<number, string>;
};

export function Dropdown({
  label,
  active,
  align = "left",
  resetKey,
  children,
}: {
  label: ReactNode;
  active?: boolean;
  align?: "left" | "right";
  resetKey: string;
  children: ReactNode;
}) {
  return (
    <details key={resetKey} className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm [&::-webkit-details-marker]:hidden ${
          active ? "border-accent bg-accent text-on-accent" : "border-line bg-card hover:border-accent"
        }`}
      >
        {label}
        <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3 transition-transform group-open:rotate-180">
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </summary>
      <div
        className={`z-40 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-lg max-sm:fixed max-sm:inset-x-4 max-sm:bottom-20 max-sm:max-h-[60vh] sm:absolute sm:top-full sm:mt-1.5 sm:max-h-80 sm:min-w-52 ${
          align === "right" ? "sm:right-0" : "sm:left-0"
        }`}
      >
        {children}
      </div>
    </details>
  );
}

export function MenuLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm ${
        active ? "bg-tile font-semibold" : "hover:bg-tile"
      }`}
    >
      {children}
    </Link>
  );
}

export function SortMenu({ state }: { state: BrowseState }) {
  const current = SORTS.find((s) => s.slug === state.sort) ?? SORTS[0];
  return (
    <Dropdown label={<span>Sort: {current.name}</span>} align="right" resetKey={`sort-${browseHref(state)}`}>
      {SORTS.map((sort) => (
        <MenuLink key={sort.slug} href={browseHref(state, { sort: sort.slug as Sort })} active={sort.slug === state.sort}>
          {sort.name}
        </MenuLink>
      ))}
    </Dropdown>
  );
}

export function ViewToggle({ state }: { state: BrowseState }) {
  const option = (view: BrowseState["view"], label: string) => (
    <Link
      href={browseHref(state, { view })}
      aria-current={state.view === view ? "true" : undefined}
      className={`rounded-full px-3 py-1 text-sm ${state.view === view ? "bg-ink text-paper" : "text-soft hover:text-ink"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="flex rounded-full border border-line bg-card p-0.5">
      {option("grid", "Grid")}
      {option("table", "Table")}
    </div>
  );
}

export function SearchBox() {
  return (
    <form action="/app/search" className="flex min-w-0 flex-1 gap-2">
      <input
        name="q"
        placeholder='Search by name or by look: "charger", "something red and round"'
        aria-label="Search your things"
        className="w-full min-w-0 rounded-full border border-line bg-card px-4 py-2 text-sm outline-none placeholder:text-soft focus:border-accent"
      />
      <button type="submit" className={secondaryButton}>
        Search
      </button>
    </form>
  );
}

type Chip = { label: string; href: string };

export function activeChips(state: BrowseState, names: PlaceNames): Chip[] {
  const chips: Chip[] = [];
  const add = (label: string | undefined, change: Partial<BrowseState>) => {
    if (label) chips.push({ label, href: browseHref(state, change) });
  };
  if (state.room) add(names.rooms.get(state.room), PLACE_CLEAR);
  if (state.furniture) add(names.furniture.get(state.furniture), { furniture: null, spot: null });
  if (state.spot) add(names.spots.get(state.spot), { spot: null });
  if (state.container) add(`in ${names.containers.get(state.container) ?? "a container"}`, { container: null });
  if (state.category) add(state.category, { category: null });
  if (state.color) add(state.color, { color: null });
  if (state.discard) add(`give away: ${state.discard}`, { discard: null });
  if (state.tag) add(`#${state.tag}`, { tag: null });
  return chips;
}

export function ActiveChips({ state, names }: { state: BrowseState; names: PlaceNames }) {
  if (!hasFilters(state)) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {activeChips(state, names).map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-on-accent hover:opacity-85"
        >
          {chip.label}
          <span aria-label="remove">×</span>
        </Link>
      ))}
      <Link href={browseHref(state, FILTER_CLEAR)} className="px-2 py-1 text-sm text-soft underline underline-offset-4">
        Clear all
      </Link>
    </div>
  );
}

export function ColorDot({ name, className = "size-4" }: { name: string; className?: string }) {
  const color = COLORS.find((c) => c.name === name);
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border border-line ${className}`}
      style={{ background: color?.swatch }}
    />
  );
}

function SortHeader({ state, sort, label }: { state: BrowseState; sort: Sort; label: string }) {
  const active = state.sort === sort;
  return (
    <th scope="col" className="px-3 py-2.5 text-left font-medium">
      <Link href={browseHref(state, { sort })} className={active ? "text-ink" : "hover:text-ink"}>
        {label}
        {active ? " ↓" : ""}
      </Link>
    </th>
  );
}

export function ItemTable({ items, state }: { items: ItemRow[]; state: BrowseState }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-line text-xs text-soft">
          <tr>
            <th scope="col" className="w-14 px-3 py-2.5">
              <span className="sr-only">Photo</span>
            </th>
            <SortHeader state={state} sort="name" label="Name" />
            <SortHeader state={state} sort="category" label="Category" />
            <SortHeader state={state} sort="room" label="Where" />
            <th scope="col" className="px-3 py-2.5 text-left font-medium">
              Color
            </th>
            <SortHeader state={state} sort="discard" label="Give away" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const src = imageUrl(item.id, item.cutout_file ?? item.original_file);
            return (
              <tr key={item.id} className="border-b border-line last:border-0 hover:bg-tile/60">
                <td className="px-3 py-1.5">
                  <div className="tile relative size-10 overflow-hidden rounded-lg">
                    {src ? (
                      <Image
                        src={src}
                        alt=""
                        fill
                        unoptimized
                        sizes="40px"
                        className={item.cutout_file ? "object-contain p-1" : "object-cover"}
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-1.5 font-semibold">
                  <Link href={`/app/items/${item.id}`} className="hover:underline">
                    {item.name}
                  </Link>
                </td>
                <td className="px-3 py-1.5 text-soft">{item.category}</td>
                <td className="px-3 py-1.5 text-soft">{locationText(item)}</td>
                <td className="px-3 py-1.5 text-soft">{item.color ?? ""}</td>
                <td className="px-3 py-1.5 text-soft">{item.would_discard}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Results({ items, state }: { items: ItemRow[]; state: BrowseState }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <p className="text-soft">Nothing matches these filters.</p>
        <div className="mt-4 flex justify-center gap-2">
          {hasFilters(state) ? (
            <Link href={browseHref(state, FILTER_CLEAR)} className={secondaryButton}>
              Clear filters
            </Link>
          ) : null}
          <Link href={state.room ? `/app/add?room=${state.room}` : "/app/add"} className={secondaryButton}>
            Add something
          </Link>
        </div>
      </div>
    );
  }
  return state.view === "table" ? <ItemTable items={items} state={state} /> : <ItemGrid items={items} />;
}

export function SideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-3 first:border-0 first:pt-0">
      <h2 className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-soft">{title}</h2>
      {children}
    </section>
  );
}

export function SideLink({
  href,
  active,
  count,
  depth = 0,
  children,
}: {
  href: string;
  active?: boolean;
  count?: number;
  depth?: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{ paddingLeft: `${0.625 + depth * 0.875}rem` }}
      className={`flex items-center justify-between gap-2 rounded-lg py-1.5 pr-2.5 text-sm ${
        active ? "bg-accent font-semibold text-on-accent" : "hover:bg-tile"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2 truncate">{children}</span>
      {count !== undefined ? (
        <span className={`font-mono text-[11px] ${active ? "opacity-80" : "text-soft"}`}>{count}</span>
      ) : null}
    </Link>
  );
}

export function MobileDrawer({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="rounded-2xl border border-line bg-card lg:hidden">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {label}
      </summary>
      <div className="border-t border-line p-3">{children}</div>
    </details>
  );
}
