import { localPitch, models, sampleItems } from "../content";
import { ObjectArt } from "../objects";

const ads = sampleItems.filter((item) => item.discard !== "never");

function sentence(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const halftone = {
  backgroundImage: "radial-gradient(circle, rgba(22, 21, 20, 0.42) 0.9px, transparent 1.4px)",
  backgroundSize: "5px 5px",
};

export function HalftonePhoto() {
  return (
    <figure className="mt-6">
      <div
        role="img"
        aria-label="A passport resting against a black backpack"
        className="relative aspect-[16/10] overflow-hidden border border-[#161514] bg-[#cfccc4]"
        style={halftone}
      >
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[22%] bg-[#b9b5ab]" />
        <span aria-hidden="true">
          <ObjectArt
            name="backpack"
            className="absolute bottom-[4%] left-[14%] w-[44%] grayscale contrast-125"
          />
          <ObjectArt
            name="passport"
            className="absolute bottom-[8%] right-[16%] w-[30%] rotate-[9deg] grayscale contrast-125"
          />
        </span>
        <span aria-hidden="true" className="absolute inset-0 opacity-60" style={halftone} />
      </div>
      <figcaption className="mt-2 border-b border-[#161514] pb-2 text-sm leading-snug text-[#45423d]">
        <span className="font-semibold text-[#161514]">Found.</span> The passport and the black
        backpack it was filed in. The owner&apos;s laptop took the photo and kept it.
      </figcaption>
    </figure>
  );
}

export function ModelsOnDuty() {
  return (
    <section aria-labelledby="paper-models" className="border-2 border-[#161514] p-4">
      <h2 id="paper-models" className="text-center text-2xl font-black leading-tight">
        Models on duty
      </h2>
      <p className="mt-1 text-center text-sm italic text-[#45423d]">
        Forecast: local all day, no chance of cloud
      </p>
      <h3 className="mt-4 border-t border-[#161514] pt-3 font-bold">{localPitch.title}</h3>
      <p className="mt-1 text-sm leading-snug">{localPitch.body}</p>
      <ul className="mt-4 border-t border-[#161514]">
        {models.map((model) => (
          <li key={model.name} className="border-b border-[#161514]/30 py-2.5 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">{model.name}</span>
              <span className="shrink-0 text-xs text-[#45423d]">{model.license}</span>
            </div>
            <p className="text-sm leading-snug">{model.job}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Classifieds() {
  return (
    <section aria-labelledby="paper-classifieds" className="mt-8">
      <h2
        id="paper-classifieds"
        className="border-y-2 border-[#161514] py-1 text-center text-2xl font-black"
      >
        Classifieds
      </h2>
      <p className="mt-2 text-center text-sm italic text-[#45423d]">
        Things the owner would let go
      </p>
      <ul className="mt-3">
        {ads.map((item) => (
          <li
            key={item.id}
            className="border-b border-dotted border-[#161514] py-3 text-sm leading-snug [hyphens:auto] [text-align:justify]"
          >
            <span
              className={`float-right ml-2 mt-0.5 border px-1.5 text-xs font-semibold ${
                item.discard === "soon"
                  ? "border-[#a3241b] text-[#a3241b]"
                  : "border-[#161514] text-[#161514]"
              }`}
            >
              {sentence(item.discard)}
            </span>
            <span className="font-black uppercase">{item.name}.</span> {sentence(item.kept)}.
            Found in the {item.room}, {item.spot}. Ask for no. {item.id}.
          </li>
        ))}
      </ul>
    </section>
  );
}
