import Link from "next/link";
import type { ReactNode } from "react";
import { answer, brand, install, localPitch, models, steps } from "../content";
import { pixelScrollbars } from "../scrollbars";
import { PixelHouse } from "./pixel-parts";

const bobCss =
  "@keyframes pixel-bob { 0% { transform: translateY(0); } 50% { transform: translateY(-1px); } } @media (prefers-reduced-motion: no-preference) { .pixel-bob { animation: pixel-bob 0.9s steps(1, end) infinite; } }";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-[8px] focus-visible:outline-[#EEF0F2]";

function frame(color: string, size = 4) {
  return {
    boxShadow: `0 -${size}px 0 0 ${color}, 0 ${size}px 0 0 ${color}, -${size}px 0 0 0 ${color}, ${size}px 0 0 0 ${color}`,
  };
}

function Title({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-silkscreen text-2xl leading-tight sm:text-3xl">
      {children}
    </h2>
  );
}

function Pointer() {
  return (
    <svg viewBox="0 0 3 5" shapeRendering="crispEdges" aria-hidden className="h-3 w-2 shrink-0">
      <rect x="0" y="0" width="1" height="5" fill="#F0B84C" />
      <rect x="1" y="1" width="1" height="3" fill="#F0B84C" />
      <rect x="2" y="2" width="1" height="1" fill="#F0B84C" />
    </svg>
  );
}

export default function PixelRoom() {
  return (
    <div className="pixel-root min-h-screen w-full overflow-x-clip bg-[#2B2950] pb-24 font-vt323 text-[#EEF0F2]">
      <style>{bobCss}</style>
      <style>{pixelScrollbars}</style>
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-8">
          <p className="font-silkscreen text-xl font-bold">{brand.name}</p>
          <p className="text-xl text-[#A8D8EA]">{brand.meaning}</p>
        </header>

        <section className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14 lg:pt-16">
          <div>
            <h1 className="font-silkscreen text-[28px] leading-[1.15] break-words sm:text-4xl lg:text-[44px]">
              {brand.tagline}
            </h1>
            <p className="mt-6 max-w-md text-2xl leading-7">{brand.pitch}</p>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-6 pl-1">
              <Link
                href={brand.appHref}
                className={`bg-[#F0B84C] px-4 py-2 font-silkscreen text-sm text-[#191628] hover:brightness-110 ${focusRing}`}
                style={frame("#F0B84C")}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`px-4 py-2 font-silkscreen text-sm hover:bg-[#EEF0F2]/10 ${focusRing}`}
                style={frame("#EEF0F2")}
              >
                {brand.installCta}
              </a>
            </div>
          </div>
          <PixelHouse />
        </section>

        <section aria-labelledby="pixel-how" className="mt-28">
          <Title id="pixel-how">How it works</Title>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p
                  aria-hidden
                  className="inline-block bg-[#F0B84C] px-2 font-silkscreen text-lg text-[#191628]"
                  style={frame("#F0B84C", 3)}
                >
                  {index + 1}
                </p>
                <h3 className="mt-5 font-silkscreen text-lg">{step.title}</h3>
                <p className="mt-2 text-xl leading-6">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pixel-ask" className="mt-28">
          <Title id="pixel-ask">Then ask</Title>
          <div className="mx-1 mt-10 max-w-3xl bg-[#191628] p-5 sm:p-7" style={frame("#EEF0F2")}>
            <p className="font-silkscreen text-xs text-[#A8D8EA]">You</p>
            <p className="mt-1 text-3xl leading-8">{`"${answer.question}"`}</p>
            <p className="mt-6 font-silkscreen text-xs text-[#F0B84C]">{brand.name}</p>
            <p className="mt-1 text-3xl leading-8">{answer.reply}</p>
            <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xl text-[#A8D8EA]">
              {answer.chain.map((part, index) => (
                <li key={part} className="flex items-center gap-3">
                  {index > 0 ? <Pointer /> : null}
                  <span>{part}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="pixel-local"
          className="mt-28 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14"
        >
          <div>
            <Title id="pixel-local">{localPitch.title}</Title>
            <p className="mt-4 max-w-md text-2xl leading-7">{localPitch.body}</p>
          </div>
          <ul className="grid gap-6 px-1 sm:grid-cols-2">
            {models.map((model) => (
              <li key={model.name} className="bg-[#191628] p-4" style={frame("#574A82")}>
                <p className="font-silkscreen text-sm text-[#F0B84C]">{model.name}</p>
                <p className="mt-2 text-xl leading-6">{model.job}</p>
                <p className="mt-2 text-lg text-[#A8D8EA]">{model.license}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="install" aria-labelledby="pixel-install" className="mt-28 scroll-mt-10">
          <Title id="pixel-install">Install</Title>
          <p className="mt-4 max-w-xl text-2xl leading-7">
            Four commands in a terminal. Then open localhost:3100.
          </p>
          <pre
            className="mx-1 mt-8 overflow-x-auto bg-[#191628] p-5 font-vt323 text-xl leading-7 sm:p-6"
            style={frame("#3F72B8")}
          >
            <code>
              {install.map((line) => (
                <span key={line} className="block">
                  <span className="text-[#F0B84C] select-none">$ </span>
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </section>

        <footer className="mt-24 flex flex-wrap items-baseline justify-between gap-4 border-t-4 border-[#574A82] pt-6">
          <p className="font-silkscreen text-lg">{brand.name}</p>
          <p className="text-xl text-[#A8D8EA]">MIT licensed</p>
        </footer>
      </div>
    </div>
  );
}
