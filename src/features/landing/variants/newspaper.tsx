import Link from "next/link";
import { answer, brand, install, stats, steps } from "../content";
import { Classifieds, HalftonePhoto, ModelsOnDuty } from "./newspaper-parts";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3241b]";
const doubleRule = "border-t-[5px] border-double border-[#161514]";

export default function MorningPaper() {
  return (
    <div className="min-h-screen w-full bg-[#e9e7e1] pb-24 font-fraunces text-[#161514]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-[#161514] pb-2 text-xs sm:text-sm">
            <span>Vol. 1, No. 1</span>
            <span className="font-semibold">Friday, October 23, 2026</span>
            <span>Toronto edition, free of charge</span>
          </div>

          <div className="grid items-center gap-4 py-6 sm:grid-cols-2 xl:grid-cols-[12rem_minmax(0,1fr)_12rem] xl:gap-6">
            <div className="min-w-0 text-center sm:col-span-2 xl:order-2 xl:col-span-1">
              <p className="font-fraktur text-[length:clamp(2.4rem,10vw,6rem)] leading-none xl:text-[4.75rem]">
                The Otagh Daily
              </p>
              <p className="mt-3 flex items-center justify-center gap-3 text-sm italic text-[#45423d]">
                <span aria-hidden="true" className="h-px w-8 bg-[#161514] sm:w-14" />
                {brand.meaning}
                <span aria-hidden="true" className="h-px w-8 bg-[#161514] sm:w-14" />
              </p>
            </div>
            <div className="border border-[#161514] p-3 text-center xl:order-1">
              <p className="text-2xl font-black tracking-tight">{brand.name}</p>
              <p className="mt-1 text-lg italic leading-snug">&quot;{brand.tagline}&quot;</p>
            </div>
            <div className="border border-[#161514] p-3 text-center xl:order-3">
              <Link
                href={brand.appHref}
                className={`block bg-[#a3241b] px-4 py-2.5 font-semibold text-[#f7f5f0] hover:bg-[#861c15] ${focus}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`mt-2 inline-block py-1 underline decoration-1 underline-offset-4 hover:decoration-2 ${focus}`}
              >
                {brand.installCta}
              </a>
            </div>
          </div>
          <div className={doubleRule} />
        </header>

        <main>
          <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
            <article className="min-w-0 lg:border-r lg:border-[#161514] lg:pr-8">
              <p className="text-sm italic text-[#a3241b]">Late edition</p>
              <h1
                className="mt-1 text-[2.6rem] font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                Local person finds passport in under a second
              </h1>
              <p className="mt-5 text-xl italic leading-snug text-[#2d2b28] sm:text-2xl">
                Asked &quot;{answer.question}&quot;, the room replied: &quot;{answer.reply}&quot;
              </p>
              <p className="mt-4 border-y border-[#161514] py-1.5 text-sm">
                By the Otagh Daily staff
              </p>

              <HalftonePhoto />

              <div className="mt-6 gap-x-8 text-[1.05rem] leading-[1.6] [column-rule:1px_solid_#161514] [hyphens:auto] [text-align:justify] md:columns-2 [&>p+p]:mt-3 [&>p+p]:indent-6">
                <p>
                  <span className="font-bold">TORONTO.</span> A local person found their passport
                  on Friday morning without getting up. They typed a question to their room, and the
                  answer came back before the kettle had boiled. The passport was in the black
                  backpack, on the closet shelf, in the bedroom.
                </p>
                <p>
                  The room runs {brand.name}, a free program that turns a room into a searchable
                  database. The owner photographs their things, one object at a time or a whole
                  drawer at once. The program cuts each object out of the photo, names it and tags
                  it.
                </p>
                <p>
                  The owner then files each thing under a room, a spot such as the closet shelf
                  and, if there is one, a container such as a backpack. This home now holds{" "}
                  {stats.items} things across {stats.rooms} rooms and {stats.containers}{" "}
                  containers.
                </p>
                <p>
                  Finding things is only part of the job. Asked what to bring camping, the room
                  produced a packing list grouped by room. Asked to move everything in the black
                  backpack to the closet, it showed a preview and changed nothing until the owner
                  approved it.
                </p>
                <p>
                  No photo left the apartment. Every model runs on the owner&apos;s laptop, with
                  no account and no cloud. The models on duty are listed in the weather box.
                </p>
              </div>
            </article>

            <aside className="min-w-0 lg:pl-8">
              <ModelsOnDuty />
              <Classifieds />
            </aside>
          </div>

          <section aria-labelledby="paper-steps" className={`${doubleRule} py-8`}>
            <h2
              id="paper-steps"
              className="text-center text-3xl font-black leading-tight sm:text-4xl"
            >
              How a room gets filed, in three steps
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#161514]">
              {steps.map((step, index) => (
                <article key={step.title} className="md:px-6 md:first:pl-0 md:last:pr-0">
                  <p className="text-sm italic text-[#45423d]">Step {index + 1}</p>
                  <h3 className="text-2xl font-bold leading-tight">{step.title}</h3>
                  <p className="mt-2 leading-relaxed [hyphens:auto] [text-align:justify]">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="install"
            aria-labelledby="paper-install"
            className="scroll-mt-6 border-t-2 border-[#161514] py-8"
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-10">
              <div>
                <h2 id="paper-install" className="text-3xl font-black leading-tight">
                  Public notice
                </h2>
                <p className="mt-2 leading-relaxed">
                  To run {brand.name} at home, type these four lines into a terminal, in order. No
                  account is needed.
                </p>
              </div>
              <div className="min-w-0 border-2 border-[#161514] bg-[#f3f1ec] px-4 py-3 sm:px-6 sm:py-4">
                <div className="overflow-x-auto text-[15px] leading-8">
                  {install.map((command, index) => (
                    <code key={command} className="block whitespace-pre font-fraunces font-medium">
                      <span className="select-none text-[#45423d]">{index + 1}. </span>
                      {command}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className={`${doubleRule} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-4 text-sm`}>
          <span className="text-lg font-black">{brand.name}</span>
          <span className="italic text-[#45423d]">Printed on your own machine</span>
          <span>MIT licensed</span>
        </footer>
      </div>
    </div>
  );
}
