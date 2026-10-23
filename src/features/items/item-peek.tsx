import { secondaryButton } from "@/components/form";
import { imageUrl } from "@/lib/images";
import { locationText } from "@/lib/places";
import { MoveForm } from "./move-form";
import { getItem, getPlaces, parseTags } from "./queries";

export async function ItemPeek({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [item, tree] = await Promise.all([Number.isInteger(id) ? getItem(id) : null, getPlaces()]);
  if (!item) return <p className="p-10 text-center text-soft">That item no longer exists.</p>;

  const src = imageUrl(item.id, item.cutout_file ?? item.original_file);
  const tags = parseTags(item.tags_json);

  return (
    <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="p-4 md:p-6">
        <div className="tile flex aspect-square items-center justify-center overflow-hidden rounded-2xl">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={item.name}
              className={item.cutout_file ? "h-full w-full object-contain p-[12%]" : "h-full w-full object-cover"}
            />
          ) : (
            <span className="font-mono text-xs text-soft">no photo</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-5 md:py-6 md:pl-0 md:pr-6">
        <div className="pr-10">
          <p className="font-mono text-[11px] uppercase tracking-wide text-soft">
            {item.category}
            {item.color ? ` · ${item.color}` : ""}
          </p>
          <h2 className="mt-1 text-3xl font-bold leading-tight tracking-tight">{item.name}</h2>
          {item.description ? <p className="mt-2 leading-relaxed text-soft">{item.description}</p> : null}
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-tile px-2 py-0.5 font-mono text-[11px] text-soft">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
          <div>
            <h3 className="text-sm text-soft">Where you left it last</h3>
            <p className="text-lg font-semibold leading-snug">{locationText(item)}</p>
          </div>
          <MoveForm
            itemId={item.id}
            tree={tree}
            initial={{ roomId: item.room_id, spotId: item.spot_id, containerId: item.container_id }}
            category={item.category}
            clothingType={item.clothing_type}
            isContainer={Boolean(item.is_container)}
          />
        </section>

        <a href={`/app/items/${item.id}`} className={`self-start ${secondaryButton}`}>
          Edit everything
        </a>
      </div>
    </div>
  );
}
