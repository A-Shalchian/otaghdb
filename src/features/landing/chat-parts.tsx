import type { ReactNode } from "react";
import { sampleItems, type SampleItem } from "./content";
import { ObjectArt } from "./objects";

export const chatFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d4f8f]";

export const chatCss = `
@keyframes chat-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes chat-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: no-preference) {
  .chat-caret { animation: chat-blink 1.05s step-end infinite; }
  .chat-rise { animation: chat-rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
  @supports (animation-timeline: view()) {
    .chat-scroll { animation: chat-rise linear both; animation-timeline: view(); animation-range: entry 0% entry 45%; }
  }
}
`;

export function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
      <path d="M10 16V4M5 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function Asked({ text, id }: { text: string; id?: string }) {
  return (
    <div id={id} className="chat-scroll flex scroll-mt-8 justify-end">
      <h2 className="max-w-[88%] rounded-[22px] rounded-br-[6px] bg-[#d3dae5] px-5 py-3 text-lg font-medium leading-snug sm:text-xl">
        {text}
      </h2>
    </div>
  );
}

export function Replied({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={delay === undefined ? "chat-scroll" : "chat-rise"}
      style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}
    >
      <p className="mb-3 flex items-center gap-2 text-sm text-[#4f5b69]">
        <span aria-hidden="true" className="size-2 rounded-full bg-[#3d4f8f]" />
        OtaghDB
      </p>
      <div className={className}>{children}</div>
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
    <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
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
