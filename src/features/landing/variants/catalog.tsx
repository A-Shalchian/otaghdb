import Link from "next/link";
import type { ReactNode } from "react";
import { answer, brand, install, localPitch, models, sampleItems, steps } from "../content";
import type { SampleItem } from "../content";
import { ObjectArt } from "../objects";
import { TypedFields } from "./catalog-parts";

const ruled = {
  backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 27px, #A9C1DB 27px 28px)",
};
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF5A]";
const caretCss =
  "@keyframes catalog-blink { 50% { opacity: 0; } } .catalog-caret { animation: catalog-blink 1s steps(1) infinite; } @media (prefers-reduced-motion: reduce) { .catalog-caret { animation: none; } }";

function pick(object: SampleItem["object"]) {
  return sampleItems.find((item) => item.object === object) ?? sampleItems[0];
}

const record = pick("passport");
const behind = [pick("hoodie"), pick("backpack")];

function callNumber(id: number) {
  return String(id).padStart(4, "0");
}

function location(item: SampleItem) {
  return [item.container, item.spot, item.room]
    .filter((part): part is string => Boolean(part))
    .join(" / ");
}

function BackCard({ item, className }: { item: SampleItem; className: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-x-0 rounded-[3px] bg-[#ECEEE8] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4 px-5 pt-1.5 text-[#4A5160] sm:px-7">
        <span className="font-typewriter text-[13px]">
          {callNumber(item.id)}&nbsp;&nbsp;{item.name}
        </span>
        <span className="text-[10px]">{item.category}</span>
      </div>
    </div>
  );
}

function IndexCard() {
  const fields = [
    { label: "Name", value: record.name },
    { label: "Location", value: location(record) },
    { label: "Kept because", value: record.kept },
    { label: "Would discard", value: record.discard },
  ];
  return (
    <article
      aria-label={`Catalog card ${callNumber(record.id)}, ${record.name}`}
      className="relative rounded-[3px] bg-[#FAFAF6] text-[#1F2430] shadow-[0_24px_40px_-18px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7">
        <div>
          <p className="text-[11px] text-[#5B6577]">Object no.</p>
          <p className="font-typewriter text-3xl leading-tight sm:text-4xl">{callNumber(record.id)}</p>
          <p className="mt-1 text-[11px] text-[#5B6577]">{record.category}</p>
        </div>
        <div className="-rotate-2 border border-[#A9C1DB] bg-white p-1.5 shadow-[0_2px_4px_rgba(31,36,48,0.15)]">
          <ObjectArt name={record.object} title={record.name} className="size-16 sm:size-20" />
        </div>
      </div>
      <div aria-hidden className="mt-3 h-0.5 bg-[#B5122B]" />
      <div className="px-5 pb-12 sm:px-7" style={ruled}>
        <TypedFields fields={fields} />
      </div>
      <span
        aria-hidden
        className="absolute bottom-3 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-[#1E3A32] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
      />
    </article>
  );
}

function Title({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-typewriter text-3xl sm:text-4xl">
      {children}
    </h2>
  );
}

export default function CatalogCard() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#1E3A32] pb-24 font-plex text-[#E9EEE8]">
      <style>{caretCss}</style>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-8 sm:px-8">
        <p className="rounded-[4px] border-2 border-[#D4AF5A] p-[3px]">
          <span className="block rounded-[2px] bg-[#FAFAF6] px-3 py-0.5 font-typewriter text-lg text-[#1F2430]">
            {brand.name}
          </span>
        </p>
        <p className="text-xs text-[#A8BEB4]">{brand.meaning}</p>
      </header>

      <section className="mx-auto grid max-w-6xl gap-14 px-4 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:pt-20">
        <div>
          <h1 className="font-typewriter text-5xl leading-[1.05] sm:text-6xl">{brand.tagline}</h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#C9D6CF]">{brand.pitch}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={brand.appHref}
              className={`rounded-[3px] bg-[#FAFAF6] px-5 py-3 text-sm font-semibold text-[#1F2430] hover:bg-white ${focusRing}`}
            >
              {brand.appCta}
            </Link>
            <a
              href={brand.installHref}
              className={`rounded-[3px] border border-[#D4AF5A] px-5 py-3 text-sm font-semibold text-[#F0D58F] hover:bg-[#D4AF5A]/10 ${focusRing}`}
            >
              {brand.installCta}
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[34rem] pt-14">
          <BackCard item={behind[0]} className="top-0 bottom-14 rotate-[1.5deg]" />
          <BackCard item={behind[1]} className="top-7 bottom-7 -rotate-1" />
          <IndexCard />
        </div>
      </section>

      <section aria-labelledby="catalog-how" className="mx-auto mt-28 max-w-6xl px-4 sm:px-8">
        <Title id="catalog-how">How it works</Title>
        <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-[#A8BEB4]/40 pt-5">
              <h3 className="font-typewriter text-xl">
                <span className="text-[#D4AF5A]">{index + 1}.</span> {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#C9D6CF]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="catalog-ask"
        className="mx-auto mt-28 grid max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16"
      >
        <div>
          <Title id="catalog-ask">Ask the catalog</Title>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#C9D6CF]">
            Each card records the bag that holds the object, the spot that holds the bag and the room that holds the
            spot. Ask in plain words and OtaghDB reads the chain back to you.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[30rem] rounded-[3px] bg-[#DCE7F1] p-5 text-[#1F2430] shadow-[0_18px_30px_-18px_rgba(0,0,0,0.7)] sm:p-6">
          <p className="flex justify-between gap-4 text-[11px] text-[#4D5B70]">
            <span>Reference request</span>
            <span>Card {callNumber(record.id)}</span>
          </p>
          <dl className="mt-4 space-y-4 border-t border-[#9DB2C9] pt-4">
            <div>
              <dt className="text-[11px] text-[#4D5B70]">Asked</dt>
              <dd className="mt-1 font-typewriter text-2xl">{`"${answer.question}"`}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#4D5B70]">Answer</dt>
              <dd className="mt-1 font-typewriter text-lg leading-7">{answer.reply}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#4D5B70]">Shelf mark</dt>
              <dd className="mt-1 text-sm break-words">{[...answer.chain].reverse().join(" / ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="catalog-local"
        className="mx-auto mt-28 grid max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16"
      >
        <div>
          <Title id="catalog-local">{localPitch.title}</Title>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#C9D6CF]">{localPitch.body}</p>
        </div>
        <dl className="divide-y divide-[#A8BEB4]/30 border-y border-[#A8BEB4]/30">
          {models.map((model) => (
            <div
              key={model.name}
              className="grid gap-1 py-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4"
            >
              <dt className="font-typewriter text-lg">{model.name}</dt>
              <dd className="text-sm leading-6 text-[#C9D6CF]">{model.job}</dd>
              <dd className="text-xs text-[#D4AF5A]">{model.license}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        id="install"
        aria-labelledby="catalog-install"
        className="mx-auto mt-28 max-w-6xl scroll-mt-10 px-4 sm:px-8"
      >
        <Title id="catalog-install">Install</Title>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#C9D6CF]">
          Clone it, pull the vision model and start the server. Then open localhost:3100.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-[3px] border border-[#A8BEB4]/25 bg-[#142B25] p-5 font-plex text-sm leading-7 text-[#E9EEE8] sm:p-6">
          <code>
            {install.map((line) => (
              <span key={line} className="block">
                <span className="text-[#D4AF5A] select-none">$ </span>
                {line}
              </span>
            ))}
          </code>
        </pre>
      </section>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-baseline justify-between gap-4 px-4 sm:px-8">
        <p className="font-typewriter text-lg">{brand.name}</p>
        <p className="text-xs text-[#A8BEB4]">MIT licensed</p>
      </footer>
    </div>
  );
}
