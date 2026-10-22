import Link from "next/link";
import { answer, brand, install, localPitch, models, sampleItems, stats, steps } from "../content";
import { ObjectArt } from "../objects";

const css = `@layer components{
.brutalist-page{font-family:"Times New Roman",Times,serif;font-size:16px;line-height:1.3;color:#000;background:#c0c0c0}
.brutalist-page h1{font-size:2em;font-weight:bold;margin:.4em 0 .67em}
.brutalist-page h2{font-size:1.5em;font-weight:bold;margin:.83em 0}
.brutalist-page p{margin:1em 0}
.brutalist-page p,.brutalist-page li,.brutalist-page dd{max-width:40em}
.brutalist-page ul,.brutalist-page ol{margin:1em 0;padding-left:40px}
.brutalist-page ul{list-style:disc}
.brutalist-page ol{list-style:decimal}
.brutalist-page li{margin:.25em 0}
.brutalist-page dl{margin:1em 0}
.brutalist-page dt{font-weight:bold;margin-top:.6em}
.brutalist-page dd{margin-left:40px}
.brutalist-page a{color:#0000ee;text-decoration:underline}
.brutalist-page a:visited{color:#551a8b}
.brutalist-page a:active{color:#ee0000}
.brutalist-page a:focus-visible,.brutalist-page [tabindex]:focus-visible{outline:2px dotted #000;outline-offset:2px}
.brutalist-page hr{height:0;margin:1em 0;border:0;border-top:1px solid #808080;border-bottom:1px solid #fff}
.brutalist-page pre,.brutalist-page code{font-family:"Courier New",Courier,monospace}
.brutalist-page pre{margin:1em 0;padding:8px 10px;background:#fff;border:2px inset #e8e8e8;white-space:pre;overflow-x:auto;max-width:44em}
.brutalist-page table{border-collapse:separate;border-spacing:2px;border:2px outset #e8e8e8;min-width:46rem}
.brutalist-page caption{text-align:left;font-style:italic;padding:0 0 4px}
.brutalist-page th,.brutalist-page td{border:1px inset #e8e8e8;padding:3px 6px;text-align:left;vertical-align:middle}
.brutalist-page thead th{background:#d4d0c8}
.brutalist-page tbody th{white-space:nowrap}
.brutalist-scroll{overflow-x:auto;max-width:100%;margin:1em 0}
.brutalist-icon{display:inline-block;width:24px;height:24px;vertical-align:middle;margin-right:4px}
.brutalist-none{color:#444;font-style:italic}
.brutalist-soon{color:#800000;font-weight:bold}
.brutalist-wordmark{font-size:1.5em;margin:0}
.brutalist-meaning{margin:0}
.brutalist-counter{display:inline-flex;gap:1px;padding:1px;margin:0 .25em;background:#808080;border:2px inset #e8e8e8;vertical-align:middle}
.brutalist-counter span{font-family:"Courier New",Courier,monospace;font-weight:bold;line-height:1;color:#fff;background:#000;padding:.15em .25em}
}`;

const contents = [
  { href: "#brutalist-how", label: "How it works" },
  { href: "#brutalist-ask", label: "Asking where things are" },
  { href: "#brutalist-inventory", label: "Sample inventory" },
  { href: "#brutalist-local", label: localPitch.title },
  { href: "#install", label: brand.installCta },
];

export default function RawHtml() {
  const counter = String(stats.items).padStart(6, "0").split("");
  const path = [...answer.chain].reverse().join("/");

  return (
    <div className="brutalist-page min-h-screen w-full overflow-x-clip bg-[#c0c0c0] pb-24 text-black">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="max-w-[60rem] px-4 pt-3 sm:px-6">
        <header>
          <p className="brutalist-wordmark">
            <b>OtaghDB</b>
          </p>
          <p className="brutalist-meaning">
            <small>
              <i>{brand.meaning}</i> (<span lang="fa">{brand.persian}</span>)
            </small>
          </p>
          <h1>{brand.tagline}</h1>
          <p>{brand.pitch}</p>
          <p>
            <b>
              [ <Link href={brand.appHref}>{brand.appCta}</Link> |{" "}
              <a href={brand.installHref}>{brand.installCta}</a> ]
            </b>
          </p>
        </header>

        <hr />

        <nav aria-label="On this page">
          <p>On this page:</p>
          <ul>
            {contents.map((entry) => (
              <li key={entry.href}>
                <a href={entry.href}>{entry.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <hr />

        <main>
          <section id="brutalist-how">
            <h2>How it works</h2>
            <ol>
              {steps.map((step) => (
                <li key={step.title}>
                  <b>{step.title}.</b> {step.body}
                </li>
              ))}
            </ol>
          </section>

          <hr />

          <section id="brutalist-ask">
            <h2>Asking where things are</h2>
            <dl>
              <dt>Q. {answer.question}</dt>
              <dd>A. {answer.reply}</dd>
            </dl>
            <p>
              Full path: <code>{path}</code>
            </p>
          </section>

          <hr />

          <section id="brutalist-inventory">
            <h2>Sample inventory</h2>
            <p>Every object you photograph becomes a row like these.</p>
            <div className="brutalist-scroll" role="region" aria-labelledby="brutalist-caption" tabIndex={0}>
              <table>
                <caption id="brutalist-caption">Example rows from an OtaghDB database</caption>
                <thead>
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col">Item</th>
                    <th scope="col">Category</th>
                    <th scope="col">Room</th>
                    <th scope="col">Spot</th>
                    <th scope="col">Container</th>
                    <th scope="col">Kept for</th>
                    <th scope="col">Toss it?</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <th scope="row">
                        <span aria-hidden="true">
                          <ObjectArt name={item.object} className="brutalist-icon" />
                        </span>
                        {item.name}
                      </th>
                      <td>{item.category}</td>
                      <td>{item.room}</td>
                      <td>{item.spot}</td>
                      <td>{item.container ?? <span className="brutalist-none">none</span>}</td>
                      <td>{item.kept}</td>
                      <td className={item.discard === "soon" ? "brutalist-soon" : undefined}>{item.discard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Showing {sampleItems.length} of <span className="sr-only">{stats.items}</span>
              <span aria-hidden="true" className="brutalist-counter">
                {counter.map((digit, i) => (
                  <span key={`d${i}`}>{digit}</span>
                ))}
              </span>{" "}
              items in the example database.
            </p>
          </section>

          <hr />

          <section id="brutalist-local">
            <h2>{localPitch.title}</h2>
            <p>{localPitch.body}</p>
            <dl>
              {models.map((model) => (
                <div key={model.name}>
                  <dt>
                    {model.name} <small>({model.license})</small>
                  </dt>
                  <dd>{model.job}.</dd>
                </div>
              ))}
            </dl>
          </section>

          <hr />

          <section id="install">
            <h2>{brand.installCta}</h2>
            <p>You need Node, pnpm and Ollama. Then type:</p>
            <pre tabIndex={0} aria-label="Install commands">
              <code>
                {install.map((line) => (
                  <span key={line} className="block">
                    <span aria-hidden="true" className="select-none">
                      ${" "}
                    </span>
                    {line}
                  </span>
                ))}
              </code>
            </pre>
            <p>
              Then open <code>http://localhost:3100</code> in your browser.
            </p>
          </section>
        </main>

        <footer>
          <hr />
          <p>
            <b>OtaghDB</b>. MIT licensed.
            <br />
            <small>Best viewed in any browser, on your own computer.</small>
          </p>
        </footer>
      </div>
    </div>
  );
}
