import type { ReactNode } from "react";
import { answer, sampleItems, stats, type SampleItem } from "../content";
import { ObjectArt } from "../objects";

export const chatFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d4f8f]";

export const chatCss = `
@keyframes chat-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes chat-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes chat-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: no-preference) {
  .chat-type { animation: chat-type 1.1s steps(22, end) 0.3s both; }
  .chat-caret { animation: chat-blink 1.05s step-end 1.4s infinite; }
  .chat-rise { animation: chat-rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
  @supports (animation-timeline: view()) {
    .chat-scroll { animation: chat-rise linear both; animation-timeline: view(); animation-range: entry 0% entry 45%; }
  }
}
`;

export function Asked({ text, id }: { text: string; id?: string }) {
  return (
    <div id={id} className="chat-scroll flex scroll-mt-8 justify-end">
      <h2 className="max-w-[88%] rounded-[22px] rounded-br-[6px] bg-[#d3dae5] px-5 py-3 text-lg font-medium leading-snug sm:text-xl">
        {text}
      </h2>
    </div>
  );
}

export function Replied({ children, delay }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className={delay === undefined ? "chat-scroll" : "chat-rise"}
      style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}
    >
      <p className="mb-3 flex items-center gap-2 text-sm text-[#4f5b69]">
        <span aria-hidden="true" className="size-2 rounded-full bg-[#3d4f8f]" />
        OtaghDB
      </p>
      {children}
    </div>
  );
}

const passport = sampleItems.find((item) => item.name === answer.chain[0]) ?? sampleItems[0];
const kinds = ["room", "spot", "container", "thing"];
const path = [...answer.chain].reverse().map((value, index) => ({ value, kind: kinds[index] }));

export function FirstAnswer() {
  return (
    <div className="mt-8">
      <p
        className="chat-rise flex items-center gap-2 text-sm text-[#4f5b69]"
        style={{ animationDelay: "1.5s" }}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
          <path d="m3 8.5 3 3 7-7" fill="none" stroke="#3d4f8f" strokeWidth="2" />
        </svg>
        Looked through {stats.items} things in {stats.rooms} rooms
      </p>
      <p
        className="chat-rise mt-3 max-w-[24ch] text-[1.7rem] font-semibold leading-tight tracking-tight sm:text-4xl"
        style={{ animationDelay: "1.8s" }}
      >
        {answer.reply}
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr] md:items-start">
        <div
          className="chat-rise rounded-[18px] border border-[#c4ceda] bg-[#f6f8fa] p-4"
          style={{ animationDelay: "2.1s" }}
        >
          <div className="grid aspect-square place-items-center rounded-[12px] bg-[#e1e7ef]">
            <ObjectArt name={passport.object} className="size-3/4" />
          </div>
          <p className="mt-3 text-lg font-semibold">{passport.name}</p>
          <p className="text-sm text-[#4f5b69]">
            {passport.category}, kept for {passport.kept}
          </p>
        </div>
        <ol aria-label="Where it is" className="grid md:mt-6 md:grid-cols-4">
          {path.map((node, index) => (
            <li
              key={node.value}
              className="chat-rise relative border-l-2 border-[#9fb0d6] pb-6 pl-6 last:border-transparent last:pb-0 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pr-4 md:pt-6"
              style={{ animationDelay: `${2.3 + index * 0.15}s` }}
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[8px] top-0 size-3.5 rounded-full border-2 border-[#3d4f8f] md:-top-[8px] md:left-0 ${
                  index === path.length - 1 ? "bg-[#3d4f8f]" : "bg-[#e8ecf1]"
                }`}
              />
              <span className="block text-sm text-[#4f5b69]">{node.kind}</span>
              <span className="mt-0.5 flex items-center gap-2 text-lg font-semibold leading-tight">
                {node.value === "black backpack" ? (
                  <span aria-hidden="true">
                    <ObjectArt name="backpack" className="size-7" />
                  </span>
                ) : null}
                {node.value}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const campingIds = [17, 8, 77, 23, 31, 61];
const camping = campingIds
  .map((id) => sampleItems.find((item) => item.id === id))
  .filter((item): item is SampleItem => item !== undefined);
const campingRooms = Array.from(new Set(camping.map((item) => item.room)));

export function PackingList() {
  return (
    <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
      {campingRooms.map((room) => (
        <div key={room} className="border-t border-[#c4ceda] pt-3">
          <h3 className="text-sm text-[#4f5b69]">{room}</h3>
          <ul className="mt-2 space-y-2">
            {camping
              .filter((item) => item.room === room)
              .map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-[#3d4f8f]">
                    <ObjectArt name={item.object} mode="line" className="size-8" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-tight">{item.name}</span>
                    <span className="block text-sm text-[#4f5b69]">{item.spot}</span>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const moving = sampleItems.filter((item) => item.container === "black backpack");

export function MovePreview() {
  return (
    <div className="rounded-[18px] border border-[#c4ceda] bg-[#f6f8fa]">
      <p className="border-b border-[#d5dce6] px-5 py-3 text-sm text-[#4f5b69]">
        Preview: {moving.length} things move to the closet shelf
      </p>
      <ul>
        {moving.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#d5dce6] px-5 py-4 last:border-b-0"
          >
            <span aria-hidden="true">
              <ObjectArt name={item.object} className="size-10" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{item.name}</span>
              <span className="block text-sm text-[#4f5b69]">
                <span className="line-through decoration-[#8a96a6]">
                  {item.spot}, in the {item.container}
                </span>{" "}
                <span className="text-[#18212c]">now on the closet shelf</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d5dce6] px-5 py-4">
        <p className="text-sm text-[#4f5b69]">Nothing changes until you apply.</p>
        <button
          type="button"
          className={`rounded-full bg-[#3d4f8f] px-6 py-2.5 font-semibold text-white hover:bg-[#324279] ${chatFocus}`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
