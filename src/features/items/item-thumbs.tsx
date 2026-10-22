import Link from "next/link";
import { imageUrl } from "@/lib/images";
import type { ItemRow } from "./queries";

export function ItemThumbs({ items, limit, empty }: { items: ItemRow[]; limit?: number; empty?: string }) {
  if (items.length === 0) return <p className="text-xs text-soft">{empty ?? "Empty."}</p>;
  const shown = limit ? items.slice(0, limit) : items;
  const hidden = items.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((item) => {
        const src = imageUrl(item.id, item.cutout_file ?? item.original_file);
        return (
          <li key={item.id}>
            <Link
              href={`/app/items/${item.id}`}
              title={item.name}
              className="flex w-20 flex-col items-center gap-1 rounded-xl p-1 text-center hover:bg-card"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className={`size-16 rounded-lg object-contain ${item.cutout_file ? "" : "object-cover"}`} />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-lg border border-line font-mono text-[10px] text-soft">
                  no photo
                </span>
              )}
              <span className="line-clamp-2 text-[11px] leading-tight">{item.name}</span>
            </Link>
          </li>
        );
      })}
      {hidden > 0 ? (
        <li className="flex w-20 items-center justify-center font-mono text-[11px] text-soft">+{hidden} more</li>
      ) : null}
    </ul>
  );
}
