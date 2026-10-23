import Link from "next/link";
import { notFound } from "next/navigation";
import { monoLabel, secondaryButton } from "@/components/form";
import { imageUrl } from "@/lib/images";
import { locationText } from "@/lib/places";
import { ItemEditForm } from "./item-edit-form";
import { ItemGrid } from "./item-card";
import { getAiJson, getItem, getItems, getPlaces, parseTags } from "./queries";

export async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const item = Number.isInteger(id) ? await getItem(id) : null;
  if (!item) notFound();

  const [tree, contents] = await Promise.all([
    getPlaces(),
    item.is_container ? getItems({ containerId: item.id }) : Promise.resolve([]),
  ]);
  const aiJson = await getAiJson(item.id);
  const main = imageUrl(item.id, item.cutout_file ?? item.original_file);
  const original = item.cutout_file ? imageUrl(item.id, item.original_file) : null;
  const sprite = imageUrl(item.id, item.sprite_file);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href={item.room_id ? `/app?room=${item.room_id}` : "/app"} className="text-sm text-soft hover:underline">
          ← {item.room_name ?? "Everything"}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{item.name}</h1>
        <p className="mt-1 font-mono text-xs text-soft">{locationText(item)}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex flex-col gap-3">
          <div className={`overflow-hidden rounded-2xl border border-line ${item.cutout_file ? "tile" : "bg-card"}`}>
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={main} alt={item.name} className="mx-auto max-h-[28rem] w-full object-contain p-4" />
            ) : (
              <div className="flex aspect-square items-center justify-center font-mono text-xs text-soft">no photo</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {original ? (
              <a href={original} target="_blank" className="text-xs underline underline-offset-4">
                Original photo
              </a>
            ) : null}
            {sprite ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sprite} alt="Pixel sprite" className="pixelated size-12" />
            ) : null}
          </div>
          {aiJson ? (
            <details className="rounded-xl border border-line px-3 py-2 text-xs">
              <summary className="cursor-pointer text-soft">What the AI guessed</summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px]">
                {aiJson}
              </pre>
            </details>
          ) : null}
        </div>

        <ItemEditForm
          itemId={item.id}
          tree={tree}
          ai={{
            name: item.name,
            category: item.category,
            clothingType: item.clothing_type ?? "",
            color: item.color ?? "",
            tags: parseTags(item.tags_json).join(", "),
            description: item.description ?? "",
            isContainer: Boolean(item.is_container),
          }}
          kept={{ wouldDiscard: item.would_discard, whyKept: item.why_kept ?? "", notes: item.notes ?? "" }}
          place={{ roomId: item.room_id, spotId: item.spot_id, containerId: item.container_id }}
        />
      </div>

      {item.is_container ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={monoLabel}>
              Inside the {item.name} ({contents.length})
            </h2>
            <Link href={`/app/add?container=${item.id}`} className={secondaryButton}>
              Add something inside
            </Link>
          </div>
          {contents.length ? (
            <ItemGrid items={contents} />
          ) : (
            <p className="text-sm text-soft">Nothing inside yet.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
