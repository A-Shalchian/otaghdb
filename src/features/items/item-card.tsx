import Image from "next/image";
import { imageUrl } from "@/lib/images";
import type { ItemCard as ItemCardData } from "./queries";

function placeLabel(item: ItemCardData) {
  if (item.container_name) return `in ${item.container_name}`;
  return [item.spot_name, item.room_name].filter(Boolean).join(", ") || "no room";
}

export function ItemCard({ item }: { item: ItemCardData }) {
  const src = imageUrl(item.id, item.cutout_file ?? item.original_file);

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
      <div className="relative aspect-square border-b border-line">
        {src ? (
          <Image
            src={src}
            alt={item.name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className={item.cutout_file ? "object-contain p-3" : "object-cover"}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-soft">
            no photo
          </div>
        )}
        {item.is_container ? (
          <span className="absolute left-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-soft">
            holds things
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-3 py-2.5">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="truncate font-mono text-[11px] text-soft">
          {item.category} · {placeLabel(item)}
        </p>
      </div>
    </li>
  );
}
