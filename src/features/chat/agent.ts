import { itemsByIds } from "@/features/items/queries";
import { chat, type ChatMessage } from "@/lib/ollama";
import type { ItemChip, ShownProposal } from "./proposals";
import { chip, runTool, TOOL_DEFINITIONS } from "./tools";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatEvent =
  | { type: "status"; text: string }
  | { type: "proposal"; proposal: ShownProposal }
  | { type: "answer"; text: string; items: ItemChip[] }
  | { type: "error"; text: string };

const SYSTEM = `You are the assistant inside OtaghDB, one person's home inventory. They photographed their things and filed each one under a room, a piece of furniture and its compartment (like "closet, top shelf"), and sometimes a container (a bag or box that is itself an item).

How to work:
- Always use tools to look things up. Never guess where something is or what exists.
- search_items takes several short searches at once. Use it before mentioning any item.
- To change anything, call move_items, update_items, create_spot or plan_packing_list. These only prepare a card the person approves. Never say you already did it; say it is ready to apply.
- For "move everything in X": find X with search_items, then items_in with its container_id or spot_id, then list_places to find the target spot_id, then move_items.
- For a trip or activity: call plan_packing_list once with a short title and every thing it needs. Do not search first.

How to answer:
- One to three short sentences of plain text.
- Every time you mention an item, put its id in double brackets right after its name, like "passport [[12]]".
- Say where things are with the place from the results, like "in the navy backpack, closet, top shelf, bedroom".`;

const MAX_ROUNDS = 6;

// The tool definitions take about 1,000 of the 4,096 tokens and the answer
// needs a few hundred, so messages get roughly 8,000 characters.
const MESSAGE_BUDGET_CHARS = 8000;

function trimHistory(history: ChatTurn[]): ChatMessage[] {
  return history.slice(-6).map((turn) => ({ role: turn.role, content: turn.content.slice(0, 600) }));
}

function fitToBudget(messages: ChatMessage[]) {
  const size = () => messages.reduce((sum, m) => sum + m.content.length + JSON.stringify(m.tool_calls ?? "").length, 0);
  for (const message of messages) {
    if (size() <= MESSAGE_BUDGET_CHARS) return;
    if (message.role === "tool" && message.content.length > 80) {
      message.content = `${message.content.slice(0, 60)}... (older result trimmed)`;
    }
  }
}

function parseArguments(raw: unknown) {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const MARKER = /\s*\[\[\s*(\d+)\s*\]\]|\s*\[item (\d+)\]/g;

function finish(content: string, emit: (event: ChatEvent) => void) {
  const ids: number[] = [];
  for (const match of content.matchAll(MARKER)) {
    const id = Number(match[1] ?? match[2]);
    if (!ids.includes(id)) ids.push(id);
  }
  const items = itemsByIds(ids.slice(0, 12)).map(chip);
  const text = content.replace(MARKER, "").trim() || "I could not find an answer to that.";
  emit({ type: "answer", text, items });
}

export async function runAgent(history: ChatTurn[], emit: (event: ChatEvent) => void, signal?: AbortSignal) {
  const messages: ChatMessage[] = [{ role: "system", content: SYSTEM }, ...trimHistory(history)];
  emit({ type: "status", text: "Thinking" });

  for (let round = 0; round < MAX_ROUNDS; round++) {
    if (signal?.aborted) return;
    fitToBudget(messages);
    const reply = await chat({ messages, tools: TOOL_DEFINITIONS });
    const calls = reply.tool_calls ?? [];
    if (calls.length === 0) return finish(reply.content ?? "", emit);

    messages.push({ role: "assistant", content: reply.content ?? "", tool_calls: calls });
    for (const call of calls) {
      const result = await runTool(call.function.name, parseArguments(call.function.arguments));
      emit({ type: "status", text: result.status });
      if (result.proposal) emit({ type: "proposal", proposal: result.proposal });
      messages.push({ role: "tool", tool_name: call.function.name, content: result.text });
    }
  }

  if (signal?.aborted) return;
  fitToBudget(messages);
  const reply = await chat({
    messages: [...messages, { role: "user", content: "Answer now with what you found. Do not call tools." }],
  });
  finish(reply.content ?? "", emit);
}
