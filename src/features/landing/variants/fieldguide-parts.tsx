import type { SampleItem } from "../content";
import { ObjectArt, type ObjectKey } from "../objects";

export const guideFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2721]";

const binomials: Record<ObjectKey, string> = {
  passport: "Passportus documentii",
  backpack: "Saccus dorsalis niger",
  hoodie: "Cucullus zipperus griseus",
  keys: "Clavis domestica",
  cable: "Funiculus usbcensis",
  wallet: "Crumena coriacea",
  headphones: "Auricularis filatus",
  mug: "Poculum caeruleum",
  book: "Liber semilectus",
  sunglasses: "Specularia solaris",
  pen: "Calamus fontinalis",
  plant: "Planta adhuc viva",
};

const colors: Record<ObjectKey, string> = {
  passport: "navy, gold crest",
  backpack: "black",
  hoodie: "heather grey",
  keys: "brass and steel",
  cable: "black, silver tips",
  wallet: "brown leather",
  headphones: "black",
  mug: "blue",
  book: "forest green",
  sunglasses: "black",
  pen: "black, gold nib",
  plant: "green, clay pot",
};

export const statuses = {
  never: { label: "Secure", note: "would never discard", color: "#2f5d3f", rank: 1 },
  maybe: { label: "Vulnerable", note: "might discard", color: "#7a5a12", rank: 2 },
  soon: { label: "Endangered", note: "would discard soon", color: "#9b3322", rank: 3 },
} as const;

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function habitat(item: SampleItem) {
  const base = `${item.room}, ${item.spot}`;
  return item.container ? `${base}, inside the ${item.container}` : base;
}

export function StatusMeter({ discard }: { discard: SampleItem["discard"] }) {
  const status = statuses[discard];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className="h-2.5 w-5 border"
            style={{
              borderColor: status.color,
              backgroundColor: step <= status.rank ? status.color : "transparent",
            }}
          />
        ))}
      </span>
      <span className="font-medium" style={{ color: status.color }}>
        {status.label}
      </span>
    </span>
  );
}

export function Plate({ item, index }: { item: SampleItem; index: number }) {
  return (
    <article className="border border-[#8ea394] p-1">
      <div className="flex h-full flex-col border border-[#8ea394] bg-[#edf2ea] px-5 pb-5 pt-3">
        <div className="flex items-baseline justify-between text-xs text-[#4a5a50]">
          <span>Plate {roman[index] ?? index + 1}</span>
          <span>No. {item.id}</span>
        </div>
        <div className="mx-auto mt-2 w-36">
          <span aria-hidden="true">
            <ObjectArt name={item.object} className="w-full" />
          </span>
          <div aria-hidden="true" className="mx-auto mt-1 flex w-16 items-end justify-between">
            <span className="h-1.5 w-px bg-[#4a5a50]" />
            <span className="h-px flex-1 bg-[#4a5a50]" />
            <span className="h-1.5 w-px bg-[#4a5a50]" />
          </div>
          <p aria-hidden="true" className="mt-0.5 text-center text-[10px] text-[#4a5a50]">
            10 cm
          </p>
        </div>
        <h3 className="mt-3 font-instrument text-[1.75rem] italic leading-[1.05]">
          {binomials[item.object]}
        </h3>
        <p className="mt-1 text-sm text-[#4a5a50]">{item.name}</p>
        <dl className="mt-4 space-y-2 border-t border-[#8ea394] pt-3 text-[13px] leading-snug">
          <div>
            <dt className="inline text-[#4a5a50]">Habitat. </dt>
            <dd className="inline">{habitat(item)}</dd>
          </div>
          <div>
            <dt className="inline text-[#4a5a50]">Field marks. </dt>
            <dd className="inline">
              {item.category}; {colors[item.object]}
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <dt className="text-[#4a5a50]">Status.</dt>
            <dd>
              <StatusMeter discard={item.discard} />
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

const figures: ObjectKey[] = ["passport", "keys", "mug", "pen", "sunglasses", "plant"];

export function Frontispiece() {
  return (
    <figure className="border border-[#8ea394] p-1">
      <div className="border border-[#8ea394] bg-[#edf2ea] px-4 pb-4 pt-3 sm:px-6">
        <p className="text-xs text-[#4a5a50]">Frontispiece</p>
        <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-4 text-[#1d2721]">
          {figures.map((name, index) => (
            <div key={name} className="text-center">
              <ObjectArt name={name} mode="line" className="mx-auto w-full max-w-24" />
              <p className="text-[11px] text-[#4a5a50]">fig. {index + 1}</p>
            </div>
          ))}
        </div>
        <figcaption className="mt-4 border-t border-[#8ea394] pt-3 font-instrument text-lg italic leading-snug">
          Six common residents of a one-bedroom apartment, drawn from life.
        </figcaption>
      </div>
    </figure>
  );
}
