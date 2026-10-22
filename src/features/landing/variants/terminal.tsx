import Link from "next/link";
import type { ReactNode } from "react";
import { answer, brand, install, localPitch, models, sampleItems, stats, steps } from "../content";
import { TerminalSession } from "./terminal-parts";

const css = `
.terminal-glow { text-shadow: 0 0 1px rgba(255, 176, 0, 0.55), 0 0 10px rgba(255, 176, 0, 0.28); }
.terminal-scan {
  background-image: repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.22) 0, rgba(0, 0, 0, 0.22) 1px, transparent 1px, transparent 3px);
}
@keyframes terminal-blink { 50% { opacity: 0; } }
.terminal-cursor { animation: terminal-blink 1.05s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) { .terminal-cursor { animation: none; } }
`;

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd073]";

const passport = sampleItems.find((item) => item.object === "passport") ?? sampleItems[0];

const tree = [...answer.chain].reverse().map((place, depth) => {
  if (depth === 0) return place;
  const suffix = depth === answer.chain.length - 1 ? `  #${passport.id}` : "";
  return `${"    ".repeat(depth - 1)}└── ${place}${suffix}`;
});

function Section({ name, id, children }: { name: string; id?: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="grid scroll-mt-8 gap-4 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10"
    >
      <h2 className="terminal-glow font-vt323 text-[28px] leading-none text-[#ffd073]">{name}</h2>
      <div className="min-w-0 pl-5 md:pl-0">{children}</div>
    </section>
  );
}

function Console() {
  return (
    <div className="relative min-w-0 border border-[#4a3510] bg-[#110b03] shadow-[0_0_80px_rgba(255,176,0,0.07)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#4a3510] px-3 py-1.5 font-vt323 text-lg text-[#c48d14] sm:px-5">
        <span>items.db</span>
        <span>local, offline</span>
      </div>
      <div className="terminal-glow overflow-x-auto px-3 py-5 font-vt323 text-[20px] leading-[1.3] sm:px-5 sm:text-[24px]">
        <TerminalSession />
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 border-t border-[#4a3510] px-3 py-1.5 font-vt323 text-lg text-[#c48d14] sm:px-5">
        <span>{stats.items} items</span>
        <span>{stats.rooms} rooms</span>
        <span>{stats.containers} containers</span>
      </div>
      <div aria-hidden className="terminal-scan pointer-events-none absolute inset-0" />
    </div>
  );
}

export default function TerminalQuery() {
  return (
    <div className="min-h-screen w-full bg-[#1a1206] font-plex text-[15px] text-[#ffb000] selection:bg-[#ffb000] selection:text-[#1a1206]">
      <style>{css}</style>
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-24 sm:px-8">
        <header className="flex items-baseline justify-between gap-4 font-vt323 text-xl text-[#c48d14]">
          <span>OTAGHDB(1)</span>
          <span className="hidden sm:inline">User commands</span>
          <span>OTAGHDB(1)</span>
        </header>

        <section className="grid gap-10 pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pt-20">
          <div>
            <p className="terminal-glow font-vt323 text-7xl leading-none sm:text-8xl">
              {brand.name}
            </p>
            <p className="mt-2 text-sm text-[#c48d14]">{brand.meaning}</p>
            <h1 className="terminal-glow mt-10 font-vt323 text-[44px] leading-[1.05] text-[#ffd073] sm:text-[56px]">
              {brand.tagline}
            </h1>
            <p className="mt-5 max-w-md leading-7">{brand.pitch}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 font-vt323 text-2xl">
              <Link
                href={brand.appHref}
                className={`bg-[#ffb000] px-4 py-1.5 text-[#1a1206] hover:bg-[#ffd073] ${focus}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`underline decoration-[#c48d14] underline-offset-4 hover:text-[#ffd073] ${focus}`}
              >
                {brand.installCta}
              </a>
            </div>
          </div>
          <Console />
        </section>

        <div className="mt-24 space-y-16 lg:mt-32">
          <Section name="DESCRIPTION">
            <p className="max-w-2xl leading-7">
              OtaghDB keeps a list of the things you own and where each one sits. It works in
              three steps.
            </p>
            <ol className="mt-8 space-y-7">
              {steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)]">
                  <span className="font-vt323 text-2xl leading-7 text-[#c48d14]">{index + 1}.</span>
                  <div>
                    <p className="font-vt323 text-2xl leading-7 text-[#ffd073]">{step.title}</p>
                    <p className="mt-1 max-w-xl leading-7">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section name="EXAMPLES">
            <p className="max-w-2xl leading-7">
              Ask in plain words. The answer follows the path you filed the item under.
            </p>
            <div className="mt-6 max-w-2xl border-l-2 border-[#4a3510] pl-4 leading-7 sm:pl-6">
              <p className="whitespace-pre-wrap">
                <span className="select-none text-[#c48d14]">otagh&gt; </span>
                ask &quot;{answer.question}&quot;
              </p>
              <p className="text-[#ffd073]">{answer.reply}</p>
              <div className="mt-5 overflow-x-auto text-[#c48d14]">
                {tree.map((line) => (
                  <p key={line} className="whitespace-pre">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </Section>

          <Section name="MODELS">
            <p className="font-vt323 text-2xl text-[#ffd073]">{localPitch.title}</p>
            <p className="mt-2 max-w-2xl leading-7">{localPitch.body}</p>
            <dl className="mt-8 max-w-3xl space-y-5">
              {models.map((model) => (
                <div
                  key={model.name}
                  className="md:grid md:grid-cols-[9rem_minmax(0,1fr)_auto] md:gap-x-6"
                >
                  <dt className="font-vt323 text-2xl leading-7 text-[#ffd073]">{model.name}</dt>
                  <dd className="leading-7">{model.job}</dd>
                  <dd className="leading-7 text-[#c48d14]">{model.license}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section name="INSTALL" id="install">
            <p className="max-w-2xl leading-7">
              Needs Node.js, pnpm and Ollama. Run these four commands, then open
              localhost:3100 in a browser.
            </p>
            <pre className="mt-6 max-w-2xl overflow-x-auto border border-[#4a3510] bg-[#110b03] p-4 font-plex text-sm leading-7 whitespace-pre-wrap [overflow-wrap:anywhere] sm:p-5">
              {install.map((line) => (
                <span key={line} className="block">
                  <span className="select-none text-[#c48d14]">$ </span>
                  {line}
                </span>
              ))}
            </pre>
          </Section>
        </div>

        <footer className="mt-24 flex items-baseline justify-between gap-4 border-t border-[#4a3510] pt-4 font-vt323 text-xl text-[#c48d14]">
          <span className="text-[#ffb000]">{brand.name}</span>
          <span>MIT licensed</span>
          <span className="hidden sm:inline">OTAGHDB(1)</span>
        </footer>
      </div>
    </div>
  );
}
