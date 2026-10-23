import type { ObjectKey } from "./objects";

export const brand = {
  name: "OtaghDB",
  meaning: "otagh (n.) Persian for room",
  tagline: "Your room, as a database.",
  pitch:
    "Photograph your things. OtaghDB cuts each one out, names it, and files it under the room, the shelf and the bag it lives in. Then ask where anything is.",
  appHref: "/app",
  appCta: "Open your room",
  installHref: "#install",
  installCta: "Run it locally",
};

export const steps = [
  {
    title: "Snap",
    body: "Photograph one thing, or a whole drawer at once.",
  },
  {
    title: "It gets filed",
    body: "Every object is cut out of the photo, named and tagged. You pick the room, the spot and the bag it sits in.",
  },
  {
    title: "Ask",
    body: "\"Where is my passport?\" \"What do I bring camping?\" \"Move everything in the black backpack to the closet.\"",
  },
];

export const localPitch = {
  title: "Runs on your machine",
  body: "Every model runs on your own laptop. No account, no API key, no cloud. Photos of your things never leave the computer.",
};

export const models = [
  { name: "Qwen3.5", job: "Sees photos, names things, answers questions", license: "Apache 2.0" },
  { name: "SAM 2.1", job: "Cuts out exactly the object you tap", license: "Apache 2.0" },
  { name: "U2-Net", job: "Removes the background automatically", license: "Apache 2.0" },
  { name: "SigLIP 2", job: "Finds things by how they look", license: "Apache 2.0" },
];

export const install = [
  "git clone https://github.com/A-Shalchian/otaghdb",
  "cd otaghdb && pnpm install",
  "ollama pull qwen3.5:9b",
  "pnpm dev",
];

export type SampleItem = {
  id: number;
  name: string;
  category: string;
  room: string;
  spot: string;
  container: string | null;
  kept: string;
  discard: "never" | "maybe" | "soon";
  object: ObjectKey;
};

export const sampleItems: SampleItem[] = [
  { id: 42, name: "passport", category: "documents", room: "bedroom", spot: "closet shelf", container: "black backpack", kept: "travel", discard: "never", object: "passport" },
  { id: 17, name: "black backpack", category: "bags", room: "bedroom", spot: "closet shelf", container: null, kept: "carries everything", discard: "never", object: "backpack" },
  { id: 8, name: "grey zip hoodie", category: "clothing", room: "bedroom", spot: "dresser, second drawer", container: null, kept: "warmest one I own", discard: "never", object: "hoodie" },
  { id: 23, name: "house keys", category: "accessories", room: "living room", spot: "hook by the door", container: null, kept: "need them daily", discard: "never", object: "keys" },
  { id: 31, name: "usb-c cable", category: "cables", room: "office", spot: "desk drawer", container: null, kept: "charges the laptop", discard: "maybe", object: "cable" },
  { id: 12, name: "brown leather wallet", category: "accessories", room: "bedroom", spot: "nightstand", container: null, kept: "gift from my sister", discard: "never", object: "wallet" },
  { id: 54, name: "wired headphones", category: "electronics", room: "office", spot: "desk drawer", container: null, kept: "backup pair", discard: "soon", object: "headphones" },
  { id: 61, name: "blue mug", category: "kitchen", room: "kitchen", spot: "top cabinet", container: null, kept: "the good one", discard: "never", object: "mug" },
  { id: 5, name: "paperback novel", category: "books", room: "living room", spot: "bookshelf", container: null, kept: "half read", discard: "maybe", object: "book" },
  { id: 77, name: "sunglasses", category: "accessories", room: "bedroom", spot: "closet shelf", container: "black backpack", kept: "summer", discard: "never", object: "sunglasses" },
  { id: 3, name: "fountain pen", category: "desk", room: "office", spot: "pen cup", container: null, kept: "writes well", discard: "never", object: "pen" },
  { id: 90, name: "potted plant", category: "decor", room: "living room", spot: "windowsill", container: null, kept: "still alive", discard: "never", object: "plant" },
];

export const stats = { items: 214, rooms: 5 };
