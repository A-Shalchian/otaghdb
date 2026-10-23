import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import {
  browseHref,
  colorsOf,
  COLORS,
  countBy,
  DISCARDS,
  GROUPS,
  groupItems,
  matches,
  type BrowseState,
  type Group,
  type ItemGroup,
} from "./browse";
import { ColorDot, SideLink, SideSection } from "./browse-parts";
import { ItemCard } from "./item-card";
import { parseTags, type ItemRow } from "./queries";

function facetCounts(items: ItemRow[], state: BrowseState) {
  const scoped = (skip: keyof BrowseState) => items.filter((item) => matches(item, state, skip));
  return {
    categories: countBy(scoped("category"), (item) => item.category),
    colors: countBy(scoped("color"), colorsOf),
    discards: countBy(scoped("discard"), (item) => item.would_discard),
    tags: [...countBy(scoped("tag"), (item) => parseTags(item.tags_json)).entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14),
  };
}

export function Facets({ items, state }: { items: ItemRow[]; state: BrowseState }) {
  const counts = facetCounts(items, state);
  const categories = CATEGORIES.filter((c) => (counts.categories.get(c) ?? 0) > 0 || c === state.category);
  const colors = COLORS.filter((c) => (counts.colors.get(c.name) ?? 0) > 0 || c.name === state.color);

  return (
    <div className="flex flex-col gap-4">
      <SideSection title="Category">
        {categories.length === 0 ? <p className="px-2.5 text-sm text-soft">No categories here.</p> : null}
        {categories.map((category) => (
          <SideLink
            key={category}
            href={browseHref(state, { category: state.category === category ? null : category })}
            active={state.category === category}
            count={counts.categories.get(category) ?? 0}
          >
            {category}
          </SideLink>
        ))}
      </SideSection>

      {colors.length > 0 ? (
        <SideSection title="Color">
          <div className="flex flex-wrap gap-1.5">
            {colors.map((color) => {
              const active = state.color === color.name;
              return (
                <Link
                  key={color.name}
                  href={browseHref(state, { color: active ? null : color.name })}
                  title={`${color.name} (${counts.colors.get(color.name) ?? 0})`}
                  className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs ${
                    active ? "border-accent bg-accent text-on-accent" : "border-line hover:border-accent"
                  }`}
                >
                  <ColorDot name={color.name} className="size-3.5" />
                  {color.name}
                  <span className="font-mono opacity-70">{counts.colors.get(color.name) ?? 0}</span>
                </Link>
              );
            })}
          </div>
        </SideSection>
      ) : null}

      <SideSection title="Would give away">
        <div className="flex gap-1.5">
          {DISCARDS.map((discard) => {
            const active = state.discard === discard;
            return (
              <Link
                key={discard}
                href={browseHref(state, { discard: active ? null : discard })}
                className={`flex-1 rounded-full border px-2 py-1 text-center text-xs ${
                  active ? "border-accent bg-accent text-on-accent" : "border-line hover:border-accent"
                }`}
              >
                {discard} <span className="font-mono opacity-70">{counts.discards.get(discard) ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </SideSection>

      {counts.tags.length > 0 ? (
        <SideSection title="Tags">
          <div className="flex flex-wrap gap-1">
            {counts.tags.map(([tag, count]) => {
              const active = state.tag === tag;
              return (
                <Link
                  key={tag}
                  href={browseHref(state, { tag: active ? null : tag })}
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                    active ? "bg-accent text-on-accent" : "bg-tile text-soft hover:text-ink"
                  }`}
                >
                  #{tag} {count}
                </Link>
              );
            })}
          </div>
        </SideSection>
      ) : null}
    </div>
  );
}

export function GroupPicker({ state }: { state: BrowseState }) {
  const current = state.group;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-sm text-soft">Group by</span>
      <Link
        href={browseHref(state, { group: null })}
        className={`rounded-full px-3 py-1 text-sm ${current === null ? "bg-ink text-paper" : "border border-line hover:border-accent"}`}
      >
        none
      </Link>
      {GROUPS.map((group) => (
        <Link
          key={group.slug}
          href={browseHref(state, { group: group.slug as Group })}
          className={`rounded-full px-3 py-1 text-sm ${
            current === group.slug ? "bg-ink text-paper" : "border border-line hover:border-accent"
          }`}
        >
          {group.name.toLowerCase()}
        </Link>
      ))}
    </div>
  );
}

function Shelf({ group, state }: { group: ItemGroup; state: BrowseState }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {group.label} <span className="font-mono text-xs font-normal text-soft">{group.items.length}</span>
        </h2>
        <Link href={browseHref(state, { ...group.filter, group: null })} className="text-sm text-soft hover:text-ink">
          See all →
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {group.items.map((item) => (
          <ItemCard key={item.id} item={item} className="w-40 shrink-0 snap-start sm:w-44" />
        ))}
      </ul>
    </section>
  );
}

export function Shelves({ items, state, group }: { items: ItemRow[]; state: BrowseState; group: Group }) {
  const groups = groupItems(items, group);
  if (groups.length === 0) return null;
  return (
    <div className="flex flex-col gap-7">
      {groups.map((g) => (
        <Shelf key={g.key} group={g} state={state} />
      ))}
    </div>
  );
}
