import { Fragment } from "react";
import { answer, sampleItems, stats } from "../content";
import { ObjectArt } from "../objects";

const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
const selected = new Set(["B", "C", "D", "E", "F", "G"]);
const widths = ["44px", "64px", "210px", "124px", "124px", "184px", "150px", "116px", "auto"];
const fields = ["id", "name", "category", "room", "spot", "container", "would discard"];
const rooms = Array.from(new Set(sampleItems.map((item) => item.room)));
const path = [...answer.chain].reverse();

const cell = "h-8 overflow-hidden text-ellipsis whitespace-nowrap border border-[#e2e5e2] px-2";
const headBase = "h-8 border border-[#d6dad6] px-1 text-center font-mono text-[11px]";
const headIdle = "bg-[#f1f3f1] font-normal text-[#5b635d]";
const headActive = "bg-[#dcebe1] font-semibold text-[#1e7145]";
const hitRow = 2 + sampleItems.findIndex((item) => item.name === answer.chain[0]);

export const sheetFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e7145]";

function RowHead({ n, active = false }: { n: number; active?: boolean }) {
  return (
    <th
      scope="row"
      className={`${headBase} ${active ? headActive : headIdle}`}
    >
      {n}
    </th>
  );
}

function Blank({ n }: { n: number }) {
  return (
    <tr>
      <RowHead n={n} />
      {letters.map((letter) => (
        <td key={letter} className={cell} />
      ))}
    </tr>
  );
}

export function SheetFrame() {
  return (
    <div className="mt-10 overflow-hidden rounded-md border border-[#cdd2cd] bg-white">
      <div className="flex items-stretch border-b border-[#dfe2df] font-mono text-sm">
        <div className="flex w-16 shrink-0 items-center justify-center border-r border-[#dfe2df] text-[#3c443f]">
          B16
        </div>
        <div className="flex shrink-0 items-center border-r border-[#dfe2df] px-3 font-sans text-sm italic text-[#1e7145]">
          fx
        </div>
        <div className="min-w-0 flex-1 truncate px-3 py-2">
          <span className="text-[#1e7145]">=WHERE</span>
          <span>(&quot;{answer.chain[0]}&quot;)</span>
        </div>
      </div>

      <div
        role="region"
        aria-label="Sample sheet of filed items"
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1e7145]"
      >
        <table className="w-full min-w-[1020px] table-fixed border-collapse text-sm">
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className={`${headBase} bg-[#e9ece9]`} />
              {letters.map((letter) => (
                <th
                  key={letter}
                  scope="col"
                  className={`${headBase} ${
                    selected.has(letter) ? `${headActive} border-b-2 border-b-[#1e7145]` : headIdle
                  }`}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <RowHead n={1} />
              {fields.map((field) => (
                <td key={field} className={`${cell} font-semibold`}>
                  {field}
                </td>
              ))}
              <td className={cell} />
            </tr>
            {sampleItems.map((item, index) => {
              const hit = index + 2 === hitRow;
              const tone = hit ? "bg-[#eef6f1]" : "";
              return (
                <tr key={item.id}>
                  <RowHead n={index + 2} />
                  <td className={`${cell} ${tone} text-right font-mono text-xs text-[#59615c]`}>
                    {item.id}
                  </td>
                  <td className={`${cell} ${tone} ${hit ? "font-semibold" : ""}`}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="shrink-0">
                        <ObjectArt name={item.object} className="size-5" />
                      </span>
                      {item.name}
                    </span>
                  </td>
                  <td className={`${cell} ${tone} text-[#59615c]`}>{item.category}</td>
                  <td className={`${cell} ${tone}`}>{item.room}</td>
                  <td className={`${cell} ${tone}`}>{item.spot}</td>
                  <td className={`${cell} ${tone}`}>{item.container ?? ""}</td>
                  <td className={`${cell} font-mono text-xs`}>{item.discard}</td>
                  <td className={cell} />
                </tr>
              );
            })}
            <Blank n={14} />
            <tr>
              <RowHead n={15} />
              <td className={`${cell} font-mono text-xs text-[#59615c]`}>ask</td>
              <td colSpan={6} className={cell}>
                {answer.question}
              </td>
              <td className={cell} />
            </tr>
            <tr>
              <RowHead n={16} active />
              <td className={`${cell} font-mono text-xs text-[#59615c]`}>found</td>
              <td
                colSpan={6}
                className="relative h-9 border-2 border-[#1e7145] bg-[#eef6f1] px-2 font-medium"
              >
                <span className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                  {path.map((step, index) => (
                    <Fragment key={step}>
                      {index > 0 ? (
                        <span aria-hidden="true" className="text-[#1e7145]">
                          ›
                        </span>
                      ) : null}
                      <span>{step}</span>
                    </Fragment>
                  ))}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-[5px] -right-[5px] size-[9px] border-2 border-white bg-[#1e7145]"
                />
              </td>
              <td className={cell} />
            </tr>
            <tr>
              <RowHead n={17} />
              <td className={`${cell} font-mono text-xs text-[#59615c]`}>reply</td>
              <td colSpan={6} className={`${cell} text-[#3c443f]`}>
                {answer.reply}
              </td>
              <td className={cell} />
            </tr>
            <Blank n={18} />
          </tbody>
        </table>
      </div>

      <div className="flex items-stretch border-t border-[#cdd2cd] bg-[#f1f3f1] text-sm">
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          <span className="shrink-0 border-r border-[#d6dad6] border-b-2 border-b-[#1e7145] bg-white px-4 py-2 font-medium text-[#1e7145]">
            all rooms
          </span>
          {rooms.map((room) => (
            <span
              key={room}
              className="shrink-0 border-r border-[#d6dad6] px-4 py-2 text-[#4b534d]"
            >
              {room}
            </span>
          ))}
        </div>
        <div className="hidden shrink-0 items-center px-4 font-mono text-xs text-[#4b534d] md:flex">
          {stats.items} items, {stats.rooms} rooms, {stats.containers} containers
        </div>
      </div>
    </div>
  );
}
