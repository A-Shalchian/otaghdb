import Link from "next/link";
import { answer, brand, install, localPitch, models, steps } from "../content";
import {
  Arrow,
  CircledNumber,
  HeadStrip,
  Paper,
  Ransom,
  Scissors,
  Sticker,
  tornClip,
  zineCss,
} from "./zine-parts";

const focusRing =
  "focus-visible:outline-dashed focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#121212]";
const stepTilts = [-1.2, 0.9, -0.5];
const stripTilts = [1.2, -1, 1.6];
const stripIndents = ["ml-0", "ml-6 sm:ml-12", "ml-2 sm:ml-6"];
const couponTilts = [-0.8, 0.7, 0.5, -0.6];

export default function CutoutZine() {
  const replyParts = answer.reply.split(", ");

  return (
    <div className="zine-toner min-h-screen w-full overflow-x-clip bg-[#eeede8] pb-24 font-archivo text-[#121212]">
      <style dangerouslySetInnerHTML={{ __html: zineCss }} />

      <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-6 sm:px-8 sm:pt-10">
        <span
          className="inline-block -rotate-2 bg-[#121212] px-3 py-1 text-2xl font-black text-white"
          style={{ fontStretch: "125%" }}
        >
          OtaghDB
        </span>
        <span className="font-caveat text-xl leading-tight sm:text-2xl">
          {brand.meaning} <span lang="fa">{brand.persian}</span>
        </span>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-8 sm:pt-14">
          <h1 className="text-[clamp(2rem,8.4vw,5rem)] leading-none">
            <span className="sr-only">{brand.tagline}</span>
            <Ransom text={brand.tagline} />
          </h1>

          <div className="mt-12 grid gap-14 md:grid-cols-12 md:items-center md:gap-8">
            <div className="md:col-span-6 lg:col-span-5">
              <Paper seed={3} tilt={-1} tape="left" innerClassName="px-5 pb-7 pt-8 sm:px-7">
                <p className="text-lg leading-relaxed sm:text-xl">{brand.pitch}</p>
              </Paper>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-5">
                <Link
                  href={brand.appHref}
                  className={`inline-block -rotate-1 bg-[#121212] px-6 py-3 text-lg font-extrabold text-white shadow-[5px_5px_0_#ff48b0] motion-safe:transition-transform hover:-translate-y-0.5 ${focusRing}`}
                  style={{ fontStretch: "112%" }}
                >
                  {brand.appCta}
                </Link>
                <a
                  href={brand.installHref}
                  className={`text-lg font-bold underline decoration-[#ff48b0] decoration-wavy decoration-2 underline-offset-[6px] hover:decoration-[#121212] ${focusRing}`}
                >
                  {brand.installCta}
                </a>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto aspect-[5/4] w-full max-w-[540px] md:col-span-6 lg:col-span-7"
            >
              <div
                className="zine-halftone absolute inset-x-[8%] inset-y-[12%] -rotate-3"
                style={{ clipPath: tornClip(5, 10) }}
              />
              <Sticker name="backpack" tilt={-8} className="absolute left-[4%] top-[6%] w-[38%]" />
              <Sticker name="passport" tilt={9} className="absolute left-[50%] top-[2.5%] w-[22%]" />
              <Sticker name="keys" tilt={-5} className="absolute left-[50%] top-[63%] w-[22%]" />
              <Sticker name="mug" tilt={6} className="absolute left-[14%] top-[62%] w-[20%]" />
              <div className="absolute left-[62%] top-[32%] w-[38%]">
                <Arrow kind="curl" className="w-12 -scale-x-100 sm:w-20" />
                <p className="font-caveat text-lg leading-tight sm:text-2xl">cut out, named, tagged</p>
              </div>
              <div className="absolute bottom-0 left-[34%] flex items-center gap-1">
                <Arrow kind="flat" className="h-4 w-8 -scale-x-100 sm:h-5 sm:w-10" />
                <p className="font-caveat text-lg leading-none sm:text-2xl">no scissors needed</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="zine-how" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <h2 id="zine-how">
            <HeadStrip>How it works</HeadStrip>
          </h2>
          <ol className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Paper
                  seed={i * 4 + 1}
                  tilt={stepTilts[i]}
                  tape={i === 1 ? "right" : "left"}
                  pinkTape={i === 1}
                  className="h-full"
                  innerClassName="h-full px-5 pb-8 pt-7"
                >
                  <CircledNumber n={i + 1} />
                  <h3 className="mt-3 text-2xl font-extrabold" style={{ fontStretch: "87%" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed">{step.body}</p>
                </Paper>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="zine-ask" className="mt-28">
          <div className="bg-[#ff48b0] py-16 sm:py-20" style={{ clipPath: tornClip(9, 12, 34) }}>
            <div className="mx-auto max-w-6xl px-4 sm:px-8">
              <h2 id="zine-ask">
                <HeadStrip tilt={1}>Then ask</HeadStrip>
              </h2>
              <div className="mt-12 grid gap-12 md:grid-cols-12 md:items-center md:gap-8">
                <Paper
                  seed={11}
                  tilt={-2.5}
                  tape="center"
                  className="md:col-span-5"
                  innerClassName="zine-lined pb-8 pl-12 pr-5 pt-8"
                >
                  <p className="font-caveat text-4xl leading-[2.8rem] sm:text-[2.6rem]">{answer.question}</p>
                </Paper>
                <div className="md:col-span-7">
                  <p className="flex flex-col items-start gap-3">
                    {replyParts.map((part, i) => (
                      <span
                        key={part}
                        className={`zine-strip inline-block bg-white px-3 py-1.5 text-2xl font-bold leading-tight sm:text-4xl ${stripIndents[i]}`}
                        style={{ transform: `rotate(${stripTilts[i]}deg)`, fontStretch: "87%" }}
                      >
                        {i < replyParts.length - 1 ? `${part},` : part}
                      </span>
                    ))}
                  </p>
                  <ol aria-label="Where it is filed" className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-3">
                    {answer.chain.map((place, i) => (
                      <li key={place} className="flex items-center gap-2">
                        {i > 0 ? <Arrow kind="flat" className="h-4 w-8" /> : null}
                        <span className="bg-[#121212] px-2 py-1 text-sm font-bold text-white">{place}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="zine-local" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5 lg:col-span-4">
              <h2 id="zine-local">
                <HeadStrip tilt={-1}>{localPitch.title}</HeadStrip>
              </h2>
              <p className="mt-8 text-lg leading-relaxed">{localPitch.body}</p>
              <p className="mt-5 font-caveat text-2xl leading-snug">four open-weight models, one laptop</p>
            </div>
            <ul className="grid gap-8 sm:grid-cols-2 md:col-span-7 md:grid-cols-1 lg:col-span-8 lg:grid-cols-2">
              {models.map((model, i) => (
                <li
                  key={model.name}
                  className="relative border-2 border-dashed border-[#121212] bg-white pb-6 pl-5 pr-24 pt-5"
                  style={{ transform: `rotate(${couponTilts[i]}deg)` }}
                >
                  <Scissors className="absolute -top-3.5 left-4 size-6 bg-[#eeede8] px-0.5" />
                  <h3 className="text-2xl font-black leading-tight" style={{ fontStretch: "87%" }}>
                    {model.name}
                  </h3>
                  <p className="mt-1.5 text-base leading-snug">{model.job}</p>
                  <p className="absolute right-3 top-3 flex size-[4.5rem] rotate-12 items-center justify-center rounded-full border-2 border-[#121212] bg-[#ff48b0] p-1 text-center text-xs font-bold leading-tight">
                    {model.license}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="install" aria-labelledby="zine-install" className="mx-auto mt-24 max-w-6xl px-4 sm:px-8">
          <h2 id="zine-install">
            <HeadStrip tilt={1.2}>{brand.installCta}</HeadStrip>
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-12 md:items-start">
            <Paper
              seed={14}
              tilt={-0.6}
              dark
              tape="right"
              pinkTape
              className="min-w-0 md:col-span-8"
              innerClassName="px-5 py-8 sm:px-8"
            >
              <pre className="whitespace-pre-wrap font-archivo text-base font-medium leading-loose [overflow-wrap:anywhere] sm:text-lg">
                {install.map((line) => (
                  <code key={line} className="block">
                    <span aria-hidden="true" className="select-none text-[#ff48b0]">
                      ${" "}
                    </span>
                    {line}
                  </code>
                ))}
              </pre>
            </Paper>
            <p className="font-caveat text-2xl leading-snug md:col-span-4 md:pt-4">
              needs Node, pnpm and Ollama, then open localhost:3100
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center gap-4 px-4 sm:px-8">
        <span className="bg-[#121212] px-2 py-0.5 text-lg font-black text-white" style={{ fontStretch: "125%" }}>
          OtaghDB
        </span>
        <span className="font-caveat text-2xl">MIT licensed</span>
      </footer>
    </div>
  );
}
