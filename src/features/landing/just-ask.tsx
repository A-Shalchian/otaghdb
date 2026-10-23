import Link from "next/link";
import { brand, localPitch, models, repoUrl, steps } from "./content";
import { RunSteps } from "./run-steps";
import { chatScrollbars } from "./scrollbars";
import { AskLoop } from "./ask-loop";
import {
  Asked,
  MovePreview,
  PackingList,
  Replied,
  SendIcon,
  chatCss,
  chatFocus,
} from "./chat-parts";

export default function JustAsk() {
  return (
    <div className="chat-root min-h-screen w-full bg-[#e8ecf1] pb-24 font-bricolage text-[#18212c]">
      <style>{chatCss}</style>
      <style>{chatScrollbars}</style>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-[1200px] lg:px-10">
        <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-6">
          <span className="text-xl font-bold tracking-tight">{brand.name}</span>
          <span className="text-sm text-[#4f5b69]">{brand.meaning}</span>
        </header>

        <main>
          <section className="pt-6 sm:pt-12 lg:grid lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center lg:gap-14 lg:pb-16 lg:pt-0">
            <div>
              <h1
                className="text-[2.75rem] font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[5.25rem]"
                style={{ fontStretch: "80%" }}
              >
                {brand.tagline}
              </h1>
              <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-[#36414f]">
                {brand.pitch}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={brand.appHref}
                  className={`rounded-full bg-[#3d4f8f] px-6 py-3 font-semibold text-white hover:bg-[#324279] ${chatFocus}`}
                >
                  {brand.appCta}
                </Link>
                <a
                  href={brand.installHref}
                  className={`rounded-full border border-[#aab6c6] px-6 py-3 font-semibold hover:bg-[#dde3eb] ${chatFocus}`}
                >
                  {brand.installCta}
                </a>
              </div>
            </div>

            <div className="mt-16 sm:mt-24 lg:mt-0">
              <AskLoop />
            </div>
          </section>

          <section className="mt-24 space-y-6 lg:mt-8">
            <Asked text="how does it work?" />
            <Replied>
              <ol className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-10 lg:space-y-0">
                {steps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-3">
                    <span className="text-3xl font-bold leading-none text-[#3d4f8f]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xl font-semibold leading-tight">{step.title}</p>
                      <p className="mt-1 leading-relaxed text-[#36414f]">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Replied>
          </section>

          <section className="mt-20 space-y-6">
            <Asked text="what do I bring camping?" />
            <Replied>
              <p className="mb-5 text-xl leading-snug">
                From what you already own, grouped by the room it is in.
              </p>
              <PackingList />
            </Replied>
          </section>

          <section className="mt-20 space-y-6">
            <Asked text="move everything in the black backpack to the closet" />
            <Replied className="lg:max-w-3xl">
              <MovePreview />
            </Replied>
          </section>

          <section className="mt-20 space-y-6">
            <Asked text="does anything leave my laptop?" />
            <Replied className="lg:grid lg:grid-cols-2 lg:gap-14">
              <div>
                <h3 className="text-2xl font-semibold leading-tight">No. {localPitch.title}.</h3>
                <p className="mt-2 text-lg leading-relaxed text-[#36414f]">{localPitch.body}</p>
              </div>
              <ul className="mt-6 lg:mt-0">
                {models.map((model) => (
                  <li
                    key={model.name}
                    className="grid gap-x-4 gap-y-0.5 border-t border-[#c4ceda] py-3 sm:grid-cols-[7.5rem_1fr_auto]"
                  >
                    <span className="font-semibold">{model.name}</span>
                    <span className="text-[#36414f]">{model.job}</span>
                    <span className="text-sm text-[#4f5b69] sm:text-right">{model.license}</span>
                  </li>
                ))}
              </ul>
            </Replied>
          </section>

          <section id="install" className="mt-20 scroll-mt-8 space-y-6">
            <Asked text="how do I run it?" />
            <Replied className="lg:max-w-3xl">
              <p className="text-xl leading-snug">Pick your system and run these in a terminal, in order.</p>
              <RunSteps />
              <p className="mt-4 leading-relaxed text-[#36414f]">
                You need about 8 GB of GPU memory, or an Apple Silicon Mac with 16 GB. The first start downloads
                about 2 GB of vision models, and after that it works offline.{" "}
                <a
                  href={`${repoUrl}#run-it`}
                  className={`font-semibold text-[#3d4f8f] underline underline-offset-4 ${chatFocus}`}
                >
                  Full steps in the README
                </a>
              </p>
            </Replied>
          </section>

          <Link
            href={brand.appHref}
            className={`chat-scroll mt-24 flex items-center gap-3 rounded-[28px] border border-[#c4ceda] bg-[#f6f8fa] py-2 pl-6 pr-2 text-lg text-[#4f5b69] hover:border-[#3d4f8f] ${chatFocus}`}
          >
            <span className="min-w-0 flex-1">{brand.appCta} and ask your own question</span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#3d4f8f] text-white">
              <SendIcon />
            </span>
          </Link>
        </main>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-[#c4ceda] pt-5 text-sm text-[#4f5b69]">
          <span className="text-base font-bold text-[#18212c]">{brand.name}</span>
          <span>MIT licensed</span>
        </footer>
      </div>
    </div>
  );
}
