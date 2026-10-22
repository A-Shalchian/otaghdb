import type { ReactNode } from "react";
import type { SampleItem } from "../content";
import { ObjectArt } from "../objects";

export type TapeColor = "black" | "red" | "blue";

export const tapeColors: TapeColor[] = ["black", "red", "blue"];

export const labelmakerCss = `@layer components{
.labelmaker-board{background-color:#b78b5c;background-image:radial-gradient(circle at 50% 50%,#3a2816 0 3px,rgba(58,40,22,.55) 3.6px,transparent 4.6px),linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,.08));background-size:30px 30px,100% 100%}
.labelmaker-tape{display:inline-block;max-width:100%;font-stretch:75%;font-weight:700;letter-spacing:.14em;text-transform:uppercase;line-height:1.1;color:#f4f4f0;border-radius:3px;padding:.32em .7em .3em;text-shadow:0 -1px 0 rgba(0,0,0,.6),0 1px 0 rgba(255,255,255,.3),0 2px 3px rgba(0,0,0,.35);background-image:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.04) 38%,rgba(0,0,0,0) 62%,rgba(0,0,0,.24));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.35),0 2px 0 rgba(0,0,0,.25),0 4px 8px rgba(0,0,0,.25)}
.labelmaker-black{background-color:#161616}
.labelmaker-red{background-color:#c8102e}
.labelmaker-blue{background-color:#1d4f9c}
.labelmaker-sheet{background-color:#fbfaf6;color:#1c1c1c;box-shadow:0 1px 1px rgba(0,0,0,.2),0 12px 18px -10px rgba(40,20,0,.75)}
.labelmaker-drawer{background:linear-gradient(180deg,rgba(236,242,245,.92),rgba(206,216,222,.85) 55%,rgba(184,196,204,.9));box-shadow:inset 0 0 0 1px rgba(255,255,255,.5),inset 0 -8px 12px rgba(0,0,0,.12),0 2px 0 rgba(0,0,0,.35)}
}`;

export function tapeClass(color: TapeColor = "black") {
  return `labelmaker-tape labelmaker-${color}`;
}

export function Tape({
  children,
  color = "black",
  tilt = 0,
  className = "",
}: {
  children: ReactNode;
  color?: TapeColor;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      className={`${tapeClass(color)} ${className}`}
      style={tilt === 0 ? undefined : { transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}

export function Pin({ color = "#c8102e" }: { color?: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-0 block size-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.75) 0 2px, ${color} 3px)`,
        boxShadow: "0 3px 3px rgba(0,0,0,0.45)",
      }}
    />
  );
}

export function Cabinet({ items }: { items: SampleItem[] }) {
  return (
    <div className="rounded-md bg-[#59616a] p-3 shadow-[0_14px_24px_-12px_rgba(0,0,0,0.7)] sm:p-4">
      <ul aria-label="Sample drawers" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-2">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="labelmaker-drawer flex flex-col items-center rounded-[4px] px-2 pb-3 pt-3"
          >
            <Tape color={tapeColors[i % tapeColors.length]} className="text-[0.8rem] sm:text-sm">
              {item.category}
            </Tape>
            <ObjectArt name={item.object} title={item.name} className="mt-3 size-16 sm:size-20" />
            <span
              aria-hidden="true"
              className="mt-3 block h-2 w-14 rounded-full bg-[#3b4148] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
