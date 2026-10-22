import { z } from "zod";
import { CATEGORIES, DISCARD_LEVELS } from "@/lib/categories";
import { db } from "@/lib/db";
import { parseTags } from "@/features/items/queries";
import { placeItems, resolvePlacement, upsertLooseSpot } from "@/lib/places";

export type ItemChip = { id: number; name: string; imageUrl: string | null; location: string };

const ids = z.array(z.number().int().positive()).min(1).max(200);

export const ProposalSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("move"),
    summary: z.string(),
    itemIds: ids,
    target: z.object({
      roomId: z.number().int().positive().nullable(),
      spotId: z.number().int().positive().nullable(),
      containerId: z.number().int().positive().nullable(),
    }),
  }),
  z.object({
    kind: z.literal("update"),
    summary: z.string(),
    itemIds: ids,
    changes: z.object({
      category: z.enum(CATEGORIES).nullable(),
      addTags: z.array(z.string().max(30)).max(10),
      removeTags: z.array(z.string().max(30)).max(10),
      wouldDiscard: z.enum(DISCARD_LEVELS).nullable(),
    }),
  }),
  z.object({
    kind: z.literal("create_spot"),
    summary: z.string(),
    roomId: z.number().int().positive(),
    furnitureId: z.number().int().positive().nullable(),
    name: z.string().trim().min(1).max(40),
  }),
  z.object({
    kind: z.literal("packing_list"),
    summary: z.string(),
    title: z.string().trim().min(1).max(80),
    itemIds: z.array(z.number().int().positive()).max(200),
    missing: z.array(z.string().trim().min(1).max(60)).max(40),
  }),
]);

export type Proposal = z.infer<typeof ProposalSchema>;

export type ShownProposal = { proposal: Proposal; items: ItemChip[] };

export type ApplyResult = { ok: true; message: string; href?: string } | { ok: false; error: string };

function existingIds(itemIds: number[]) {
  return db
    .prepare("select id from items where id in (select value from json_each(?))")
    .pluck()
    .all(JSON.stringify(itemIds)) as number[];
}

export function applyProposal(proposal: Proposal): ApplyResult {
  switch (proposal.kind) {
    case "move": {
      const found = existingIds(proposal.itemIds);
      if (found.length === 0) return { ok: false, error: "Those items no longer exist." };
      const placement = resolvePlacement(proposal.target);
      if ("error" in placement) return { ok: false, error: placement.error };
      const moved = placeItems(found, placement);
      if (moved.error) return { ok: false, error: moved.error };
      return { ok: true, message: `Moved ${found.length} ${found.length === 1 ? "item" : "items"}.` };
    }
    case "update": {
      const found = existingIds(proposal.itemIds);
      if (found.length === 0) return { ok: false, error: "Those items no longer exist." };
      const { category, addTags, removeTags, wouldDiscard } = proposal.changes;
      const read = db.prepare("select tags_json from items where id = ?").pluck();
      const write = db.prepare(
        `update items set category = coalesce(@category, category), would_discard = coalesce(@wouldDiscard, would_discard),
           clothing_type = case when coalesce(@category, category) = 'clothing' then clothing_type else null end,
           tags_json = @tags, updated_at = datetime('now') where id = @id`,
      );
      const remove = new Set(removeTags.map((t) => t.toLowerCase()));
      db.transaction(() => {
        for (const id of found) {
          const tags = parseTags(read.get(id) as string).filter((t) => !remove.has(t));
          const next = [...new Set([...tags, ...addTags.map((t) => t.toLowerCase())])].slice(0, 12);
          write.run({ id, category, wouldDiscard, tags: JSON.stringify(next) });
        }
      })();
      return { ok: true, message: `Updated ${found.length} ${found.length === 1 ? "item" : "items"}.` };
    }
    case "create_spot": {
      if (proposal.furnitureId) {
        const furniture = db.prepare("select room_id from furniture where id = ?").get(proposal.furnitureId) as
          | { room_id: number }
          | undefined;
        if (!furniture) return { ok: false, error: "That furniture no longer exists." };
        db.prepare(
          `insert into spots (room_id, furniture_id, name, style, sort_order)
           values (?, ?, ?, 'shelf', (select coalesce(max(sort_order), -1) + 1 from spots where furniture_id = ?))
           on conflict (furniture_id, name) where furniture_id is not null do nothing`,
        ).run(furniture.room_id, proposal.furnitureId, proposal.name, proposal.furnitureId);
        return { ok: true, message: `Added ${proposal.name}.`, href: `/app/furniture/${proposal.furnitureId}` };
      }
      if (!db.prepare("select 1 from rooms where id = ?").get(proposal.roomId)) {
        return { ok: false, error: "That room no longer exists." };
      }
      upsertLooseSpot(proposal.roomId, proposal.name);
      return { ok: true, message: `Added ${proposal.name}.`, href: `/app/rooms/${proposal.roomId}` };
    }
    case "packing_list": {
      const found = existingIds(proposal.itemIds);
      const listId = db.transaction(() => {
        const id = Number(
          db
            .prepare("insert into lists (title, missing_json) values (?, ?)")
            .run(proposal.title, JSON.stringify(proposal.missing)).lastInsertRowid,
        );
        const add = db.prepare("insert or ignore into list_items (list_id, item_id) values (?, ?)");
        for (const itemId of found) add.run(id, itemId);
        return id;
      })();
      return { ok: true, message: `Made the list "${proposal.title}".`, href: `/app/lists/${listId}` };
    }
  }
}
