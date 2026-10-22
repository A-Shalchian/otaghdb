export type CompartmentStyle = "rod" | "shelf" | "drawer" | "floor" | "hooks" | "surface";

export type CompartmentTemplate = {
  name: string;
  style: CompartmentStyle;
  // Categories from the fixed list, or "clothing:<type>" for one clothing type.
  holds: string[];
};

export type FurnitureTemplate = { label: string; compartments: CompartmentTemplate[] };

const shelves = (holds: string[]): CompartmentTemplate[] =>
  ["top shelf", "middle shelf", "bottom shelf"].map((name) => ({ name, style: "shelf", holds }));

export const FURNITURE_TEMPLATES = {
  closet: {
    label: "Closet",
    compartments: [
      {
        name: "hanging rod",
        style: "rod",
        holds: ["clothing:shirt", "clothing:jacket", "clothing:coat", "clothing:dress", "clothing:suit", "clothing:hoodie", "clothing"],
      },
      {
        name: "shelves",
        style: "shelf",
        holds: ["clothing:sweater", "clothing:jeans", "clothing:pants", "clothing:t-shirt", "clothing:shorts", "clothing:skirt", "clothing"],
      },
      { name: "top shelf", style: "shelf", holds: ["bags", "accessories", "other"] },
      { name: "floor", style: "floor", holds: ["shoes"] },
      { name: "door hooks", style: "hooks", holds: ["accessories", "bags"] },
    ],
  },
  desk: {
    label: "Desk",
    compartments: [
      { name: "desktop", style: "surface", holds: ["electronics", "desk", "decor"] },
      { name: "top drawer", style: "drawer", holds: ["desk", "cables", "electronics"] },
      { name: "middle drawer", style: "drawer", holds: ["documents", "books", "desk"] },
      { name: "bottom drawer", style: "drawer", holds: ["documents", "tools", "other"] },
    ],
  },
  dresser: {
    label: "Dresser",
    compartments: [
      { name: "top", style: "surface", holds: ["jewelry", "accessories", "toiletries"] },
      { name: "top drawer", style: "drawer", holds: ["clothing:socks", "clothing:underwear"] },
      {
        name: "middle drawer",
        style: "drawer",
        holds: ["clothing:t-shirt", "clothing:activewear", "clothing:sleepwear", "clothing"],
      },
      {
        name: "bottom drawer",
        style: "drawer",
        holds: ["clothing:pants", "clothing:jeans", "clothing:sweater", "clothing:shorts"],
      },
    ],
  },
  nightstand: {
    label: "Nightstand",
    compartments: [
      { name: "top", style: "surface", holds: ["electronics", "books", "decor"] },
      { name: "drawer", style: "drawer", holds: ["toiletries", "cables", "books", "other"] },
    ],
  },
  bathroom_cabinet: {
    label: "Bathroom cabinet",
    compartments: [
      { name: "shelves", style: "shelf", holds: ["toiletries"] },
      { name: "under the sink", style: "shelf", holds: ["toiletries", "tools", "other"] },
    ],
  },
  kitchen_cabinet: { label: "Kitchen cabinet", compartments: shelves(["kitchen"]) },
  bookshelf: { label: "Bookshelf", compartments: shelves(["books", "decor"]) },
} satisfies Record<string, FurnitureTemplate>;

export type FurnitureKind = keyof typeof FURNITURE_TEMPLATES;

export const FURNITURE_KINDS = Object.keys(FURNITURE_TEMPLATES) as FurnitureKind[];

export function isFurnitureKind(value: string): value is FurnitureKind {
  return Object.hasOwn(FURNITURE_TEMPLATES, value);
}

export function furnitureLabel(kind: string) {
  return isFurnitureKind(kind) ? FURNITURE_TEMPLATES[kind].label : kind;
}

function holdScore(holds: string[], category: string, clothingType: string | null) {
  if (clothingType && holds.includes(`${category}:${clothingType}`)) return 3;
  if (holds.includes(category)) return 1;
  return 0;
}

export function suggestSpot<T extends { holds: string[] }>(
  spots: T[],
  category: string,
  clothingType: string | null,
): T | null {
  let best: T | null = null;
  let bestScore = 0;
  for (const spot of spots) {
    const score = holdScore(spot.holds, category, clothingType);
    if (score > bestScore) {
      best = spot;
      bestScore = score;
    }
  }
  return best;
}

export function isOddPlace(holds: string[], category: string) {
  if (holds.length === 0) return false;
  return !holds.some((hold) => hold === category || hold.startsWith(`${category}:`));
}

export function parseHolds(json: string | null): string[] {
  try {
    const value = JSON.parse(json ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function holdsLabel(holds: string[]) {
  const categories = [...new Set(holds.map((hold) => hold.split(":")[0]))];
  return categories.join(", ");
}
