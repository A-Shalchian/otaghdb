import { staticFile } from "remotion";

// Names, boxes, cutouts, answers and scores are real model output from the running
// app, captured on 2026-10-22 (raw responses in video/captures). Places are picked
// by hand, the same way a person picks them in the add form.

export const item = (id: number, file: "cutout.png" | "original.jpg") => staticFile(`items/${id}/${file}`);

export const single = {
  photo: item(14, "original.jpg"),
  cutout: item(14, "cutout.png"),
  photoSize: { w: 640, h: 480 },
  box: { x: 41, y: 74, w: 135, h: 43 },
  name: "white remote control",
  category: "electronics",
  color: "white with blue buttons",
  tags: ["remote", "tv", "control", "home", "entertainment"],
  place: ["bedroom", "desk", "top drawer"],
};

export const drawer = {
  photo: staticFile("drawer/scene.jpg"),
  size: { w: 640, h: 483 },
  objects: [
    { name: "blue comforter", box: [0, 282, 401, 482] },
    { name: "wooden dresser", box: [79, 203, 241, 314] },
    { name: "round mirror", box: [88, 99, 192, 198] },
    { name: "potted plant", box: [349, 216, 429, 352] },
    { name: "bookshelf books", box: [428, 40, 554, 340] },
    { name: "woven basket", box: [484, 300, 554, 379] },
    { name: "wall lamp", box: [0, 137, 40, 223] },
    { name: "heart pillow", box: [273, 234, 329, 285] },
  ].map((o, n) => ({ ...o, n, image: staticFile(`drawer/obj-${n}.png`) })),
};

export const askPassport = {
  question: "Where is my passport?",
  status: "Searched for passport",
  answer: "Your passport is in the navy backpack, which is located in the living room.",
  item: { name: "passport", location: ["living room", "navy backpack"] },
};

export const packing = {
  question: "Pack for a cozy reading weekend at a cabin",
  status: "Checked 10 things for the trip",
  title: "Cozy Reading Weekend at Cabin",
  owned: [
    { id: 9, name: "bookshelf books", location: "bedroom" },
    { id: 6, name: "heart pillow", location: "closet, hanging rod · bedroom" },
    { id: 11, name: "wall lamp", location: "bedroom" },
    { id: 12, name: "bottle on dresser", location: "bedroom" },
  ],
  missing: ["coffee mug", "notebook", "pen", "snacks", "charger"],
};

export const lookSearch = {
  query: "a light for reading",
  result: { id: 11, name: "wall lamp", location: "bedroom" },
};

export const check = {
  photo: staticFile("data/check-original.jpg"),
  cutout: staticFile("data/check-cutout.png"),
  score: 0.9027,
  name: "woven basket",
  location: "closet, floor · bedroom",
  others: [
    { id: 12, name: "bottle on dresser", score: 0.739 },
    { id: 13, name: "gray plastic jug", score: 0.739 },
  ],
};

// Wikimedia Commons photos (credits in video/README.md), cut out by the app's vision service.
export const lost = [
  { word: "keys", at: 138 },
  { word: "charger", at: 149 },
  { word: "headphones", at: 160 },
  { word: "wallet", at: 172 },
  { word: "sunglasses", at: 185 },
  { word: "passport", at: 200 },
].map((w) => ({ ...w, src: staticFile(`hook/${w.word}.png`) }));

export const models = [
  { name: "Qwen3.5 9B", job: "Names things, finds every object in a photo, answers questions", runs: "Ollama · GPU" },
  { name: "SAM 2.1", job: "Cuts out whatever you tap, or every box at once", runs: "CPU" },
  { name: "SigLIP 2", job: "Search by look and the duplicate check", runs: "CPU" },
  { name: "U2-Net", job: "Removes the background from a photo", runs: "CPU" },
];
