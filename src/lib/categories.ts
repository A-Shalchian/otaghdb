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

export const CLOTHING_TYPES = [
  "t-shirt",
  "shirt",
  "sweater",
  "hoodie",
  "jacket",
  "coat",
  "pants",
  "jeans",
  "shorts",
  "skirt",
  "dress",
  "suit",
  "activewear",
  "sleepwear",
  "underwear",
  "socks",
] as const;

export type ClothingType = (typeof CLOTHING_TYPES)[number];

export const CLOSET_CATEGORIES: readonly string[] = ["clothing", "shoes", "accessories"];

export const DISCARD_LEVELS = ["never", "maybe", "soon"] as const;

export type DiscardLevel = (typeof DISCARD_LEVELS)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isClothingType(value: string): value is ClothingType {
  return (CLOTHING_TYPES as readonly string[]).includes(value);
}
