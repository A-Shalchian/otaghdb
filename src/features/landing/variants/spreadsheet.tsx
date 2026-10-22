import Link from "next/link";
import { brand, install, localPitch, models, steps } from "../content";
import { SheetFrame, sheetFocus } from "./spreadsheet-parts";

const gridCell = "border border-[#e2e5e2] px-3 py-2.5 align-top";
const gridHead =
  "border border-[#d6dad6] bg-[#f1f3f1] px-3 py-1.5 text-left font-mono text-xs font-normal text-[#5b635d]";
const rowNumber =
  "w-11 border border-[#d6dad6] bg-[#f1f3f1] px-1 text-center align-top font-mono text-[11px] font-normal text-[#5b635d]";

function SheetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#1e7145" />
      <path d="M2 9h20M2 15h20M9 9v13M15 9v13" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

export default function Spreadsheet() {
  return (
    <div className="min-h-screen w-full bg-[#f4f5f4] pb-24 font-sans text-[#1d2420]">
      <header className="border-b border-[#dfe2df] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
          <SheetIcon />
          <span className="text-lg font-semibold tracking-tight">{brand.name}</span>
          <span className="font-mono text-xs text-[#59615c]">{brand.meaning}</span>
          <span className="ml-auto hidden items-center gap-1.5 text-sm text-[#59615c] sm:flex">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
              <path d="m3 8.5 3 3 7-7" fill="none" stroke="#1e7145" strokeWidth="2" />
            </svg>
            Saved on this laptop
          </span>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-12">
            <h1 className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {brand.tagline}
            </h1>
            <div>
              <p className="max-w-prose text-base leading-relaxed text-[#3c443f] sm:text-lg">
                {brand.pitch}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={brand.appHref}
                  className={`rounded-md bg-[#1e7145] px-5 py-2.5 font-medium text-white hover:bg-[#185d39] ${sheetFocus}`}
                >
                  {brand.appCta}
                </Link>
                <a
                  href={brand.installHref}
                  className={`rounded-md border border-[#c3c9c3] bg-white px-5 py-2.5 font-medium text-[#1d2420] hover:bg-[#eef0ee] ${sheetFocus}`}
                >
                  {brand.installCta}
                </a>
              </div>
            </div>
          </div>
          <SheetFrame />
          <p className="mt-3 text-sm text-[#59615c]">
            Every row is something you photographed. The formula is a question in plain words.
          </p>
        </section>

        <section aria-labelledby="sheet-steps" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <h2 id="sheet-steps" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-6 overflow-hidden rounded-md border border-[#cdd2cd] bg-white">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr>
                  <td className={`${rowNumber} pt-1.5`} />
                  <th scope="col" className={`${gridHead} w-28 sm:w-56`}>
                    step
                  </th>
                  <th scope="col" className={gridHead}>
                    what happens
                  </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, index) => (
                  <tr key={step.title}>
                    <th scope="row" className={`${rowNumber} pt-3`}>
                      {index + 1}
                    </th>
                    <td className={`${gridCell} font-semibold`}>{step.title}</td>
                    <td className={`${gridCell} leading-relaxed text-[#3c443f]`}>{step.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          aria-labelledby="sheet-local"
          className="mx-auto mt-20 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-12"
        >
          <div>
            <h2 id="sheet-local" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {localPitch.title}
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed text-[#3c443f]">{localPitch.body}</p>
          </div>
          <div className="overflow-hidden rounded-md border border-[#cdd2cd] bg-white">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr>
                  <th scope="col" className={gridHead}>
                    model
                  </th>
                  <th scope="col" className={gridHead}>
                    job
                  </th>
                  <th scope="col" className={gridHead}>
                    license
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.name}>
                    <td className={`${gridCell} whitespace-nowrap font-semibold`}>{model.name}</td>
                    <td className={`${gridCell} text-[#3c443f]`}>{model.job}</td>
                    <td className={`${gridCell} whitespace-nowrap font-mono text-xs leading-6 text-[#1e7145]`}>
                      {model.license}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="install"
          aria-labelledby="sheet-install"
          className="mx-auto mt-20 max-w-6xl scroll-mt-6 px-4 sm:px-6"
        >
          <h2 id="sheet-install" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Run it locally
          </h2>
          <p className="mt-3 text-[#3c443f]">Four commands in a terminal, one per row.</p>
          <div className="mt-6 overflow-hidden rounded-md border border-[#cdd2cd] bg-white">
            <div className="overflow-x-auto py-2 font-mono text-sm leading-8">
              {install.map((command, index) => (
                <div key={command} className="flex min-w-max border-b border-[#eceeec] last:border-b-0">
                  <span className="w-11 shrink-0 select-none border-r border-[#d6dad6] bg-[#f1f3f1] text-center text-[11px] text-[#5b635d]">
                    {index + 1}
                  </span>
                  <code className="whitespace-pre px-4">{command}</code>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#cdd2cd] pt-4 text-sm text-[#59615c]">
          <span className="flex items-center gap-2 font-semibold text-[#1d2420]">
            <SheetIcon />
            {brand.name}
          </span>
          <span>MIT licensed</span>
        </div>
      </footer>
    </div>
  );
}
