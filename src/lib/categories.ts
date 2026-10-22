export const CATEGORIES = [
  "clothing",
  "shoes",
  "accessories",
  "jewelry",
  "bags",
  "books",
  "documents",
  "electronics",
  "cables",
  "kitchen",
  "tools",
  "desk",
  "decor",
  "sports",
  "toiletries",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DISCARD_LEVELS = ["never", "maybe", "soon"] as const;

export type DiscardLevel = (typeof DISCARD_LEVELS)[number];
