import type { CSSProperties } from "react";
import Link from "next/link";
import { answer, brand, install, localPitch, models, sampleItems, steps } from "../content";
import { ObjectArt } from "../objects";

const grid =
  "mx-auto grid w-full max-w-[1440px] grid-cols-4 gap-x-4 px-4 sm:px-8 md:grid-cols-12 md:gap-x-6 lg:px-12";
const focusRing =
  "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#e3001b]";
const h2Class = "text-5xl font-extrabold leading-[0.88] tracking-[-0.01em] md:text-6xl";
const condensed: CSSProperties = { fontStretch: "62%" };
const wide: CSSProperties = { fontStretch: "125%" };
const specimenIds = [42, 17, 23, 31, 61, 90];
const specimens = sampleItems.filter((item) => specimenIds.includes(item.id));
const stairs = ["", "ml-[10%]", "ml-[20%]", "ml-[30%]"];
const joins = ["", "in", "on", "in"];

export default function SwissPoster() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#f7f7f5] pb-24 font-archivo text-[#111111]">
      <header className={`${grid} items-end pt-5`}>
        <p className="col-span-2 text-lg font-bold leading-none md:col-span-3 md:text-xl" style={wide}>
          OtaghDB
        </p>
        <p className="col-span-2 text-xs leading-snug md:col-span-3 md:text-sm">
          {brand.meaning} <span lang="fa">{brand.persian}</span>
        </p>
        <div className="col-span-4 mt-4 h-[3px] bg-[#111111] md:col-span-12" />
      </header>

      <main>
        <section className={`${grid} pt-8 md:pt-14`}>
          <h1
            className="col-span-4 text-[clamp(3.5rem,17vw,15rem)] font-extrabold leading-[0.82] tracking-[-0.02em] md:col-span-12"
            style={condensed}
          >
            <span className="block">Your room,</span>
            <span className="block">as a</span>
            <span className="block">database.</span>
          </h1>
        </section>

        <section className={`${grid} mt-12 md:mt-20`}>
          <div className="col-span-4 md:col-span-7 md:col-start-6 md:row-start-1 lg:col-span-5">
            <p className="text-xl font-medium leading-snug lg:text-2xl">{brand.pitch}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={brand.appHref}
                className={`bg-[#e3001b] px-6 py-4 text-lg font-bold text-white hover:bg-[#111111] ${focusRing}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`text-lg font-bold underline decoration-2 underline-offset-[5px] hover:text-[#e3001b] ${focusRing}`}
              >
                {brand.installCta}
              </a>
            </div>
          </div>
          <ul
            aria-label="Sample items"
            className="col-span-4 mt-14 grid grid-cols-3 gap-x-4 md:col-span-4 md:col-start-1 md:row-start-1 md:mt-0 md:grid-cols-2 md:gap-x-6"
          >
            {specimens.map((item) => (
              <li key={item.id} className="border-t-2 border-[#111111] pb-6 pt-2">
                <p className="font-mono text-xs tabular-nums">{String(item.id).padStart(3, "0")}</p>
                <span aria-hidden="true" className="mt-3 block">
                  <ObjectArt
                    name={item.object}
                    mode="line"
                    className={`size-14 md:size-16 ${item.id === 42 ? "text-[#e3001b]" : "text-[#111111]"}`}
                  />
                </span>
                <p className="mt-3 text-sm font-semibold leading-tight">{item.name}</p>
                <p className="font-mono text-xs text-[#555555]">{item.room}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="swiss-how" className={`${grid} mt-24 md:mt-36`}>
          <h2 id="swiss-how" className={`col-span-4 md:col-span-3 ${h2Class}`} style={condensed}>
            How it works
          </h2>
          <ol className="col-span-4 mt-10 grid grid-cols-1 gap-y-12 md:col-span-9 md:mt-0 lg:grid-cols-3 lg:gap-x-6">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t-[3px] border-[#111111] pt-3">
                <span
                  className="block text-[6rem] font-extrabold leading-[0.8] text-[#e3001b] md:text-[9rem]"
                  style={condensed}
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[#333333]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="swiss-ask" className={`${grid} mt-24 md:mt-36`}>
          <h2 id="swiss-ask" className={`col-span-4 md:col-span-3 ${h2Class}`} style={condensed}>
            Then ask
          </h2>
          <div className="col-span-4 mt-10 bg-[#e3001b] px-5 pb-8 pt-7 text-white md:col-span-9 md:mt-0 md:px-10 md:pb-12 md:pt-10">
            <p
              className="text-[clamp(2rem,5.2vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.01em]"
              style={wide}
            >
              {answer.question}
            </p>
            <ol aria-label="Where it is" className="mt-10 md:mt-14">
              {answer.chain.map((place, i) => (
                <li
                  key={place}
                  className={`flex items-baseline gap-3 border-t border-white/60 py-2.5 text-xl font-bold md:text-3xl ${stairs[i]}`}
                >
                  <span className="w-6 shrink-0 font-mono text-xs font-normal md:text-sm">{joins[i]}</span>
                  {place}
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-xl text-base md:text-lg">{answer.reply}</p>
          </div>
        </section>

        <section aria-labelledby="swiss-local" className={`${grid} mt-24 md:mt-36`}>
          <div className="col-span-4 md:col-span-4">
            <h2 id="swiss-local" className={h2Class} style={condensed}>
              {localPitch.title}
            </h2>
            <p className="mt-6 text-lg leading-relaxed">{localPitch.body}</p>
          </div>
          <ul className="col-span-4 mt-12 border-b-2 border-[#111111] md:col-span-7 md:col-start-6 md:mt-0">
            {models.map((model) => (
              <li
                key={model.name}
                className="grid grid-cols-[1fr_auto] gap-x-4 border-t-2 border-[#111111] py-4 lg:grid-cols-7 lg:gap-x-6 lg:py-5"
              >
                <h3 className="text-2xl font-bold leading-tight lg:col-span-2">{model.name}</h3>
                <p className="self-center font-mono text-sm lg:order-last lg:text-right">{model.license}</p>
                <p className="col-span-2 mt-1 text-base leading-snug lg:col-span-4 lg:mt-0 lg:self-center">
                  {model.job}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="install" aria-labelledby="swiss-install" className={`${grid} mt-24 md:mt-36`}>
          <h2 id="swiss-install" className={`col-span-4 md:col-span-4 ${h2Class}`} style={condensed}>
            {brand.installCta}
          </h2>
          <div className="col-span-4 mt-10 min-w-0 md:col-span-7 md:col-start-6 md:mt-0">
            <pre
              tabIndex={0}
              aria-label="Install commands"
              className={`overflow-x-auto bg-[#111111] px-5 py-6 font-mono text-sm leading-7 text-[#f7f7f5] md:px-8 md:py-8 md:text-base ${focusRing}`}
            >
              <code>
                {install.map((line, i) => (
                  <span key={line} className="block">
                    <span aria-hidden="true" className="mr-4 select-none text-[#8c8c8c]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {line}
                  </span>
                ))}
              </code>
            </pre>
            <p className="mt-4 font-mono text-xs">Then open http://localhost:3100</p>
          </div>
        </section>
      </main>

      <footer className={`${grid} mt-24 md:mt-36`}>
        <div className="col-span-4 h-[3px] bg-[#111111] md:col-span-12" />
        <p className="col-span-2 pt-4 text-lg font-bold md:col-span-3" style={wide}>
          OtaghDB
        </p>
        <p className="col-span-2 pt-4 text-right text-sm md:col-span-3 md:col-start-10">MIT licensed</p>
      </footer>
    </div>
  );
}
