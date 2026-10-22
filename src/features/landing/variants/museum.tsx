import Link from "next/link";
import { answer, brand, install, localPitch, models, sampleItems, steps } from "../content";
import { Frame, WallLabel } from "./museum-parts";

const css = `
.museum-hang { box-shadow: 0 22px 34px -10px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.28); }
.museum-light {
  background: radial-gradient(ellipse 46% 58% at 38% 46%, rgba(255, 239, 205, 0.24), rgba(255, 239, 205, 0.07) 55%, transparent 78%);
}
@keyframes museum-lights-on { from { opacity: 0; } to { opacity: 1; } }
.museum-light { animation: museum-lights-on 1.8s ease-out 0.2s both; }
@media (prefers-reduced-motion: reduce) { .museum-light { animation: none; } }
`;

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ece8dc]";

const byObject = (key: string) => sampleItems.find((item) => item.object === key) ?? sampleItems[0];

const featured = byObject("passport");

const hung = [
  { item: byObject("hoodie"), size: "w-52 sm:w-56" },
  { item: byObject("keys"), size: "w-36 sm:w-40" },
  { item: byObject("wallet"), size: "w-40 sm:w-44" },
  { item: byObject("mug"), size: "w-32 sm:w-36" },
  { item: byObject("plant"), size: "w-44 sm:w-48" },
  { item: byObject("headphones"), size: "w-40 sm:w-44" },
];

const visit = [
  ["Admission", "Free and open source"],
  ["Hours", "Whenever your laptop is on"],
  ["Requirements", "Node.js, pnpm and Ollama"],
  ["Address", "localhost:3100"],
];

export default function MuseumLabels() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#2b4234] font-sans text-[#ece8dc] selection:bg-[#ece8dc] selection:text-[#1f3027]">
      <style>{css}</style>
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-8">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-instrument text-3xl">{brand.name}</p>
            <p className="text-xs text-[#b8c4b4]">{brand.meaning}</p>
          </div>
          <p className="text-xs text-[#b8c4b4]">Gallery 1, the bedroom</p>
        </header>

        <section className="grid gap-6 pt-14 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-16">
          <div className="lg:col-span-5">
            <h1 className="font-instrument text-[56px] leading-[0.95] sm:text-7xl lg:text-[88px]">
              {brand.tagline}
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#d5d9cc]">{brand.pitch}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
              <Link
                href={brand.appHref}
                className={`bg-[#ece8dc] px-5 py-3 font-medium text-[#1f3027] hover:bg-white ${focus}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`underline decoration-[#8fa08f] underline-offset-4 hover:decoration-[#ece8dc] ${focus}`}
              >
                {brand.installCta}
              </a>
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <div aria-hidden className="museum-light pointer-events-none absolute -inset-y-10 inset-x-0" />
            <div className="relative flex flex-col items-center gap-10 py-12 sm:flex-row sm:items-end sm:justify-center sm:gap-10 lg:py-20">
              <Frame item={featured} className="w-56 sm:w-64" />
              <WallLabel item={featured} large />
            </div>
          </div>
        </section>

        <section className="mt-24 border-t border-[#ece8dc]/20 pt-14">
          <h2 className="font-instrument text-4xl sm:text-5xl">How it works</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center bg-[#ece8dc] text-sm font-semibold text-[#1f3027] tabular-nums">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-instrument text-[28px] leading-8">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-[#d5d9cc]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-28">
          <h2 className="font-instrument text-4xl sm:text-5xl">From the permanent collection</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#d5d9cc]">
            Every object you photograph gets a label like these, with the room, the spot and the
            reason you kept it.
          </p>
          <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {hung.map(({ item, size }) => (
              <li key={item.id} className="flex flex-col items-center sm:items-start">
                <div className="flex h-72 items-center">
                  <Frame item={item} className={size} />
                </div>
                <div className="mt-8 flex w-full justify-center sm:justify-start">
                  <WallLabel item={item} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-32 text-center">
          <h2 className="sr-only">Ask where anything is</h2>
          <p className="font-instrument text-5xl leading-tight italic sm:text-6xl">
            &quot;{answer.question.charAt(0).toUpperCase() + answer.question.slice(1)}&quot;
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#d5d9cc]">{answer.reply}</p>
          <ol className="mx-auto mt-10 flex max-w-max flex-wrap justify-center bg-[#1f3027] text-sm">
            {[...answer.chain].reverse().map((place, index) => (
              <li
                key={place}
                className={`px-4 py-3 ${index > 0 ? "border-l border-[#ece8dc]/25" : ""} ${
                  index === answer.chain.length - 1 ? "font-semibold text-white" : "text-[#d5d9cc]"
                }`}
              >
                {place.charAt(0).toUpperCase() + place.slice(1)}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-32 grid gap-10 border-t border-[#ece8dc]/20 pt-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-instrument text-4xl sm:text-5xl">{localPitch.title}</h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#d5d9cc]">{localPitch.body}</p>
          </div>
          <div className="lg:col-span-7">
            <p className="text-sm text-[#b8c4b4]">With thanks to the open models that do the work</p>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {models.map((model) => (
                <div key={model.name} className="border-t border-[#ece8dc]/25 py-5">
                  <dt className="font-instrument text-[28px] leading-8">{model.name}</dt>
                  <dd className="mt-1 text-[15px] leading-6 text-[#d5d9cc]">{model.job}</dd>
                  <dd className="mt-2 text-xs text-[#b8c4b4]">{model.license}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="install" className="mt-28 grid scroll-mt-8 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-instrument text-4xl sm:text-5xl">Plan your visit</h2>
            <dl className="mt-6 space-y-3 text-[15px]">
              {visit.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3">
                  <dt className="text-[#b8c4b4]">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <p className="text-sm text-[#b8c4b4]">{brand.installCta}</p>
            <pre className="mt-4 overflow-x-auto bg-[#1f3027] p-5 font-sans text-[15px] leading-8 whitespace-pre-wrap [overflow-wrap:anywhere] sm:p-6">
              {install.map((line) => (
                <span key={line} className="block">
                  <span className="text-[#8fa08f] select-none">$ </span>
                  {line}
                </span>
              ))}
            </pre>
          </div>
        </section>

        <footer className="mt-28 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-[#ece8dc]/20 pt-5 text-xs text-[#b8c4b4]">
          <span className="font-instrument text-2xl text-[#ece8dc]">{brand.name}</span>
          <span>MIT licensed</span>
        </footer>
      </div>
    </div>
  );
}
