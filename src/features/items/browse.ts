import { CATEGORIES } from "@/lib/categories";
import { parseTags, type ItemRow } from "./queries";

export const LAYOUTS = [
  { slug: "tree", name: "House tree" },
  { slug: "sidebar", name: "Sidebar filters" },
  { slug: "chips", name: "Filter bar" },
  { slug: "shelves", name: "Shelves" },
  { slug: "combined", name: "Combined" },
] as const;

export type Layout = (typeof LAYOUTS)[number]["slug"];

export const SORTS = [
  { slug: "newest", name: "Newest" },
  { slug: "oldest", name: "Oldest" },
  { slug: "name", name: "Name, A to Z" },
  { slug: "name-desc", name: "Name, Z to A" },
  { slug: "room", name: "Room and place" },
  { slug: "category", name: "Category" },
  { slug: "discard", name: "Give away first" },
  { slug: "changed", name: "Recently changed" },
] as const;

export type Sort = (typeof SORTS)[number]["slug"];

export const GROUPS = [
  { slug: "room", name: "Room" },
  { slug: "furniture", name: "Furniture" },
  { slug: "category", name: "Category" },
  { slug: "color", name: "Color" },
] as const;

export type Group = (typeof GROUPS)[number]["slug"];

export const DISCARDS = ["never", "maybe", "soon"] as const;

export const COLORS = [
  { name: "black", swatch: "#1f2328", words: ["black"] },
  { name: "white", swatch: "#f5f5f2", words: ["white", "cream", "ivory"] },
  { name: "gray", swatch: "#8b929b", words: ["gray", "grey", "silver"] },
  { name: "brown", swatch: "#8a5a36", words: ["brown", "wood", "tan", "beige"] },
  { name: "red", swatch: "#c8433b", words: ["red", "maroon"] },
  { name: "orange", swatch: "#e08a2e", words: ["orange"] },
  { name: "yellow", swatch: "#e5c33c", words: ["yellow", "gold"] },
  { name: "green", swatch: "#4f9a57", words: ["green", "olive"] },
  { name: "blue", swatch: "#3f6fc4", words: ["blue", "navy", "teal"] },
  { name: "purple", swatch: "#8457b8", words: ["purple", "violet"] },
  { name: "pink", swatch: "#e07aa5", words: ["pink"] },
  { name: "mixed", swatch: "conic-gradient(#c8433b, #e5c33c, #4f9a57, #3f6fc4, #c8433b)", words: ["multi", "mixed"] },
] as const;

export type BrowseState = {
  layout: Layout;
  view: "grid" | "table";
  sort: Sort;
  group: Group | null;
  room: number | null;
  furniture: number | null;
  spot: number | null;
  container: number | null;
  category: string | null;
  tag: string | null;
  color: string | null;
  discard: string | null;
};

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

function id(value: string | null) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function oneOf<T extends string>(value: string | null, options: readonly T[]): T | null {
  return value && (options as readonly string[]).includes(value) ? (value as T) : null;
}

export function parseBrowse(params: Params): BrowseState {
  return {
    layout: oneOf(first(params.layout), LAYOUTS.map((l) => l.slug)) ?? "combined",
    view: first(params.view) === "table" ? "table" : "grid",
    sort: oneOf(first(params.sort), SORTS.map((s) => s.slug)) ?? "newest",
    group: oneOf(first(params.group), GROUPS.map((g) => g.slug)),
    room: id(first(params.room)),
    furniture: id(first(params.furniture)),
    spot: id(first(params.spot)),
    container: id(first(params.container)),
    category: oneOf(first(params.category), CATEGORIES),
    tag: first(params.tag),
    color: oneOf(first(params.color), COLORS.map((c) => c.name)),
    discard: oneOf(first(params.discard), DISCARDS),
  };
}

const DEFAULTS: Partial<Record<keyof BrowseState, string>> = { layout: "combined", view: "grid", sort: "newest" };

export function browseHref(state: BrowseState, change: Partial<BrowseState> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...state, ...change })) {
    if (value === null || value === undefined) continue;
    const text = String(value);
    if (DEFAULTS[key as keyof BrowseState] === text) continue;
    params.set(key, text);
  }
  const query = params.toString();
  return query ? `/app?${query}` : "/app";
}

export const PLACE_CLEAR = { room: null, furniture: null, spot: null, container: null } as const;
export const FILTER_CLEAR = { ...PLACE_CLEAR, category: null, tag: null, color: null, discard: null } as const;

export function colorsOf(item: ItemRow): string[] {
  const text = (item.color ?? "").toLowerCase();
  if (!text) return [];
  return COLORS.filter((color) => color.words.some((word) => text.includes(word))).map((color) => color.name);
}

export function matches(item: ItemRow, state: BrowseState, skip?: keyof BrowseState) {
  if (skip !== "room" && state.room && item.room_id !== state.room) return false;
  if (skip !== "furniture" && state.furniture && item.furniture_id !== state.furniture) return false;
  if (skip !== "spot" && state.spot && item.spot_id !== state.spot) return false;
  if (skip !== "container" && state.container && item.container_id !== state.container) return false;
  if (skip !== "category" && state.category && item.category !== state.category) return false;
  if (skip !== "tag" && state.tag && !parseTags(item.tags_json).includes(state.tag)) return false;
  if (skip !== "color" && state.color && !colorsOf(item).includes(state.color)) return false;
  if (skip !== "discard" && state.discard && item.would_discard !== state.discard) return false;
  return true;
}

const DISCARD_ORDER: Record<string, number> = { soon: 0, maybe: 1, never: 2 };

function byText(a: string | null, b: string | null) {
  return (a ?? "￿").localeCompare(b ?? "￿", undefined, { sensitivity: "base" });
}

export function sortItems(items: ItemRow[], sort: Sort) {
  const sorted = [...items];
  const byName = (a: ItemRow, b: ItemRow) => byText(a.name, b.name);
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
    case "name":
      return sorted.sort(byName);
    case "name-desc":
      return sorted.sort((a, b) => byName(b, a));
    case "room":
      return sorted.sort(
        (a, b) =>
          byText(a.room_name, b.room_name) ||
          byText(a.furniture_name, b.furniture_name) ||
          byText(a.spot_name, b.spot_name) ||
          byName(a, b),
      );
    case "category":
      return sorted.sort((a, b) => byText(a.category, b.category) || byName(a, b));
    case "discard":
      return sorted.sort(
        (a, b) => (DISCARD_ORDER[a.would_discard] ?? 3) - (DISCARD_ORDER[b.would_discard] ?? 3) || byName(a, b),
      );
    case "changed":
      return sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id);
    default:
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
  }
}

export function countBy<K extends string | number>(items: ItemRow[], key: (item: ItemRow) => K | K[] | null) {
  const counts = new Map<K, number>();
  for (const item of items) {
    const value = key(item);
    for (const k of Array.isArray(value) ? value : value === null ? [] : [value]) {
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return counts;
}

export type ItemGroup = { key: string; label: string; items: ItemRow[]; filter: Partial<BrowseState> };

export function groupItems(items: ItemRow[], group: Group): ItemGroup[] {
  const groups = new Map<string, ItemGroup>();
  const add = (key: string, label: string, filter: Partial<BrowseState>, item: ItemRow) => {
    const entry = groups.get(key) ?? { key, label, items: [], filter };
    entry.items.push(item);
    groups.set(key, entry);
  };
  for (const item of items) {
    if (group === "room") {
      add(`r${item.room_id ?? 0}`, item.room_name ?? "No room", { ...PLACE_CLEAR, room: item.room_id }, item);
    } else if (group === "furniture") {
      const label = item.furniture_name ? `${item.furniture_name} · ${item.room_name ?? ""}` : `Not in furniture · ${item.room_name ?? "no room"}`;
      add(
        item.furniture_id ? `f${item.furniture_id}` : `r${item.room_id ?? 0}`,
        label,
        item.furniture_id ? { ...PLACE_CLEAR, furniture: item.furniture_id } : { ...PLACE_CLEAR, room: item.room_id },
        item,
      );
    } else if (group === "category") {
      add(item.category, item.category, { category: item.category }, item);
    } else {
      const colors = colorsOf(item);
      if (colors.length === 0) add("none", "No color", {}, item);
      for (const color of colors) add(color, color, { color }, item);
    }
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length || byText(a.label, b.label));
}

export function hasFilters(state: BrowseState) {
  return Boolean(
    state.room || state.furniture || state.spot || state.container || state.category || state.tag || state.color || state.discard,
  );
}
