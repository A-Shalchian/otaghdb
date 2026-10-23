import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/images";
import { locationText } from "@/lib/places";
import type { ItemRow } from "./queries";

export function ItemCard({ item, note, className = "" }: { item: ItemRow; note?: string; className?: string }) {
  const src = imageUrl(item.id, item.cutout_file ?? item.original_file);

  return (
    <li className={`group ${className}`}>
      <Link
        href={`/app/items/${item.id}`}
        className="flex h-full flex-col rounded-2xl border border-line bg-card p-2 transition-colors hover:border-accent"
      >
        <div className="tile relative aspect-square overflow-hidden rounded-xl">
          {src ? (
            <Image
              src={src}
              alt={item.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className={
                item.cutout_file
                  ? "object-contain p-[14%] transition-transform duration-200 group-hover:scale-105"
                  : "object-cover"
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-soft">no photo</div>
          )}
          {item.is_container ? (
            <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-soft">
              holds things
            </span>
          ) : null}
          {note ? (
            <span className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] text-soft">
              {note}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-0.5 px-1.5 pb-1 pt-2.5">
          <p className="truncate text-[15px] font-semibold leading-tight">{item.name}</p>
          <p className="truncate text-xs text-soft">{locationText(item)}</p>
        </div>
      </Link>
    </li>
  );
}

export function ItemGrid({ items, notes }: { items: ItemRow[]; notes?: Map<number, string> }) {
  return (
    <div className="@container">
      <ul className="grid grid-cols-2 gap-3 @lg:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-5">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} note={notes?.get(item.id)} />
        ))}
      </ul>
    </div>
  );
}
