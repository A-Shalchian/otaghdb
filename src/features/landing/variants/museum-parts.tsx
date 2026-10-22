import type { SampleItem } from "../content";
import { ObjectArt, type ObjectKey } from "../objects";

const catalog: Record<ObjectKey, { medium: string; year: number }> = {
  passport: { medium: "Paper, ink, polymer chip", year: 2019 },
  backpack: { medium: "Nylon, polyester webbing", year: 2020 },
  hoodie: { medium: "Cotton, polyester", year: 2021 },
  keys: { medium: "Brass, nickel silver", year: 2018 },
  cable: { medium: "Copper, plastic", year: 2023 },
  wallet: { medium: "Leather, linen thread", year: 2017 },
  headphones: { medium: "Plastic, copper, foam", year: 2016 },
  mug: { medium: "Glazed stoneware", year: 2022 },
  book: { medium: "Paper, ink, glue", year: 2024 },
  sunglasses: { medium: "Acetate, polycarbonate", year: 2021 },
  pen: { medium: "Resin, steel", year: 2015 },
  plant: { medium: "Pothos, clay pot, soil", year: 2023 },
};

function sentence(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function Frame({ item, className }: { item: SampleItem; className: string }) {
  return (
    <div className={`museum-hang bg-[#141414] p-[6px] ${className}`}>
      <div className="bg-[#f5f5f1] p-[16%] shadow-[inset_0_2px_8px_rgba(0,0,0,0.14)]">
        <ObjectArt name={item.object} title={item.name} className="block h-auto w-full" />
      </div>
    </div>
  );
}

export function WallLabel({ item, large = false }: { item: SampleItem; large?: boolean }) {
  const entry = catalog[item.object];
  return (
    <div
      className={`bg-[#f7f6f2] text-[#1d1d1b] shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
        large ? "w-full max-w-[19rem] p-6" : "w-full max-w-[15rem] p-4"
      }`}
    >
      <h3 className={`font-instrument leading-none ${large ? "text-[38px]" : "text-[26px]"}`}>
        {sentence(item.name)}
      </h3>
      <p className={`${large ? "mt-3" : "mt-2"} text-[13px] leading-5`}>Unknown, {entry.year}</p>
      <p className="text-[13px] leading-5">{entry.medium}</p>
      {large ? (
        <p className="mt-4 text-[13px] leading-5">
          {sentence(item.spot)}
          {item.container ? `, in the ${item.container}` : ""}, {item.room}
        </p>
      ) : null}
      <p className={`${large ? "mt-4" : "mt-3"} text-[12px] leading-5 text-[#4a4944]`}>
        Kept because: {item.kept}
      </p>
      <p className="mt-3 text-[11px] text-[#6b6a64] tabular-nums">OTG.2026.{item.id}</p>
    </div>
  );
}
