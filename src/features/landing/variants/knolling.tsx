import Link from "next/link";
import type { ReactNode } from "react";
import { answer, brand, install, localPitch, models, sampleItems, stats, steps } from "../content";
import { ObjectArt } from "../objects";
import { knollingScrollbars } from "../scrollbars";

const matStyle = {
  backgroundColor: "#D3D8DE",
  backgroundImage: [
    "linear-gradient(to right, rgba(31,75,176,0.2) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgba(31,75,176,0.2) 1px, transparent 1px)",
    "linear-gradient(to right, rgba(31,75,176,0.08) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgba(31,75,176,0.08) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
};

const rulerStyle = {
  backgroundImage: "repeating-linear-gradient(to right, rgba(31,75,176,0.55) 0 1px, transparent 1px 24px)",
  backgroundSize: "100% 7px",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left bottom",
};

const wide = { fontStretch: "125%" };
const narrow = { fontStretch: "72%" };
const shadow = { filter: "drop-shadow(0 5px 4px rgba(20,32,46,0.28))" };
const joins = ["in", "on", "in"];
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14202E]";
const knolled = [...sampleItems].sort((a, b) => a.id - b.id);

function recordId(id: number) {
  return `#${String(id).padStart(3, "0")}`;
}

function Ruler() {
  return (
    <div
      aria-hidden
      className="flex h-8 overflow-hidden border-b border-[#1F4BB0]/40 font-plex text-[10px] text-[#1F4BB0]"
      style={rulerStyle}
    >
      {Array.from({ length: 24 }, (_, index) => (
        <span key={index} className="h-full w-[120px] shrink-0 border-l border-[#1F4BB0]/55 pt-1 pl-1">
          {index}
        </span>
      ))}
    </div>
  );
}

function Ticks() {
  const tick = "absolute size-2.5 border-[#1F4BB0]/55";
  return (
    <>
      <span className={`${tick} top-0 left-0 border-t border-l`} />
      <span className={`${tick} top-0 right-0 border-t border-r`} />
      <span className={`${tick} bottom-0 left-0 border-b border-l`} />
      <span className={`${tick} right-0 bottom-0 border-r border-b`} />
    </>
  );
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-4xl leading-none font-extrabold sm:text-5xl" style={narrow}>
      {children}
    </h2>
  );
}

function KnolledGrid() {
  return (
    <figure>
      <ul className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-5">
        {knolled.map((item) => (
          <li key={item.id} className="min-w-0">
            <div aria-hidden className="relative aspect-square">
              <Ticks />
              <div className="absolute inset-[12%]" style={shadow}>
                <ObjectArt name={item.object} className="size-full" />
              </div>
            </div>
            <p className="mt-2 w-fit max-w-full bg-[#F7F8FA] px-1.5 py-1 font-plex text-[10px] leading-snug shadow-[0_1px_0_rgba(20,32,46,0.2)] sm:text-[11px]">
              <span className="font-semibold text-[#1F4BB0]">{recordId(item.id)}</span> {item.name}
            </p>
          </li>
        ))}
      </ul>
      <figcaption className="mt-6 font-plex text-xs text-[#4A5563]">
        {knolled.length} of {stats.items} records, sorted by id and laid out at right angles.
      </figcaption>
    </figure>
  );
}

export default function Knolling() {
  return (
    <div
      className="knolling-root min-h-screen w-full overflow-x-clip pb-24 font-archivo text-[#14202E]"
      style={matStyle}
    >
      <style>{knollingScrollbars}</style>
      <Ruler />
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-8">
          <p className="text-xl font-bold" style={wide}>
            {brand.name}
          </p>
          <p className="font-plex text-xs text-[#4A5563]">{brand.meaning}</p>
        </header>

        <section className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:pt-16">
          <div>
            <h1
              className="text-[3.4rem] leading-[0.92] font-extrabold sm:text-7xl lg:text-[5.25rem]"
              style={narrow}
            >
              {brand.tagline}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#2B3746]">{brand.pitch}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={brand.appHref}
                className={`bg-[#1F4BB0] px-5 py-3 font-semibold text-white hover:bg-[#183D93] ${focusRing}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`border border-[#14202E] px-5 py-3 font-semibold hover:bg-[#14202E] hover:text-[#D3D8DE] ${focusRing}`}
              >
                {brand.installCta}
              </a>
            </div>
          </div>
          <KnolledGrid />
        </section>

        <section aria-labelledby="knolling-how" className="mt-28">
          <SectionTitle id="knolling-how">How it works</SectionTitle>
          <ol className="mt-8 grid border-t-2 border-[#14202E] md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-b border-[#14202E]/25 py-6 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
              >
                <p className="font-plex text-sm font-semibold text-[#1F4BB0]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-[#2B3746]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="knolling-ask"
          className="mt-28 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
        >
          <div>
            <SectionTitle id="knolling-ask">Then ask</SectionTitle>
            <p className="mt-4 max-w-sm leading-relaxed text-[#2B3746]">
              Every record knows the bag it sits in, the spot that holds the bag and the room that holds the spot.
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-plex text-xs text-[#4A5563]">You ask</p>
            <p className="mt-1 text-3xl leading-tight font-bold sm:text-4xl" style={narrow}>
              {`"${answer.question}"`}
            </p>
            <p className="mt-8 font-plex text-xs text-[#4A5563]">OtaghDB follows the records</p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-3">
              {answer.chain.map((part, index) => (
                <li key={part} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span className="font-plex text-xs text-[#4A5563]">{joins[index - 1]}</span>
                  ) : null}
                  <span
                    className={`px-2.5 py-1.5 font-plex text-sm shadow-[0_1px_0_rgba(20,32,46,0.2)] ${
                      index === 0 ? "bg-[#1F4BB0] text-white" : "bg-[#F7F8FA]"
                    }`}
                  >
                    {part}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xl leading-snug font-semibold sm:text-2xl">{answer.reply}</p>
          </div>
        </section>

        <section
          aria-labelledby="knolling-local"
          className="mt-28 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
        >
          <div>
            <SectionTitle id="knolling-local">{localPitch.title}</SectionTitle>
            <p className="mt-4 max-w-sm leading-relaxed text-[#2B3746]">{localPitch.body}</p>
          </div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[#14202E] font-plex text-xs text-[#4A5563]">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Model
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Job
                </th>
                <th scope="col" className="py-2 font-medium">
                  License
                </th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.name} className="border-b border-[#14202E]/25 align-top">
                  <th scope="row" className="py-3 pr-4 font-bold whitespace-nowrap">
                    {model.name}
                  </th>
                  <td className="py-3 pr-4 leading-snug text-[#2B3746]">{model.job}</td>
                  <td className="py-3 font-plex text-xs whitespace-nowrap text-[#1F4BB0]">{model.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="install" aria-labelledby="knolling-install" className="mt-28 scroll-mt-10">
          <SectionTitle id="knolling-install">Install</SectionTitle>
          <p className="mt-4 max-w-xl leading-relaxed text-[#2B3746]">
            Four commands in a terminal. Then open localhost:3100 in your browser.
          </p>
          <pre className="mt-6 overflow-x-auto bg-[#142F73] p-5 font-plex text-sm leading-7 text-[#EEF2FA] sm:p-6">
            <code>
              {install.map((line) => (
                <span key={line} className="block">
                  <span className="text-[#8FA8E6] select-none">$ </span>
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </section>

        <footer className="mt-24 flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-[#14202E] pt-6">
          <p className="font-bold" style={wide}>
            {brand.name}
          </p>
          <p className="font-plex text-xs text-[#4A5563]">MIT licensed</p>
        </footer>
      </div>
    </div>
  );
}
