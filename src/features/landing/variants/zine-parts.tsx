import type { CSSProperties, ReactNode } from "react";
import { ObjectArt, type ObjectKey } from "../objects";

const INK = "#121212";
const PINK = "#ff48b0";

export const zineCss = `@layer components{
.zine-toner{background-image:radial-gradient(rgba(18,18,18,.08) .8px,transparent 1.2px),radial-gradient(rgba(18,18,18,.05) .8px,transparent 1.2px);background-size:7px 7px,13px 11px;background-position:0 0,4px 6px}
.zine-lift{filter:drop-shadow(2px 3px 0 rgba(18,18,18,.22))}
.zine-sticker svg{overflow:visible;filter:grayscale(1) contrast(1.35) drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(3px 5px 0 rgba(18,18,18,.3))}
.zine-tile{display:inline-block;line-height:1;padding:.08em .14em .1em;margin:0 .025em;box-shadow:1px 2px 0 rgba(18,18,18,.3)}
.zine-tile-border{outline:2px solid #121212;outline-offset:-2px}
.zine-dots{background-image:radial-gradient(#ff48b0 30%,transparent 33%);background-size:.24em .24em}
.zine-halftone{background-color:#fff;background-image:radial-gradient(#ff48b0 34%,transparent 37%);background-size:9px 9px}
.zine-lined{background-image:repeating-linear-gradient(180deg,transparent 0 calc(2.8rem - 1px),#c9c9c9 calc(2.8rem - 1px) 2.8rem),linear-gradient(90deg,transparent 2.1rem,#ff48b0 2.1rem,#ff48b0 calc(2.1rem + 2px),transparent calc(2.1rem + 2px));background-position:0 2rem,0 0}
.zine-strip{box-shadow:2px 3px 0 rgba(18,18,18,.28)}
}`;

const jag = [0, 4, 1, 5, 2, 6, 1, 3, 0, 5, 2, 4, 1];

export function tornClip(seed: number, depth = 6, teeth = 22) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= teeth; i += 1) {
    const x = ((i / teeth) * 100).toFixed(2);
    const a = (jag[(i * 7 + seed) % jag.length] / 6) * depth;
    const b = (jag[(i * 5 + seed * 3 + 2) % jag.length] / 6) * depth;
    top.push(`${x}% ${a.toFixed(1)}px`);
    bottom.unshift(`${x}% calc(100% - ${b.toFixed(1)}px)`);
  }
  return `polygon(${top.concat(bottom).join(", ")})`;
}

const TAPE_CLIP = "polygon(3% 0, 97% 7%, 100% 52%, 96% 100%, 4% 93%, 0 48%)";

export function Tape({ className = "", tilt = -5, pink = false }: { className?: string; tilt?: number; pink?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute block h-6 w-24 ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        clipPath: TAPE_CLIP,
        background: pink ? "rgba(255,72,176,0.8)" : "rgba(206,203,190,0.75)",
      }}
    />
  );
}

const tapeSpots = {
  left: "-top-3 left-5",
  right: "-top-3 right-5",
  center: "-top-3 left-1/2 -translate-x-1/2",
};

export function Paper({
  children,
  seed = 0,
  tilt = 0,
  tape,
  pinkTape = false,
  dark = false,
  className = "",
  innerClassName = "",
}: {
  children: ReactNode;
  seed?: number;
  tilt?: number;
  tape?: keyof typeof tapeSpots;
  pinkTape?: boolean;
  dark?: boolean;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={`zine-lift relative ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      <div
        className={`${dark ? "bg-[#121212] text-[#f4f4f0]" : "bg-white"} ${innerClassName}`}
        style={{ clipPath: tornClip(seed) }}
      >
        {children}
      </div>
      {tape ? <Tape className={tapeSpots[tape]} pink={pinkTape} tilt={tape === "right" ? 5 : -5} /> : null}
    </div>
  );
}

export function Sticker({ name, tilt = 0, className = "" }: { name: ObjectKey; tilt?: number; className?: string }) {
  return (
    <div
      className={`zine-sticker motion-safe:transition-[scale] motion-safe:duration-300 hover:scale-105 ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <ObjectArt name={name} className="block aspect-square w-full" />
    </div>
  );
}

const arrowPaths = {
  curl: { box: "0 0 84 56", width: 3, shaft: "M8 46C20 20 44 8 74 14", head: "M62 6l13 8-11 10" },
  flat: { box: "0 0 36 20", width: 2.5, shaft: "M3 10c9-6 19 4 29-1", head: "M25 3l8 6-7 7" },
};

export function Arrow({ kind, className = "" }: { kind: keyof typeof arrowPaths; className?: string }) {
  const arrow = arrowPaths[kind];
  return (
    <svg
      aria-hidden="true"
      viewBox={arrow.box}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={arrow.width}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={arrow.shaft} />
      <path d={arrow.head} />
    </svg>
  );
}

export function CircledNumber({ n }: { n: number }) {
  return (
    <span className="relative inline-flex size-16 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 64 60"
        className="absolute inset-0 size-full text-[#ff48b0]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <path d="M36 5C18 2 5 14 6 31c1 16 15 25 30 23 15-2 23-14 21-28C55 13 44 5 28 7" />
      </svg>
      <span className="relative font-caveat text-5xl font-bold leading-none">{n}</span>
    </span>
  );
}

export function HeadStrip({ children, tilt = -1.5 }: { children: ReactNode; tilt?: number }) {
  return (
    <span className="inline-block max-w-full" style={{ transform: `rotate(${tilt}deg)` }}>
      <span
        className="bg-[#121212] box-decoration-clone px-3 text-3xl font-black leading-[1.3] text-white sm:text-5xl sm:leading-[1.25]"
        style={{ fontStretch: "75%" }}
      >
        {children}
      </span>
    </span>
  );
}

export function Scissors({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.5 7.5 20 18M8.5 16.5 20 6" />
    </svg>
  );
}

type Tile = {
  bg: string;
  fg: string;
  weight: number;
  stretch: string;
  upper: boolean;
  italic?: boolean;
  scale?: number;
  extra: string;
};

const tiles: Tile[] = [
  { bg: "#ffffff", fg: INK, weight: 900, stretch: "62%", upper: true, extra: "" },
  { bg: INK, fg: "#ffffff", weight: 800, stretch: "125%", upper: false, extra: "" },
  { bg: PINK, fg: INK, weight: 500, stretch: "100%", upper: true, italic: true, extra: "" },
  { bg: "#d9d7cf", fg: INK, weight: 300, stretch: "75%", upper: true, extra: "" },
  { bg: "#ffffff", fg: INK, weight: 700, stretch: "112%", upper: false, extra: "zine-tile-border" },
  { bg: "#ffffff", fg: INK, weight: 700, stretch: "100%", upper: false, scale: 1.3, extra: "font-caveat" },
  { bg: INK, fg: PINK, weight: 900, stretch: "87%", upper: true, extra: "" },
  { bg: "#ffffff", fg: INK, weight: 600, stretch: "87%", upper: false, extra: "zine-dots" },
];

const lift = [0, -0.06, 0.05, -0.03, 0.07, -0.02, 0.03];
const turn = [-4, 3, -2, 5, -3, 2, -5, 1, 4];
const grow = [1, 0.86, 1.08, 0.94, 1.12, 0.9];

export function Ransom({ text }: { text: string }) {
  const words = text.split(" ");
  const starts = words.map((_, w) => words.slice(0, w).join("").length);

  return (
    <span aria-hidden="true" className="flex flex-wrap items-center gap-x-[0.3em] gap-y-[0.2em]">
      {words.map((word, w) => (
        <span key={`${word}-${w}`} className="inline-flex items-center whitespace-nowrap">
          {Array.from(word).map((char, c) => {
            const i = starts[w] + c;
            const tile = tiles[(i * 5) % tiles.length];
            const style: CSSProperties = {
              backgroundColor: tile.bg,
              color: tile.fg,
              fontWeight: tile.weight,
              fontStretch: tile.stretch,
              fontStyle: tile.italic ? "italic" : "normal",
              fontSize: `${(grow[i % grow.length] * (tile.scale ?? 1)).toFixed(3)}em`,
              transform: `translateY(${lift[i % lift.length]}em) rotate(${turn[(i * 4) % turn.length]}deg)`,
            };
            return (
              <span key={`${char}-${c}`} className={`zine-tile ${tile.extra}`} style={style}>
                {tile.upper ? char.toUpperCase() : char.toLowerCase()}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
