import Link from "next/link";
import { answer, brand, install, localPitch, models, sampleItems, stats, steps } from "../content";
import { ObjectArt } from "../objects";
import { Barcode, Heading, Row, Rule } from "./receipt-parts";

const noise =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E\")";

const teeth =
  "conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) top / 14px 51% repeat-x, conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / 14px 51% repeat-x";

const css = `
.receipt-felt {
  background-color: #1f4434;
  background-image: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 238, 196, 0.12), transparent 70%), ${noise};
}
.receipt-shadow { filter: drop-shadow(0 22px 22px rgba(0, 0, 0, 0.42)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3)); }
.receipt-paper {
  background: linear-gradient(90deg, #e6e6e1, #f3f3ef 7%, #f3f3ef 93%, #e6e6e1);
  -webkit-mask: ${teeth};
  mask: ${teeth};
}
`;

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f4434]";

const room = "bedroom";
const roomItems = sampleItems.filter((item) => item.room === room);

export default function Receipt() {
  return (
    <div className="receipt-felt relative min-h-screen w-full overflow-x-clip font-plex text-[#2a2926]">
      <style>{css}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <ObjectArt
          name="keys"
          className="absolute top-44 left-[calc(50%-440px)] w-40 rotate-[-16deg] drop-shadow-[0_10px_8px_rgba(0,0,0,0.45)]"
        />
        <ObjectArt
          name="pen"
          className="absolute top-[760px] left-[calc(50%+250px)] w-48 rotate-[18deg] drop-shadow-[0_10px_8px_rgba(0,0,0,0.45)]"
        />
      </div>

      <div className="relative mx-auto max-w-[440px] px-4 pt-10 pb-24 sm:pt-16">
        <div className="receipt-shadow">
          <article className="receipt-paper px-5 pt-12 pb-14 text-[13px] leading-[1.6] sm:px-8">
            <header className="text-center">
              <p className="font-vt323 text-[64px] leading-none">{brand.name}</p>
              <p className="mt-1 text-xs">{brand.meaning}</p>
              <h1 className="mt-6 text-xl leading-snug font-semibold">{brand.tagline}</h1>
              <p className="mt-3 text-left">{brand.pitch}</p>
              <Link
                href={brand.appHref}
                className={`mt-6 block bg-[#2a2926] px-4 py-3 text-center text-sm font-semibold text-[#f3f3ef] hover:bg-[#1f4434] ${focus}`}
              >
                {brand.appCta}
              </Link>
              <a
                href={brand.installHref}
                className={`mt-3 inline-block underline underline-offset-4 hover:text-[#1f4434] ${focus}`}
              >
                {brand.installCta}
              </a>
            </header>

            <Rule />

            <div className="space-y-0.5">
              <Row label="Store" value="this laptop" />
              <Row label="Cloud" value="none" />
              <Row label="Room" value={room} />
            </div>

            <Rule />

            <section aria-label={`Items in the ${room}`}>
              <div className="flex justify-between text-xs font-semibold uppercase">
                <span>Item</span>
                <span>No.</span>
              </div>
              <ul className="mt-2 space-y-2.5">
                {roomItems.map((item) => (
                  <li key={item.id}>
                    <Row label={item.name} value={`#${item.id}`} />
                    <p className="pl-3 text-xs">
                      {item.spot}
                      {item.container ? `, in ${item.container}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-[#2a2926]/55 pt-3">
                <Row label="Total items" value={roomItems.length} strong />
              </div>
              <div className="mt-3 space-y-0.5 text-xs">
                <Row label="Items on file" value={stats.items} />
                <Row label="Rooms" value={stats.rooms} />
                <Row label="Containers" value={stats.containers} />
                <Row label="Photos sent to the cloud" value={0} />
              </div>
            </section>

            <Rule />

            <section>
              <Heading>How it works</Heading>
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[1.5rem_minmax(0,1fr)]">
                    <span className="font-semibold">{index + 1}</span>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <Rule />

            <section>
              <Heading>Ask</Heading>
              <p className="font-semibold">&gt; {answer.question}</p>
              <p className="mt-1">{answer.reply}</p>
              <ol className="mt-3 text-xs">
                {[...answer.chain].reverse().map((place, depth) => (
                  <li key={place} style={{ paddingLeft: `${depth * 0.9}rem` }}>
                    {depth === 0 ? "" : "+ "}
                    {place}
                  </li>
                ))}
              </ol>
            </section>

            <Rule />

            <section>
              <Heading>{localPitch.title}</Heading>
              <p>{localPitch.body}</p>
              <ul className="mt-4 space-y-2.5">
                {models.map((model) => (
                  <li key={model.name}>
                    <Row label={<span className="font-semibold">{model.name}</span>} value={model.license} />
                    <p className="pl-3 text-xs">{model.job}</p>
                  </li>
                ))}
              </ul>
            </section>

            <Rule />

            <Barcode />

            <section id="install" className="mt-8 scroll-mt-8">
              <Heading>{brand.installCta}</Heading>
              <p className="text-center text-xs">
                This receipt ends with four commands instead of a thank you.
              </p>
              <pre className="mt-4 overflow-x-auto border border-dashed border-[#2a2926]/60 p-3 font-plex text-xs leading-6 whitespace-pre-wrap [overflow-wrap:anywhere]">
                {install.map((line) => (
                  <span key={line} className="block">
                    <span className="select-none">$ </span>
                    {line}
                  </span>
                ))}
              </pre>
              <p className="mt-3 text-center text-xs">
                Needs Node.js, pnpm and Ollama. Then open localhost:3100.
              </p>
            </section>
          </article>
        </div>

        <footer className="mt-10 flex items-baseline justify-center gap-4 text-xs text-[#c4dacb]">
          <span className="font-vt323 text-2xl text-[#f3f3ef]">{brand.name}</span>
          <span>MIT licensed</span>
        </footer>
      </div>
    </div>
  );
}
