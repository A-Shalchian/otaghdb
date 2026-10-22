import Link from "next/link";
import type { ReactNode } from "react";
import { answer, brand, install, localPitch, models, steps } from "../content";
import { ObjectArt } from "../objects";
import { FloorPlan, bedroomItems } from "./blueprint-parts";

const css = `
.blueprint-paper {
  background-color: #1c3f6e;
  background-image:
    linear-gradient(rgba(169, 216, 240, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(169, 216, 240, 0.16) 1px, transparent 1px),
    linear-gradient(rgba(169, 216, 240, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(169, 216, 240, 0.06) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
}
`;

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const passport = bedroomItems.find((item) => item.object === "passport") ?? bedroomItems[0];

const titleCells = [
  ["Drawing", "Bedroom, item locations"],
  ["Scale", "1:50"],
  ["Sheet", "A-101"],
  ["Revision", "0.1.0"],
];

function DrawingTitle({ mark, title, note }: { mark: string; title: string; note: string }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white font-plex text-sm font-semibold">
        {mark}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-architect text-[26px] leading-tight sm:text-3xl">{title}</h2>
        <div className="mt-1 h-[3px] bg-white" />
        <div className="mt-[3px] h-px bg-white/70" />
        <p className="mt-1.5 font-plex text-xs text-[#a9d8f0]">{note}</p>
      </div>
    </div>
  );
}

function DetailBubble({ number }: { number: number }) {
  return (
    <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M2 24H46" stroke="#ffffff" strokeWidth="1" />
      <text x="24" y="18" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600" className="font-plex">
        {number}
      </text>
      <text x="24" y="37" textAnchor="middle" fill="#a9d8f0" fontSize="9" className="font-plex">
        A-101
      </text>
    </svg>
  );
}

function Nest({ labels, children }: { labels: string[]; children: ReactNode }) {
  if (labels.length === 0) return <>{children}</>;
  const [first, ...rest] = labels;
  return (
    <div className="relative mt-3 border border-dashed border-[#a9d8f0] px-3 pt-6 pb-3 sm:px-5 sm:pb-5">
      <span className="absolute -top-3.5 left-3 bg-[#1c3f6e] px-1.5 font-architect text-lg leading-7">
        {first}
      </span>
      <Nest labels={rest}>{children}</Nest>
    </div>
  );
}

function TitleBlock() {
  return (
    <div className="border-t border-white/70 font-plex text-xs lg:border-t-0 lg:border-l">
      <div className="border-b border-white/70 px-4 py-3">
        <p className="font-architect text-3xl leading-none">{brand.name}</p>
        <p className="mt-1.5 text-[#a9d8f0]">{brand.meaning}</p>
      </div>
      <dl className="grid grid-cols-2">
        {titleCells.map(([label, value], index) => (
          <div
            key={label}
            className={`px-4 py-2 ${index % 2 === 0 ? "border-r border-white/70" : ""} ${index < 2 ? "border-b border-white/70" : ""}`}
          >
            <dt className="text-[#a9d8f0]">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Blueprint() {
  const [item, ...places] = answer.chain;
  return (
    <div className="blueprint-paper min-h-screen w-full font-plex text-white selection:bg-white selection:text-[#1c3f6e]">
      <style>{css}</style>
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-8">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/40 pb-4">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-architect text-3xl">{brand.name}</p>
            <p className="text-xs text-[#a9d8f0]">{brand.meaning}</p>
          </div>
          <p className="text-xs text-[#a9d8f0]">Sheet A-101, bedroom</p>
        </header>

        <section className="grid gap-8 pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:pt-14">
          <h1 className="font-architect text-[44px] leading-[1.05] sm:text-6xl lg:text-7xl">
            {brand.tagline}
          </h1>
          <div>
            <p className="text-sm leading-6 text-[#d9ecf7]">{brand.pitch}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <Link
                href={brand.appHref}
                className={`bg-white px-5 py-2.5 font-medium text-[#1c3f6e] hover:bg-[#a9d8f0] ${focus}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`underline decoration-[#a9d8f0] underline-offset-4 hover:text-[#a9d8f0] ${focus}`}
              >
                {brand.installCta}
              </a>
            </div>
          </div>
        </section>

        <div className="mt-10 border-2 border-white p-1.5 sm:p-2">
          <div className="border border-white/70">
            <FloorPlan compact={false} className="hidden h-auto w-full lg:block" />
            <FloorPlan compact className="block h-auto w-full p-3 lg:hidden" />
            <ol className="divide-y divide-white/25 border-t border-white/50 lg:hidden">
              {bedroomItems.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1c3f6e]">
                    {entry.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-architect text-lg leading-6">{entry.name}</p>
                    <p className="text-xs text-[#a9d8f0]">
                      {entry.spot}
                      {entry.container ? `, in ${entry.container}` : ""}
                    </p>
                  </div>
                  <ObjectArt name={entry.object} mode="line" className="size-10 shrink-0 text-[#a9d8f0]" />
                </li>
              ))}
            </ol>
            <div className="grid border-t border-white/70 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="p-4 text-xs leading-5 text-[#a9d8f0]">
                <p className="font-architect text-base text-white">General notes</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                  <li>Items located from photos filed in OtaghDB.</li>
                  <li>Each marker carries the item number.</li>
                  <li>Dimensions in millimetres.</li>
                </ol>
              </div>
              <TitleBlock />
            </div>
          </div>
        </div>

        <section className="mt-24">
          <DrawingTitle mark="A" title="How it works" note="Sequence of work, in order" />
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <DetailBubble number={index + 1} />
                <div className="min-w-0">
                  <h3 className="font-architect text-2xl leading-8">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#d9ecf7]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-24">
          <DrawingTitle mark="B" title="Ask where anything is" note={`Detail of item ${passport.id}`} />
          <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-architect text-4xl leading-tight sm:text-5xl">
                &quot;{answer.question}&quot;
              </p>
              <p className="mt-5 max-w-md text-base leading-7 text-[#d9ecf7]">{answer.reply}</p>
            </div>
            <Nest labels={[...places].reverse()}>
              <div className="flex flex-col items-center py-2">
                <ObjectArt name="passport" mode="line" className="size-24 text-white" title={item} />
                <p className="mt-2 font-architect text-lg">
                  {item} #{passport.id}
                </p>
              </div>
            </Nest>
          </div>
        </section>

        <section className="mt-24">
          <DrawingTitle mark="C" title={localPitch.title} note="Model schedule" />
          <p className="mt-6 max-w-2xl text-sm leading-6 text-[#d9ecf7]">{localPitch.body}</p>
          <table className="mt-6 w-full max-w-3xl border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-white text-xs text-[#a9d8f0]">
                <th className="py-2 pr-4 font-medium">Model</th>
                <th className="py-2 pr-4 font-medium">Job</th>
                <th className="py-2 font-medium">License</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.name} className="border-b border-white/35 align-top">
                  <td className="py-3 pr-4 font-architect text-lg leading-6 whitespace-nowrap">
                    {model.name}
                  </td>
                  <td className="py-3 pr-4 leading-6 text-[#d9ecf7]">{model.job}</td>
                  <td className="py-3 leading-6 whitespace-nowrap">{model.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="install" className="mt-24 scroll-mt-8">
          <DrawingTitle mark="D" title={brand.installCta} note="Site setup: Node.js, pnpm and Ollama" />
          <pre className="mt-8 max-w-2xl overflow-x-auto border-2 border-white bg-[#163459] p-4 text-sm leading-7 whitespace-pre-wrap [overflow-wrap:anywhere] sm:p-5">
            {install.map((line) => (
              <span key={line} className="block">
                <span className="select-none text-[#a9d8f0]">$ </span>
                {line}
              </span>
            ))}
          </pre>
          <p className="mt-4 text-sm text-[#d9ecf7]">Then open localhost:3100 in a browser.</p>
        </section>

        <footer className="mt-24 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-white/40 pt-4 text-xs text-[#a9d8f0]">
          <span className="font-architect text-xl text-white">{brand.name}</span>
          <span>MIT licensed</span>
          <span>Sheet A-101</span>
        </footer>
      </div>
    </div>
  );
}
