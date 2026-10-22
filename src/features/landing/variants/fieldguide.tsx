import Link from "next/link";
import { answer, brand, install, localPitch, models, sampleItems, steps } from "../content";
import { Frontispiece, Plate, StatusMeter, guideFocus, statuses } from "./fieldguide-parts";

const ranks = ["room", "spot", "container", "specimen"];
const lineage = [...answer.chain].reverse().map((value, index) => ({ value, rank: ranks[index] }));
const sectionHead = "font-instrument text-4xl leading-[1.05] sm:text-5xl";

export default function FieldGuide() {
  return (
    <div className="min-h-screen w-full bg-[#dde7dc] pb-24 font-plex text-[#1d2721]">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#8ea394] py-4">
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-instrument text-2xl">{brand.name}</span>
            <span className="text-xs text-[#4a5a50]">{brand.meaning}</span>
          </span>
          <span className="text-xs text-[#4a5a50]">First edition, {sampleItems.length} plates</span>
        </header>

        <main>
          <section className="grid gap-12 py-12 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:py-20">
            <div>
              <h1 className="font-instrument text-[3.4rem] leading-[0.92] sm:text-7xl lg:text-[6.25rem]">
                A field guide to your room
              </h1>
              <p className="mt-4 font-instrument text-2xl italic text-[#2c3a31] sm:text-3xl">
                {brand.tagline}
              </p>
              <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed">{brand.pitch}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <Link
                  href={brand.appHref}
                  className={`bg-[#1d2721] px-5 py-3 font-medium text-[#edf2ea] hover:bg-[#2f3d34] ${guideFocus}`}
                >
                  {brand.appCta}
                </Link>
                <a
                  href={brand.installHref}
                  className={`border border-[#1d2721] px-5 py-3 font-medium hover:bg-[#edf2ea] ${guideFocus}`}
                >
                  {brand.installCta}
                </a>
              </div>
            </div>
            <Frontispiece />
          </section>

          <section aria-labelledby="guide-steps" className="border-t border-[#8ea394] py-14">
            <h2 id="guide-steps" className={sectionHead}>
              How to use this guide
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#8ea394]">
              {steps.map((step, index) => (
                <li key={step.title} className="md:px-8 md:first:pl-0 md:last:pr-0">
                  <span className="font-instrument text-5xl leading-none text-[#4a5a50]">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-instrument text-2xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="guide-ask"
            className="grid gap-8 border-t border-[#8ea394] py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-14"
          >
            <div>
              <h2 id="guide-ask" className={sectionHead}>
                Finding a specimen
              </h2>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed">
                Ask in plain words. The guide answers with the habitat, from the room down to the
                bag the thing is in.
              </p>
            </div>
            <div className="border border-[#8ea394] p-1">
              <div className="border border-[#8ea394] bg-[#edf2ea] p-5 sm:p-7">
                <p className="text-xs text-[#4a5a50]">Query</p>
                <p className="mt-1 text-lg">{answer.question}</p>
                <p className="mt-5 font-instrument text-3xl leading-tight sm:text-4xl">
                  {answer.reply}
                </p>
                <ol aria-label="Habitat" className="mt-6 space-y-1.5 border-t border-[#8ea394] pt-4 text-sm">
                  {lineage.map((node, index) => (
                    <li
                      key={node.value}
                      className="flex items-baseline gap-2"
                      style={{ paddingLeft: `${index * 1.25}rem` }}
                    >
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className="inline-block h-3 w-3 shrink-0 -translate-y-0.5 border-b border-l border-[#4a5a50]"
                        />
                      ) : null}
                      <span className={index === lineage.length - 1 ? "font-semibold" : ""}>
                        {node.value}
                      </span>
                      <span className="text-xs text-[#4a5a50]">{node.rank}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section aria-labelledby="guide-plates" className="border-t border-[#8ea394] py-14">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div>
                <h2 id="guide-plates" className={sectionHead}>
                  The plates
                </h2>
                <p className="mt-4 max-w-[52ch] text-sm leading-relaxed">
                  Twelve species found in one apartment. Status shows how likely the owner is to
                  let each one go.
                </p>
              </div>
              <dl className="grid gap-2 text-[13px] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {(["never", "maybe", "soon"] as const).map((key) => (
                  <div key={key}>
                    <dt>
                      <StatusMeter discard={key} />
                    </dt>
                    <dd className="mt-0.5 text-[#4a5a50]">{statuses[key].note}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sampleItems.map((item, index) => (
                <Plate key={item.id} item={item} index={index} />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="guide-local"
            className="grid gap-8 border-t border-[#8ea394] py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-14"
          >
            <div>
              <h2 id="guide-local" className={sectionHead}>
                {localPitch.title}
              </h2>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed">{localPitch.body}</p>
            </div>
            <div>
              <p className="font-instrument text-2xl italic">Field equipment</p>
              <table className="mt-3 w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-y border-[#1d2721] text-xs text-[#4a5a50]">
                    <th scope="col" className="py-2 pr-4 font-normal">
                      Model
                    </th>
                    <th scope="col" className="py-2 pr-4 font-normal">
                      Job
                    </th>
                    <th scope="col" className="py-2 font-normal">
                      License
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.name} className="border-b border-[#8ea394] align-top">
                      <td className="whitespace-nowrap py-3 pr-4 font-medium">{model.name}</td>
                      <td className="py-3 pr-4 leading-snug">{model.job}</td>
                      <td className="whitespace-nowrap py-3 text-[#4a5a50]">{model.license}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="install"
            aria-labelledby="guide-install"
            className="scroll-mt-6 border-t border-[#8ea394] py-14"
          >
            <h2 id="guide-install" className={sectionHead}>
              Appendix A. Run it locally
            </h2>
            <p className="mt-4 text-sm leading-relaxed">Four commands in a terminal, in order.</p>
            <div className="mt-6 border border-[#8ea394] p-1">
              <div className="overflow-x-auto border border-[#8ea394] bg-[#edf2ea] px-5 py-4 text-sm leading-8">
                {install.map((command) => (
                  <code key={command} className="block whitespace-pre font-plex">
                    <span className="select-none text-[#4a5a50]">$ </span>
                    {command}
                  </code>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[#8ea394] pt-5 text-xs text-[#4a5a50]">
          <span className="font-instrument text-xl text-[#1d2721]">{brand.name}</span>
          <span>MIT licensed</span>
        </footer>
      </div>
    </div>
  );
}
