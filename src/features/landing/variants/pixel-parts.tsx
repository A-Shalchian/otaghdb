"use client";

import { useState } from "react";
import { sampleItems } from "../content";
import type { ObjectKey } from "../objects";

const W = 128;
const H = 100;
const PAD = 1.5;

const palette: Record<string, string> = {
  k: "#191628",
  n: "#2B2950",
  v: "#574A82",
  b: "#3F72B8",
  s: "#A8D8EA",
  w: "#EEF0F2",
  g: "#8D93A5",
  d: "#45495C",
  y: "#F0B84C",
  r: "#8C5A3A",
  R: "#5E3B26",
  e: "#4FA05C",
};

type Rect = readonly [number, number, number, number, string];
type Sprite = { x: number; y: number; map: string[] };

const roof: Rect[] = Array.from({ length: 8 }, (_, row): Rect => {
  const half = 8 + 7 * row;
  return [64 - half, 2 + 2 * row, half * 2, 2, row % 2 === 0 ? "R" : "r"];
});

const scene: Rect[] = [
  [10, 5, 1, 1, "w"], [22, 11, 1, 1, "w"], [104, 4, 1, 1, "w"], [118, 10, 1, 1, "w"], [4, 14, 1, 1, "s"], [124, 3, 1, 1, "s"],
  [88, 2, 8, 2, "k"], [89, 4, 6, 9, "d"],
  ...roof,
  [4, 18, 120, 1, "k"], [6, 19, 116, 74, "k"], [8, 21, 112, 70, "v"], [68, 21, 2, 70, "k"], [8, 55, 112, 2, "k"],
  [8, 52, 60, 3, "r"], [70, 52, 50, 3, "r"], [8, 52, 60, 1, "R"], [70, 52, 50, 1, "R"],
  [8, 88, 60, 3, "r"], [70, 88, 50, 3, "r"], [8, 88, 60, 1, "R"], [70, 88, 50, 1, "R"],
  [0, 93, 128, 3, "e"], [0, 96, 128, 4, "R"],
  [36, 21, 1, 3, "k"], [34, 24, 5, 2, "y"], [94, 21, 1, 3, "k"], [92, 24, 5, 2, "y"],
  [46, 57, 1, 2, "k"], [44, 59, 5, 2, "y"], [103, 57, 1, 3, "k"], [101, 60, 5, 2, "y"],
  [12, 26, 13, 11, "k"], [13, 27, 11, 9, "n"], [18, 27, 1, 9, "k"], [13, 31, 11, 1, "k"],
  [15, 28, 1, 1, "w"], [20, 28, 2, 2, "y"], [21, 33, 1, 1, "s"],
  [10, 40, 2, 12, "R"], [10, 47, 20, 3, "R"], [28, 50, 2, 2, "R"], [12, 44, 18, 3, "w"], [18, 43, 12, 4, "b"], [12, 42, 5, 2, "s"],
  [31, 44, 7, 8, "r"], [32, 47, 5, 1, "R"], [34, 49, 1, 1, "y"],
  [40, 38, 12, 14, "r"], [41, 41, 10, 1, "R"], [41, 50, 10, 1, "R"],
  [53, 23, 15, 29, "R"], [54, 24, 13, 27, "g"], [54, 37, 13, 2, "r"], [54, 45, 13, 1, "r"], [55, 42, 5, 3, "b"], [61, 43, 5, 2, "e"],
  [106, 26, 11, 10, "k"], [107, 27, 9, 8, "n"], [111, 27, 1, 8, "k"], [107, 30, 9, 1, "k"], [108, 28, 1, 1, "w"], [114, 32, 1, 1, "s"],
  [72, 39, 34, 2, "r"], [73, 41, 2, 11, "R"], [93, 41, 13, 11, "r"], [94, 42, 11, 2, "k"], [94, 48, 11, 1, "R"], [99, 50, 2, 1, "y"],
  [79, 31, 11, 8, "d"], [80, 32, 9, 6, "s"], [81, 33, 5, 1, "b"], [81, 35, 3, 1, "b"], [77, 38, 15, 1, "g"],
  [10, 65, 12, 23, "k"], [11, 66, 10, 22, "R"], [12, 68, 8, 6, "r"], [12, 77, 8, 9, "r"], [18, 75, 2, 1, "y"],
  [32, 61, 15, 14, "k"], [33, 62, 13, 12, "n"], [39, 62, 1, 12, "k"], [33, 67, 13, 1, "k"], [35, 64, 1, 1, "w"], [44, 70, 1, 1, "s"],
  [31, 75, 17, 2, "r"],
  [50, 61, 16, 27, "R"], [51, 62, 14, 25, "k"], [51, 70, 14, 1, "R"], [51, 79, 14, 1, "R"],
  [52, 64, 2, 6, "b"], [54, 65, 2, 5, "y"], [56, 64, 2, 6, "s"], [63, 66, 2, 4, "r"],
  [52, 72, 2, 7, "e"], [54, 73, 2, 6, "b"], [57, 75, 6, 2, "s"], [57, 77, 7, 2, "g"], [53, 83, 8, 2, "b"], [52, 85, 10, 2, "y"],
  [73, 62, 24, 11, "r"], [84, 62, 1, 11, "R"], [85, 63, 11, 9, "R"], [82, 66, 1, 2, "y"], [97, 62, 3, 11, "r"], [99, 62, 1, 11, "R"],
  [71, 76, 35, 2, "g"], [72, 78, 33, 10, "r"], [83, 79, 1, 9, "R"], [94, 79, 1, 9, "R"],
  [81, 82, 1, 2, "y"], [85, 82, 1, 2, "y"], [96, 82, 1, 2, "y"],
  [78, 73, 1, 3, "g"], [78, 73, 3, 1, "g"], [89, 73, 9, 1, "k"], [90, 74, 7, 2, "d"],
  [107, 60, 11, 28, "w"], [107, 70, 11, 1, "g"], [109, 63, 1, 5, "g"], [109, 72, 1, 6, "g"],
];

const front: Rect[] = [[39, 46, 14, 3, "R"], [45, 47, 2, 1, "y"]];

const sprites: Record<ObjectKey, Sprite> = {
  passport: { x: 61, y: 29, map: ["kkkkkk", "knnnnk", "knyynk", "kynnyk", "knyynk", "knnnnk", "knyynk", "kkkkkk"] },
  backpack: {
    x: 54,
    y: 25,
    map: [
      "...kkkk...", "..k....k..", ".kkkkkkkk.", "kddddddddk", "kdgddddgdk", "kddddddddk",
      "kddddddddk", "kdkkkkkkdk", "kdkddddkdk", "kdkdggdkdk", "kdkkkkkkdk", ".kkkkkkkk.",
    ],
  },
  hoodie: {
    x: 42,
    y: 39,
    map: ["..kkkkk..", ".kgdddgk.", "kggdwdggk", "kgggwgggk", "kgkgggkgk", "kgkgggkgk", "kgkgggkgk", "kkkkkkkkk"],
  },
  sunglasses: { x: 41, y: 35, map: ["kkkkkkkkk", "kdsk.kdsk", ".kk...kk."] },
  wallet: { x: 31, y: 40, map: ["kkkkkkk", "krrrRRk", "krrrRyk", "kkkkkkk"] },
  cable: {
    x: 86,
    y: 42,
    map: [".....kk", "....k..", "....k..", "...k...", "...k...", "..k....", "..k....", ".k.....", "kk.....", "gg....."],
  },
  headphones: { x: 95, y: 42, map: ["..kkkkk..", ".k.....k.", "k.......k", "k.......k", "kdk...kdk", "kdk...kdk", "kkk...kkk"] },
  pen: { x: 99, y: 30, map: ["...y.", "...k.", "..k..", "..k..", "kkkkk", "kgggk", "kgwgk", "kgggk", "kkkkk"] },
  keys: { x: 24, y: 70, map: ["..k..", ".g.g.", "g...g", ".g.g.", "..y..", ".yy..", "..y..", ".yy..", "..y.."] },
  plant: {
    x: 35,
    y: 65,
    map: ["...e....", ".e.ee.e.", ".ee.e.ee", "..eeee..", "...ee...", ".kkkkkk.", ".krrrrk.", "..krrk..", "..krrk..", "..kkkk.."],
  },
  book: { x: 59, y: 63, map: ["kkkk", "keek", "kwek", "keek", "keek", "kwek", "kkkk"] },
  mug: { x: 87, y: 66, map: ["kkkkk..", "kbbbkk.", "kbsbk.k", "kbbbk.k", "kbbbkk.", "kkkkk.."] },
};

const labels = [
  { text: "bedroom", x: 9.5, y: 24.5 },
  { text: "office", x: 71.5, y: 24.5 },
  { text: "living room", x: 9.5, y: 60.5 },
  { text: "kitchen", x: 71.5, y: 60.5 },
];

const roomOrder = ["bedroom", "office", "living room", "kitchen"];

function spriteRects(map: string[], ox: number, oy: number): Rect[] {
  const out: Rect[] = [];
  map.forEach((row, dy) => {
    let dx = 0;
    while (dx < row.length) {
      const color = row[dx];
      let run = 1;
      while (row[dx + run] === color) run += 1;
      if (color !== ".") out.push([ox + dx, oy + dy, run, 1, color]);
      dx += run;
    }
  });
  return out;
}

const placed = sampleItems
  .map((item) => {
    const sprite = sprites[item.object];
    return {
      item,
      x: sprite.x,
      y: sprite.y,
      w: Math.max(...sprite.map.map((row) => row.length)),
      h: sprite.map.length,
      rects: spriteRects(sprite.map, sprite.x, sprite.y),
      icon: spriteRects(sprite.map, 0, 0),
    };
  })
  .sort((a, b) => roomOrder.indexOf(a.item.room) - roomOrder.indexOf(b.item.room) || a.x - b.x);

type Placed = (typeof placed)[number];

const startId = placed.find((spot) => spot.item.object === "passport")?.item.id ?? placed[0].item.id;

function Rects({ rects }: { rects: Rect[] }) {
  return (
    <>
      {rects.map(([x, y, width, height, color], index) => (
        <rect key={index} x={x} y={y} width={width} height={height} fill={palette[color]} />
      ))}
    </>
  );
}

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function frame(color: string) {
  return {
    boxShadow: `0 -4px 0 0 ${color}, 0 4px 0 0 ${color}, -4px 0 0 0 ${color}, 4px 0 0 0 ${color}`,
  };
}

function Marker({ spot }: { spot: Placed }) {
  const left = spot.x - 2;
  const top = spot.y - 2;
  const right = spot.x + spot.w + 1;
  const bottom = spot.y + spot.h + 1;
  const middle = spot.x + Math.floor(spot.w / 2);
  const corners: Rect[] = [
    [left, top, 2, 1, "y"], [left, top, 1, 2, "y"], [right - 1, top, 2, 1, "y"], [right, top, 1, 2, "y"],
    [left, bottom, 2, 1, "y"], [left, bottom - 1, 1, 2, "y"], [right - 1, bottom, 2, 1, "y"], [right, bottom - 1, 1, 2, "y"],
  ];
  return (
    <>
      <Rects rects={corners} />
      <g className="pixel-bob">
        <Rects rects={[[middle - 1, top - 4, 3, 1, "y"], [middle, top - 3, 1, 1, "y"]]} />
      </g>
    </>
  );
}

function RecordPanel({ spot }: { spot: Placed }) {
  const { item } = spot;
  const rows = [
    { label: "room", value: item.room },
    { label: "spot", value: item.spot },
    ...(item.container ? [{ label: "in", value: item.container }] : []),
  ];
  return (
    <div
      id="pixel-record"
      aria-live="polite"
      className="mx-1 mt-8 flex gap-4 bg-[#191628] p-4 sm:gap-5 sm:p-5"
      style={frame("#EEF0F2")}
    >
      <svg
        viewBox={`0 0 ${spot.w} ${spot.h}`}
        shapeRendering="crispEdges"
        aria-hidden
        className="size-14 shrink-0 sm:size-16"
      >
        <Rects rects={spot.icon} />
      </svg>
      <div className="min-w-0">
        <p className="font-silkscreen text-sm text-[#F0B84C]">
          #{String(item.id).padStart(3, "0")} {item.name}
        </p>
        <dl className="mt-2 grid min-h-[4.5rem] grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 font-vt323 text-xl leading-6">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-[#A8D8EA]">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function PixelHouse() {
  const [activeId, setActiveId] = useState(startId);
  const active = placed.find((spot) => spot.item.id === activeId) ?? placed[0];

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          shapeRendering="crispEdges"
          aria-hidden
          className="block h-auto w-full"
        >
          <Rects rects={scene} />
          {labels.map((label) => (
            <text
              key={label.text}
              x={label.x}
              y={label.y}
              fontSize="3"
              fill="#EEF0F2"
              fillOpacity="0.8"
              className="font-silkscreen"
            >
              {label.text}
            </text>
          ))}
          {placed.map((spot) => (
            <Rects key={spot.item.id} rects={spot.rects} />
          ))}
          <Rects rects={front} />
          <Marker spot={active} />
        </svg>
        {placed.map((spot) => (
          <button
            key={spot.item.id}
            type="button"
            aria-label={`${spot.item.name}, show record`}
            aria-controls="pixel-record"
            onMouseEnter={() => setActiveId(spot.item.id)}
            onFocus={() => setActiveId(spot.item.id)}
            onClick={() => setActiveId(spot.item.id)}
            className="absolute cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#EEF0F2] focus-visible:outline-dashed"
            style={{
              left: pct(spot.x - PAD, W),
              top: pct(spot.y - PAD, H),
              width: pct(spot.w + PAD * 2, W),
              height: pct(spot.h + PAD * 2, H),
            }}
          />
        ))}
      </div>
      <RecordPanel spot={active} />
      <p className="mt-6 font-vt323 text-lg text-[#A8D8EA]">
        Hover, tap or tab through the house to read each record.
      </p>
    </div>
  );
}
