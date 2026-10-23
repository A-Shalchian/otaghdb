import Link from "next/link";
import type { ReactNode } from "react";
import { AddRoomForm } from "@/features/rooms/add-room-form";
import { furnitureTitle, type PlaceTree as Places } from "@/lib/places";
import {
  browseHref,
  countBy,
  hasFilters,
  LAYOUTS,
  matches,
  parseBrowse,
  PLACE_CLEAR,
  sortItems,
  type BrowseState,
} from "./browse";
import { ActiveChips, MobileDrawer, Results, SearchBox, SortMenu, ViewToggle, type PlaceNames } from "./browse-parts";
import { Facets, FilterBar, GroupPicker, Shelves } from "./facets";
import { PlaceTree, type PlaceCounts } from "./place-tree";
import { getItems, getPlaces, getRooms, type ItemRow } from "./queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function placeNames(places: Places): PlaceNames {
  const furniture = places.rooms.flatMap((room) => room.furniture);
  return {
    rooms: new Map(places.rooms.map((room) => [room.id, room.name])),
    furniture: new Map(furniture.map((f) => [f.id, furnitureTitle(f.kind, f.name)])),
    spots: new Map(
      [...furniture.flatMap((f) => f.spots), ...places.rooms.flatMap((room) => room.looseSpots)].map((spot) => [
        spot.id,
        spot.name,
      ]),
    ),
    containers: new Map(places.containers.map((c) => [c.id, c.name])),
  };
}

function placeCounts(items: ItemRow[], state: BrowseState): PlaceCounts {
  const scoped = items.filter((item) => matches(item, { ...state, ...PLACE_CLEAR }));
  return {
    total: scoped.length,
    rooms: countBy(scoped, (item) => item.room_id),
    furniture: countBy(scoped, (item) => item.furniture_id),
    spots: countBy(scoped, (item) => item.spot_id),
    containers: countBy(scoped, (item) => item.container_id),
  };
}

function titleFor(state: BrowseState, names: PlaceNames) {
  if (state.container) return `In the ${names.containers.get(state.container) ?? "container"}`;
  if (state.spot) {
    const spot = names.spots.get(state.spot);
    const furniture = state.furniture ? names.furniture.get(state.furniture) : null;
    return furniture ? `${furniture}, ${spot}` : (spot ?? "Everything");
  }
  if (state.furniture) return names.furniture.get(state.furniture) ?? "Everything";
  if (state.room) return names.rooms.get(state.room) ?? "Everything";
  return "Everything";
}

function Toolbar({ count, state, children }: { count: number; state: BrowseState; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {children ?? (
          <span className="text-sm text-soft">
            {count} {count === 1 ? "thing" : "things"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <SortMenu state={state} />
        <ViewToggle state={state} />
      </div>
    </div>
  );
}

function WithAside({ aside, drawerLabel, children }: { aside: ReactNode; drawerLabel: string; children: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden self-start rounded-2xl border border-line bg-card p-3 lg:sticky lg:top-6 lg:block">
        {aside}
      </aside>
      <MobileDrawer label={drawerLabel}>{aside}</MobileDrawer>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </div>
  );
}

function LayoutSwitcher({ state }: { state: BrowseState }) {
  return (
    <nav aria-label="Layout" className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-card p-1 shadow-lg">
        <span className="shrink-0 px-2.5 font-mono text-[11px] uppercase tracking-wide text-soft">Layout</span>
        {LAYOUTS.map((layout) => (
          <Link
            key={layout.slug}
            href={browseHref(state, { layout: layout.slug })}
            aria-current={state.layout === layout.slug ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              state.layout === layout.slug ? "bg-accent text-on-accent" : "text-soft hover:text-ink"
            }`}
          >
            {layout.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export async function Inventory({ searchParams }: { searchParams: SearchParams }) {
  const state = parseBrowse(await searchParams);
  const [rooms, all, places] = await Promise.all([getRooms(), getItems(), getPlaces()]);
  const items = sortItems(
    all.filter((item) => matches(item, state)),
    state.sort,
  );
  const names = placeNames(places);
  const tree = <PlaceTree places={places} counts={placeCounts(all, state)} state={state} />;
  const results = <Results items={items} state={state} />;

  let body: ReactNode;
  if (state.layout === "tree") {
    body = (
      <WithAside aside={tree} drawerLabel="Browse by place">
        <ActiveChips state={state} names={names} />
        <Toolbar count={items.length} state={state} />
        {results}
      </WithAside>
    );
  } else if (state.layout === "sidebar") {
    body = (
      <WithAside aside={<Facets items={all} state={state} rooms={rooms} />} drawerLabel="Filters">
        <ActiveChips state={state} names={names} />
        <Toolbar count={items.length} state={state} />
        {results}
      </WithAside>
    );
  } else if (state.layout === "chips") {
    body = (
      <div className="flex flex-col gap-4">
        <Toolbar count={items.length} state={state}>
          <FilterBar items={all} state={state} rooms={rooms} />
        </Toolbar>
        <ActiveChips state={state} names={names} />
        {results}
      </div>
    );
  } else if (state.layout === "shelves") {
    body = (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <GroupPicker state={state} />
          <SortMenu state={state} />
        </div>
        {hasFilters(state) ? (
          <>
            <ActiveChips state={state} names={names} />
            {results}
          </>
        ) : (
          <Shelves items={items} state={state} group={state.group ?? "room"} />
        )}
      </div>
    );
  } else {
    body = (
      <WithAside
        aside={
          <div className="flex flex-col gap-4">
            {tree}
            <div className="border-t border-line pt-3">
              <Facets items={all} state={state} />
            </div>
          </div>
        }
        drawerLabel="Places and filters"
      >
        <ActiveChips state={state} names={names} />
        <Toolbar count={items.length} state={state}>
          <GroupPicker state={state} allowNone />
        </Toolbar>
        {state.group && items.length > 0 ? <Shelves items={items} state={state} group={state.group} /> : results}
      </WithAside>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SearchBox />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontStretch: "85%" }}>
            {titleFor(state, names)}
          </h1>
          <p className="mt-1 text-sm text-soft">
            {items.length === all.length
              ? `${all.length} things across ${rooms.length} rooms`
              : `${items.length} of ${all.length} things`}
            {state.room ? (
              <>
                {" · "}
                <Link href={`/app/rooms/${state.room}`} className="underline underline-offset-2">
                  room page
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <AddRoomForm />
      </div>
      {body}
      <LayoutSwitcher state={state} />
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-10 w-full rounded-full bg-card" />
      <div className="h-12 w-48 rounded-lg bg-card" />
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden h-96 rounded-2xl bg-card lg:block" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="aspect-[4/5] rounded-2xl border border-line bg-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
