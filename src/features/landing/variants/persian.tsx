import Link from "next/link";
import type { ReactNode } from "react";
import { answer, brand, install, localPitch, models, steps } from "../content";

const TILE = 48;
const HALF = TILE / 2;
const STAR = HALF * Math.SQRT1_2;
const persianDigits = ["۱", "۲", "۳"];
const bands = [
  { inset: 0, color: "#E2A93B" },
  { inset: 2, color: "#1D3E8F" },
  { inset: 7, color: "#E2A93B" },
  { inset: 8.5, color: "#F2F6F4" },
];
const starCenters = [
  [0, 0],
  [TILE, 0],
  [0, TILE],
  [TILE, TILE],
  [HALF, HALF],
] as const;
const crossCenters = [
  [HALF, 0],
  [0, HALF],
  [TILE, HALF],
  [HALF, TILE],
] as const;

const lightFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E1C4D]";

function star(cx: number, cy: number, outer: number) {
  const inner = (outer * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
  return Array.from({ length: 16 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 8) * index;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

function diamond(cx: number, cy: number, size: number) {
  return `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
}

function arch(d: number) {
  const left = d;
  const right = 200 - d;
  const side = (42 + d * 0.3).toFixed(2);
  const shoulderY = (18 + d * 0.9).toFixed(2);
  const apex = (d * 1.15).toFixed(2);
  return `M${left} 130V78C${left} ${side} ${(58 + d * 0.45).toFixed(2)} ${shoulderY} 100 ${apex}C${(142 - d * 0.45).toFixed(2)} ${shoulderY} ${right} ${side} ${right} 78V130Z`;
}

function GirihDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <pattern id="persian-girih" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          <rect width={TILE} height={TILE} fill="#2FA39C" />
          {starCenters.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <polygon
                points={star(x, y, STAR)}
                fill="#1D3E8F"
                stroke="#F2F6F4"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <polygon points={star(x, y, STAR * 0.42)} fill="#E2A93B" />
            </g>
          ))}
          {crossCenters.map(([x, y]) => (
            <polygon key={`${x}-${y}`} points={diamond(x, y, 3.2)} fill="#F2F6F4" />
          ))}
        </pattern>
      </defs>
    </svg>
  );
}

function TileStrip({ className }: { className: string }) {
  return (
    <svg aria-hidden className={`block w-full ${className}`}>
      <rect width="100%" height="100%" fill="url(#persian-girih)" />
    </svg>
  );
}

function Ornament({ className }: { className: string }) {
  return (
    <svg viewBox="-10 -10 20 20" aria-hidden className={className}>
      <polygon points={star(0, 0, 9.5)} fill="currentColor" />
    </svg>
  );
}

function Mihrab({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[44rem]">
      <svg viewBox="0 0 200 130" role="img" aria-label={brand.persian} className="block h-auto w-full">
        {bands.map((band) => (
          <path key={band.inset} d={arch(band.inset)} fill={band.color} />
        ))}
        <polygon points={star(100, 40, 8)} fill="#2FA39C" />
        <polygon points={star(100, 40, 3.4)} fill="#E2A93B" />
        <text
          x="100"
          y="108"
          lang="fa"
          textAnchor="middle"
          fontSize="56"
          fontWeight="800"
          fill="#1D3E8F"
          className="font-vazir"
        >
          {brand.persian}
        </text>
      </svg>
      <div className="relative">
        {bands.map((band) => (
          <div
            key={band.inset}
            aria-hidden
            className="absolute inset-y-0"
            style={{ left: `${band.inset / 2}%`, right: `${band.inset / 2}%`, backgroundColor: band.color }}
          />
        ))}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2 bg-[#E2A93B]" />
        <div className="relative px-[calc(4.25%_+_1.25rem)] pt-2 pb-16 text-center text-[#0E1C4D] sm:px-[calc(4.25%_+_3rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function Title({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-fraunces text-3xl text-[#F2F6F4] sm:text-4xl">
      {children}
    </h2>
  );
}

export default function PersianTile() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#0E1C4D] pb-24 font-vazir text-[#F2F6F4]">
      <GirihDefs />
      <section className="relative border-b-4 border-[#E2A93B] px-4 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <svg aria-hidden className="absolute inset-0 h-full w-full">
          <rect width="100%" height="100%" fill="url(#persian-girih)" />
        </svg>
        <Mihrab>
          <p className="font-fraunces text-4xl font-semibold text-[#1D3E8F] sm:text-5xl">{brand.name}</p>
          <p className="mt-2 font-fraunces text-xl text-[#16706B] italic sm:text-3xl">{brand.meaning}</p>
          <div aria-hidden className="mx-auto mt-6 flex max-w-[12rem] items-center gap-3 text-[#E2A93B]">
            <span className="h-px flex-1 bg-current" />
            <Ornament className="size-4" />
            <span className="h-px flex-1 bg-current" />
          </div>
          <h1 className="mt-6 font-fraunces text-3xl leading-tight sm:text-4xl">{brand.tagline}</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-[#33406A]">{brand.pitch}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={brand.appHref}
              className={`rounded-md bg-[#1D3E8F] px-6 py-3 font-semibold text-[#F2F6F4] hover:bg-[#16306F] ${lightFocus}`}
            >
              {brand.appCta}
            </Link>
            <a
              href={brand.installHref}
              className={`rounded-md border-2 border-[#1D3E8F] px-6 py-3 font-semibold text-[#1D3E8F] hover:bg-[#1D3E8F]/10 ${lightFocus}`}
            >
              {brand.installCta}
            </a>
          </div>
        </Mihrab>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <section aria-labelledby="persian-how" className="pt-24">
          <Title id="persian-how">How it works</Title>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-[#E2A93B]/50 pt-6">
                <p aria-hidden lang="fa" className="text-5xl leading-none font-bold text-[#E2A93B]">
                  {persianDigits[index]}
                </p>
                <h3 className="mt-4 font-fraunces text-2xl">{step.title}</h3>
                <p className="mt-2 leading-7 text-[#B9C7E6]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="persian-ask" className="pt-24">
          <Title id="persian-ask">Then ask</Title>
          <div className="mt-8 border-t-4 border-[#2FA39C] bg-[#F2F6F4] p-6 text-[#0E1C4D] sm:p-10">
            <p className="font-fraunces text-3xl sm:text-4xl">{`"${answer.question}"`}</p>
            <p className="mt-4 text-lg leading-8 text-[#33406A]">{answer.reply}</p>
            <ol className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              {answer.chain.map((part, index) => (
                <li key={part} className="flex items-center gap-3">
                  {index > 0 ? <Ornament className="size-3 text-[#C08A1E]" /> : null}
                  <span className="border border-[#1D3E8F]/30 px-3 py-1.5">{part}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="persian-local"
          className="grid gap-10 pt-24 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16"
        >
          <div>
            <Title id="persian-local">{localPitch.title}</Title>
            <p className="mt-4 leading-7 text-[#B9C7E6]">{localPitch.body}</p>
          </div>
          <ul className="divide-y divide-[#E2A93B]/30 border-y border-[#E2A93B]/30">
            {models.map((model) => (
              <li key={model.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                <div className="min-w-0">
                  <p className="font-fraunces text-xl">{model.name}</p>
                  <p className="text-sm leading-6 text-[#B9C7E6]">{model.job}</p>
                </div>
                <p className="text-sm text-[#57C4BC]">{model.license}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="install" aria-labelledby="persian-install" className="scroll-mt-10 pt-24">
          <Title id="persian-install">Install</Title>
          <p className="mt-4 leading-7 text-[#B9C7E6]">Four commands. Then open localhost:3100 in your browser.</p>
          <pre className="mt-6 overflow-x-auto border-l-4 border-[#E2A93B] bg-[#0A1540] p-5 font-mono text-[14px] leading-7 text-[#F2F6F4] sm:p-6" dir="ltr">
            <code>
              {install.map((line) => (
                <span key={line} className="block">
                  <span className="text-[#57C4BC] select-none">$ </span>
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </section>

        <footer className="pt-24">
          <TileStrip className="h-12" />
          <div className="flex flex-wrap items-baseline justify-between gap-4 pt-6">
            <p className="font-fraunces text-xl">
              {brand.name}{" "}
              <span lang="fa" className="font-vazir text-[#E2A93B]">
                {brand.persian}
              </span>
            </p>
            <p className="text-sm text-[#B9C7E6]">MIT licensed</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
