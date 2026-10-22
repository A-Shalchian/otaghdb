import Link from "next/link";
import { answer, brand, install, localPitch, models, sampleItems, steps } from "../content";
import { Cabinet, Pin, Tape, labelmakerCss, tapeClass, tapeColors } from "./labelmaker-parts";

const focusRing =
  "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#111111]";
const drawerIds = [42, 17, 31, 54, 61, 5];
const drawers = sampleItems.filter((item) => drawerIds.includes(item.id));
const joins = ["", "in", "on", "in"];
const sheetTilts = [-0.8, 0.6, -0.4];
const pins = ["#c8102e", "#1d4f9c", "#161616"];
const h2Class = "text-xl sm:text-3xl";

export default function LabelMaker() {
  return (
    <div className="labelmaker-board min-h-screen w-full overflow-x-clip bg-[#b78b5c] pb-24 font-archivo text-[#1c1c1c]">
      <style dangerouslySetInnerHTML={{ __html: labelmakerCss }} />

      <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 pt-6 sm:px-8 sm:pt-8">
        <Tape tilt={-1.5} className="text-xl normal-case tracking-[0.1em] sm:text-2xl">
          OtaghDB
        </Tape>
        <span className="bg-[#fbfaf6] px-2 py-1 text-sm shadow-[0_2px_3px_rgba(0,0,0,0.3)]">
          {brand.meaning} <span lang="fa">{brand.persian}</span>
        </span>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-y-14 px-4 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-7">
            <h1 className="flex flex-col items-start gap-4 text-[clamp(2.1rem,8.5vw,3.75rem)] sm:gap-5 xl:text-[4.25rem]">
              <Tape tilt={-2}>Your room,</Tape>
              <Tape color="red" tilt={1.5} className="ml-[10%]">
                as a
              </Tape>
              <Tape color="blue" tilt={-1} className="ml-[4%]">
                database.
              </Tape>
            </h1>
            <div className="labelmaker-sheet relative mt-12 max-w-xl px-5 pb-6 pt-8 sm:px-7">
              <Pin />
              <p className="text-lg leading-relaxed">{brand.pitch}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={brand.appHref}
                  className={`${tapeClass("red")} text-lg motion-safe:transition-transform hover:-translate-y-0.5 sm:text-xl ${focusRing}`}
                >
                  {brand.appCta}
                </Link>
                <a
                  href={brand.installHref}
                  className={`font-semibold text-[#1d4f9c] underline decoration-2 underline-offset-4 hover:text-[#161616] ${focusRing}`}
                >
                  {brand.installCta}
                </a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <Cabinet items={drawers} />
          </div>
        </section>

        <section aria-labelledby="labelmaker-how" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <h2 id="labelmaker-how" className={h2Class}>
            <Tape tilt={-1}>How it works</Tape>
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="labelmaker-sheet relative px-5 pb-6 pt-8"
                style={{ transform: `rotate(${sheetTilts[i]}deg)` }}
              >
                <Pin color={pins[i]} />
                <h3 className="text-base sm:text-lg">
                  <Tape color={tapeColors[i]}>{`${i + 1} ${step.title}`}</Tape>
                </h3>
                <p className="mt-4 text-base leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="labelmaker-ask" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <h2 id="labelmaker-ask" className={h2Class}>
            <Tape color="red" tilt={1}>
              Then ask
            </Tape>
          </h2>
          <div className="labelmaker-sheet relative mt-10 px-5 pb-8 pt-9 sm:px-8 lg:max-w-4xl">
            <Pin color="#1d4f9c" />
            <p className="font-plex text-lg sm:text-2xl">
              <span aria-hidden="true" className="text-[#c8102e]">
                {"> "}
              </span>
              {answer.question}
            </p>
            <ol aria-label="Where it is" className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-4 text-sm sm:text-lg">
              {answer.chain.map((place, i) => (
                <li key={place} className="flex items-center gap-3">
                  {joins[i] ? <span className="text-base text-[#4a4a4a]">{joins[i]}</span> : null}
                  <Tape color={tapeColors[i % tapeColors.length]}>{place}</Tape>
                </li>
              ))}
            </ol>
            <p className="mt-7 text-base leading-relaxed sm:text-lg">{answer.reply}</p>
          </div>
        </section>

        <section aria-labelledby="labelmaker-local" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <h2 id="labelmaker-local" className={h2Class}>
            <Tape color="blue" tilt={-1.5}>
              {localPitch.title}
            </Tape>
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-x-6">
            <div className="labelmaker-sheet relative px-5 pb-6 pt-8 lg:col-span-5 lg:self-start">
              <Pin />
              <p className="text-lg leading-relaxed">{localPitch.body}</p>
            </div>
            <div className="labelmaker-sheet relative px-5 pb-2 pt-6 sm:px-7 lg:col-span-7">
              <Pin color="#161616" />
              <ul className="divide-y divide-[#dcd7cc]">
                {models.map((model, i) => (
                  <li key={model.name} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-5">
                    <h3 className="shrink-0 text-sm sm:w-32">
                      <Tape color={tapeColors[(i + 2) % tapeColors.length]}>{model.name}</Tape>
                    </h3>
                    <p className="flex-1 text-base leading-snug">{model.job}</p>
                    <p className="font-plex text-sm text-[#4a4a4a]">{model.license}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="install" aria-labelledby="labelmaker-install" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <h2 id="labelmaker-install" className={h2Class}>
            <Tape tilt={1}>{brand.installCta}</Tape>
          </h2>
          <div className="labelmaker-sheet relative mt-10 max-w-3xl px-5 pb-6 pt-8 sm:px-8">
            <Pin color="#1d4f9c" />
            <pre
              tabIndex={0}
              aria-label="Install commands"
              className={`overflow-x-auto font-plex text-sm leading-7 sm:text-base ${focusRing}`}
            >
              <code>
                {install.map((line) => (
                  <span key={line} className="block">
                    <span aria-hidden="true" className="select-none text-[#c8102e]">
                      ${" "}
                    </span>
                    {line}
                  </span>
                ))}
              </code>
            </pre>
            <p className="mt-4 text-sm text-[#4a4a4a]">
              Needs Node, pnpm and Ollama. Then open http://localhost:3100.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center gap-4 px-4 sm:px-8">
        <Tape className="text-lg normal-case tracking-[0.1em]">OtaghDB</Tape>
        <Tape color="blue" className="text-sm">
          MIT licensed
        </Tape>
      </footer>
    </div>
  );
}
