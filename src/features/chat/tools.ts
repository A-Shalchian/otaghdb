import { z } from "zod";
import { itemsByIds, parseTags, type ItemRow } from "@/features/items/queries";
import { bestMatch, itemsInPlace, searchItems } from "@/features/search/search";
import { CATEGORIES, DISCARD_LEVELS } from "@/lib/categories";
import { db } from "@/lib/db";
import { imageUrl } from "@/lib/images";
import type { ToolDefinition } from "@/lib/ollama";
import { getPlaceTree, locationText, spotText } from "@/lib/places";
import type { ItemChip, Proposal, ShownProposal } from "./proposals";

export type ToolResult = { text: string; status: string; proposal?: ShownProposal };

const itemIds = { type: "array", items: { type: "integer" }, description: "item ids from earlier results" };

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_items",
      description:
        "Find things the person owns by name, tag or look. Pass several short searches at once, like [\"tent\", \"flashlight\"].",
      parameters: {
        type: "object",
        properties: { queries: { type: "array", items: { type: "string" } } },
        required: ["queries"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_item",
      description: "Details of one item: description, tags, where it is, and what it holds if it is a container.",
      parameters: { type: "object", properties: { id: { type: "integer" } }, required: ["id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_places",
      description: "Every room, piece of furniture, compartment, loose spot and container, with their ids.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "items_in",
      description: "What is inside a container (container_id) or in a spot or compartment (spot_id).",
      parameters: {
        type: "object",
        properties: { container_id: { type: "integer" }, spot_id: { type: "integer" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "move_items",
      description:
        "Propose moving items. Give exactly one target: container_id, spot_id (from list_places), or room (a room name). The person approves it.",
      parameters: {
        type: "object",
        properties: {
          item_ids: itemIds,
          container_id: { type: "integer" },
          spot_id: { type: "integer" },
          room: { type: "string" },
        },
        required: ["item_ids"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_items",
      description: "Propose changing category, tags or 'would discard' (never, maybe, soon) on items.",
      parameters: {
        type: "object",
        properties: {
          item_ids: itemIds,
          category: { type: "string", enum: CATEGORIES },
          add_tags: { type: "array", items: { type: "string" } },
          remove_tags: { type: "array", items: { type: "string" } },
          would_discard: { type: "string", enum: DISCARD_LEVELS },
        },
        required: ["item_ids"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_spot",
      description: "Propose a new spot in a room, or a new compartment in a piece of furniture.",
      parameters: {
        type: "object",
        properties: {
          room: { type: "string" },
          name: { type: "string" },
          furniture_id: { type: "integer" },
        },
        required: ["room", "name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "plan_packing_list",
      description:
        "Propose a packing checklist for a trip or activity. List every thing it needs as short names; the app finds which ones the person owns and where they are.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "like \"Camping, 3 days\"" },
          needs: { type: "array", items: { type: "string" }, description: "10 to 20 short names, like \"tent\"" },
        },
        required: ["title", "needs"],
      },
    },
  },
];

export function chip(item: ItemRow): ItemChip {
  return {
    id: item.id,
    name: item.name,
    imageUrl: imageUrl(item.id, item.cutout_file ?? item.original_file),
    location: locationText(item),
  };
}

function line(item: ItemRow) {
  return `[item ${item.id}] ${item.name} (${item.category}${item.is_container ? ", container" : ""}) · ${locationText(item)}`;
}

function nameList(items: ItemRow[]) {
  const names = items.slice(0, 6).map((i) => i.name);
  return items.length > 6 ? `${names.join(", ")} and ${items.length - 6} more` : names.join(", ");
}

function proposalText(summary: string) {
  return `Shown to the person as a card with an Apply button: ${summary}. Nothing changes until they apply it. Tell them it is ready to apply.`;
}

function findRoom(name: string) {
  const exact = db.prepare("select id, name from rooms where name = ? collate nocase").get(name.trim()) as
    | { id: number; name: string }
    | undefined;
  if (exact) return exact;
  const like = db.prepare("select id, name from rooms where name like ? limit 2").all(`%${name.trim()}%`) as {
    id: number;
    name: string;
  }[];
  return like.length === 1 ? like[0] : null;
}

function spotLabel(spotId: number) {
  const row = db
    .prepare(
      `select s.name, f.name as furniture_name, r.name as room_name from spots s
       join rooms r on r.id = s.room_id left join furniture f on f.id = s.furniture_id where s.id = ?`,
    )
    .get(spotId) as { name: string; furniture_name: string | null; room_name: string } | undefined;
  return row ? `${spotText(row.name, row.furniture_name)} · ${row.room_name}` : null;
}

const Search = z.object({ queries: z.array(z.string().min(1)).min(1).max(12) });
const Id = z.object({ id: z.coerce.number().int() });
const Inside = z.object({ container_id: z.coerce.number().int().optional(), spot_id: z.coerce.number().int().optional() });
const Move = z.object({
  item_ids: z.array(z.coerce.number().int()).min(1),
  container_id: z.coerce.number().int().optional(),
  spot_id: z.coerce.number().int().optional(),
  room: z.string().optional(),
});
const Update = z.object({
  item_ids: z.array(z.coerce.number().int()).min(1),
  category: z.enum(CATEGORIES).optional(),
  add_tags: z.array(z.string()).optional(),
  remove_tags: z.array(z.string()).optional(),
  would_discard: z.enum(DISCARD_LEVELS).optional(),
});
const NewSpot = z.object({ room: z.string(), name: z.string().min(1), furniture_id: z.coerce.number().int().optional() });
const Packing = z.object({
  title: z.string().min(1),
  needs: z.array(z.string()).min(1).max(30),
});

function shown(proposal: Proposal, items: ItemRow[]): ToolResult {
  return { text: proposalText(proposal.summary), status: "Prepared a change for you to approve", proposal: { proposal, items: items.map(chip) } };
}

const RUNNERS: Record<string, (args: unknown) => Promise<ToolResult>> = {
  async search_items(args) {
    const { queries } = Search.parse(args);
    const parts: string[] = [];
    for (const query of queries) {
      const { hits } = await searchItems(query, {}, 5);
      const found = hits.map((hit) => `${line(hit.item)}${hit.how === "look" ? " (only looks similar)" : ""}`);
      parts.push(`"${query}": ${found.length ? `\n${found.join("\n")}` : "no match"}`);
    }
    return { text: parts.join("\n"), status: `Searched for ${queries.join(", ")}` };
  },

  async get_item(args) {
    const { id } = Id.parse(args);
    const [item] = itemsByIds([id]);
    if (!item) return { text: `There is no item ${id}.`, status: `Looked up item ${id}` };
    const inside = item.is_container ? itemsInPlace({ containerId: item.id }) : [];
    const details = [
      line(item),
      item.description ? `description: ${item.description}` : null,
      item.color ? `color: ${item.color}` : null,
      `tags: ${parseTags(item.tags_json).join(", ") || "none"}`,
      `would discard: ${item.would_discard}`,
      item.why_kept ? `why kept: ${item.why_kept}` : null,
      item.is_container ? `holds: ${inside.length ? inside.map((i) => `[item ${i.id}] ${i.name}`).join(", ") : "nothing"}` : null,
    ];
    return { text: details.filter(Boolean).join("\n"), status: `Looked up ${item.name}` };
  },

  async list_places() {
    const tree = getPlaceTree();
    const lines: string[] = [];
    for (const room of tree.rooms) {
      lines.push(`${room.name} (room)`);
      for (const f of room.furniture) {
        lines.push(`  ${f.name}: ${f.spots.map((s) => `${s.name} [spot ${s.id}]`).join(", ")}`);
      }
      if (room.looseSpots.length) {
        lines.push(`  other spots: ${room.looseSpots.map((s) => `${s.name} [spot ${s.id}]`).join(", ")}`);
      }
    }
    lines.push(
      `containers: ${tree.containers.map((c) => `${c.name} [container ${c.id}]${c.room_name ? ` in ${c.room_name}` : ""}`).join(", ") || "none"}`,
    );
    return { text: lines.join("\n").slice(0, 2400), status: "Listed your rooms and furniture" };
  },

  async items_in(args) {
    const { container_id, spot_id } = Inside.parse(args);
    if (!container_id && !spot_id) return { text: "Give container_id or spot_id.", status: "Looked inside" };
    const items = itemsInPlace(container_id ? { containerId: container_id } : { spotId: spot_id });
    return {
      text: items.length ? items.slice(0, 40).map(line).join("\n") : "Nothing there.",
      status: `Looked inside ${container_id ? itemsByIds([container_id])[0]?.name ?? "a container" : spotLabel(spot_id ?? 0) ?? "a spot"}`,
    };
  },

  async move_items(args) {
    const input = Move.parse(args);
    const items = itemsByIds(input.item_ids);
    if (items.length === 0) return { text: "None of those item ids exist. Search first.", status: "Tried to move items" };

    let target: { roomId: number | null; spotId: number | null; containerId: number | null };
    let where: string;
    if (input.container_id) {
      const [container] = itemsByIds([input.container_id]);
      if (!container?.is_container) return { text: `Item ${input.container_id} is not a container.`, status: "Tried to move items" };
      target = { roomId: null, spotId: null, containerId: container.id };
      where = `into the ${container.name}`;
    } else if (input.spot_id) {
      const label = spotLabel(input.spot_id);
      if (!label) return { text: `There is no spot ${input.spot_id}. Call list_places.`, status: "Tried to move items" };
      target = { roomId: null, spotId: input.spot_id, containerId: null };
      where = `to ${label}`;
    } else if (input.room) {
      const room = findRoom(input.room);
      if (!room) return { text: `No room called "${input.room}". Call list_places.`, status: "Tried to move items" };
      target = { roomId: room.id, spotId: null, containerId: null };
      where = `to the ${room.name}`;
    } else {
      return { text: "Give container_id, spot_id or room.", status: "Tried to move items" };
    }
    const summary = `Move ${items.length} ${items.length === 1 ? "item" : "items"} (${nameList(items)}) ${where}`;
    return shown({ kind: "move", summary, itemIds: items.map((i) => i.id), target }, items);
  },

  async update_items(args) {
    const input = Update.parse(args);
    const items = itemsByIds(input.item_ids);
    if (items.length === 0) return { text: "None of those item ids exist. Search first.", status: "Tried to update items" };
    const changes = {
      category: input.category ?? null,
      addTags: (input.add_tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 10),
      removeTags: (input.remove_tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 10),
      wouldDiscard: input.would_discard ?? null,
    };
    const what = [
      changes.category ? `category to ${changes.category}` : null,
      changes.wouldDiscard ? `"would discard" to ${changes.wouldDiscard}` : null,
      changes.addTags.length ? `add tags ${changes.addTags.join(", ")}` : null,
      changes.removeTags.length ? `remove tags ${changes.removeTags.join(", ")}` : null,
    ].filter(Boolean);
    if (what.length === 0) return { text: "No change given.", status: "Tried to update items" };
    const summary = `Set ${what.join(", ")} on ${items.length} ${items.length === 1 ? "item" : "items"} (${nameList(items)})`;
    return shown({ kind: "update", summary, itemIds: items.map((i) => i.id), changes }, items);
  },

  async create_spot(args) {
    const input = NewSpot.parse(args);
    const room = findRoom(input.room);
    if (!room) return { text: `No room called "${input.room}".`, status: "Tried to add a spot" };
    let furniture: { id: number; name: string } | undefined;
    if (input.furniture_id) {
      furniture = db.prepare("select id, name from furniture where id = ? and room_id = ?").get(input.furniture_id, room.id) as
        | { id: number; name: string }
        | undefined;
      if (!furniture) return { text: `No furniture ${input.furniture_id} in the ${room.name}.`, status: "Tried to add a spot" };
    }
    const name = input.name.trim().toLowerCase().slice(0, 40);
    const summary = furniture
      ? `Add a compartment "${name}" to the ${furniture.name} in the ${room.name}`
      : `Add a spot "${name}" in the ${room.name}`;
    return shown({ kind: "create_spot", summary, roomId: room.id, furnitureId: furniture?.id ?? null, name }, []);
  },

  async plan_packing_list(args) {
    const input = Packing.parse(args);
    const needs = [...new Set(input.needs.map((n) => n.trim().toLowerCase()).filter(Boolean))];
    const owned = new Map<number, ItemRow>();
    const found: string[] = [];
    const missing: string[] = [];
    for (const need of needs) {
      const item = await bestMatch(need);
      if (item) {
        owned.set(item.id, item);
        found.push(`${need}: ${line(item)}`);
      } else {
        missing.push(need);
      }
    }
    const items = [...owned.values()];
    const title = input.title.trim().slice(0, 80);
    const summary = `Make the list "${title}" with ${items.length} ${items.length === 1 ? "thing" : "things"} you own${missing.length ? ` and ${missing.length} you don't` : ""}`;
    const result = shown({ kind: "packing_list", summary, title, itemIds: items.map((i) => i.id), missing }, items);
    return {
      ...result,
      status: `Checked ${needs.length} things for the trip`,
      text: `${result.text} Applying makes a checklist; it does not buy or add anything.\nOwned:\n${found.join("\n") || "none"}\nNot owned: ${missing.join(", ") || "none"}`,
    };
  },
};

export async function runTool(name: string, args: unknown): Promise<ToolResult> {
  const runner = RUNNERS[name];
  if (!runner) return { text: `There is no tool called ${name}.`, status: `Unknown tool ${name}` };
  try {
    return await runner(args ?? {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { text: `Bad arguments for ${name}: ${error.issues[0]?.message ?? "invalid"}.`, status: `Retrying ${name}` };
    }
    return { text: `${name} failed: ${error instanceof Error ? error.message : "unknown error"}`, status: `${name} failed` };
  }
}
