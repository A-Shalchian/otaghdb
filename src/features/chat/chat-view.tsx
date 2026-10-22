"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { fieldClass, primaryButton, secondaryButton } from "@/components/form";
import { applyProposalAction } from "./actions";
import type { ChatEvent, ChatTurn } from "./agent";
import type { ItemChip, ShownProposal } from "./proposals";

type ProposalState = {
  shown: ShownProposal;
  state: "open" | "applying" | "applied" | "dismissed" | "failed";
  message?: string;
  href?: string;
};

type Bubble = {
  id: number;
  role: "user" | "assistant";
  text: string;
  statuses: string[];
  items: ItemChip[];
  proposals: ProposalState[];
  pending: boolean;
};

const SUGGESTIONS = [
  "Where is my passport?",
  "What is in the navy backpack?",
  "Mark every cable as maybe",
  "I'm going camping for 3 days",
];

function ItemChips({ items }: { items: ItemChip[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {items.slice(0, 8).map((item) => (
        <li key={item.id}>
          <Link
            href={`/app/items/${item.id}`}
            className="flex max-w-64 items-center gap-2 rounded-xl border border-line bg-paper p-1.5 pr-3 hover:border-ink"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="size-10 shrink-0 rounded-lg object-contain" />
            ) : null}
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{item.name}</span>
              <span className="block truncate font-mono text-[10px] text-soft">{item.location}</span>
            </span>
          </Link>
        </li>
      ))}
      {items.length > 8 ? <li className="self-center font-mono text-[11px] text-soft">+{items.length - 8} more</li> : null}
    </ul>
  );
}

function ProposalCard({ value, onApply, onDismiss }: { value: ProposalState; onApply: () => void; onDismiss: () => void }) {
  const { proposal, items } = value.shown;
  return (
    <div className="mt-3 rounded-2xl border border-accent/60 bg-paper p-3">
      <p className="font-mono text-[11px] uppercase tracking-wide text-accent">Needs your OK</p>
      <p className="mt-1 text-sm">{proposal.summary}.</p>
      <ItemChips items={items} />
      {proposal.kind === "packing_list" && proposal.missing.length > 0 ? (
        <p className="mt-2 text-xs text-soft">You don&apos;t own: {proposal.missing.join(", ")}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {value.state === "open" || value.state === "applying" || value.state === "failed" ? (
          <>
            <button type="button" onClick={onApply} disabled={value.state === "applying"} className={primaryButton}>
              {value.state === "applying" ? "Applying..." : "Apply"}
            </button>
            <button type="button" onClick={onDismiss} disabled={value.state === "applying"} className={secondaryButton}>
              Dismiss
            </button>
          </>
        ) : null}
        {value.state === "dismissed" ? <span className="text-xs text-soft">Dismissed. Nothing changed.</span> : null}
        {value.message ? <span className="text-sm">{value.message}</span> : null}
        {value.href && value.state === "applied" ? (
          <Link href={value.href} className="text-sm underline underline-offset-4">
            Open it
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function ChatView() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const nextId = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);

  function patch(id: number, change: (bubble: Bubble) => Bubble) {
    setBubbles((current) => current.map((b) => (b.id === id ? change(b) : b)));
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);

    const history: ChatTurn[] = [
      ...bubbles.filter((b) => !b.pending && b.text).map((b) => ({ role: b.role, content: b.text })),
      { role: "user", content: question },
    ];
    const userId = nextId.current++;
    const replyId = nextId.current++;
    const empty = { statuses: [], items: [], proposals: [] };
    setBubbles((current) => [
      ...current,
      { id: userId, role: "user", text: question, pending: false, ...empty },
      { id: replyId, role: "assistant", text: "", pending: true, ...empty },
    ]);
    requestAnimationFrame(() => bottom.current?.scrollIntoView({ behavior: "smooth" }));

    const apply = (event: ChatEvent) => {
      patch(replyId, (b) => {
        if (event.type === "status") return { ...b, statuses: [...b.statuses, event.text] };
        if (event.type === "proposal") return { ...b, proposals: [...b.proposals, { shown: event.proposal, state: "open" }] };
        if (event.type === "answer") return { ...b, text: event.text, items: event.items, pending: false };
        return { ...b, text: event.text, pending: false };
      });
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) apply(JSON.parse(line) as ChatEvent);
      }
    } catch {
      apply({ type: "error", text: "Could not reach the app server." });
    }
    patch(replyId, (b) => ({ ...b, pending: false }));
    setBusy(false);
    requestAnimationFrame(() => bottom.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function setProposal(bubbleId: number, index: number, change: Partial<ProposalState>) {
    patch(bubbleId, (b) => ({
      ...b,
      proposals: b.proposals.map((p, i) => (i === index ? { ...p, ...change } : p)),
    }));
  }

  function applyOne(bubbleId: number, index: number, proposal: ProposalState) {
    setProposal(bubbleId, index, { state: "applying", message: undefined });
    startTransition(async () => {
      const result = await applyProposalAction(proposal.shown.proposal);
      setProposal(
        bubbleId,
        index,
        result.ok
          ? { state: "applied", message: result.message, href: result.href }
          : { state: "failed", message: result.error },
      );
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {bubbles.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-soft">
            Ask where something is, what is inside something, or ask for a change. Changes show as a card you approve.
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className={secondaryButton}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ol className="flex flex-col gap-4">
        {bubbles.map((b) => (
          <li key={b.id} className={b.role === "user" ? "self-end" : "self-start w-full"}>
            {b.role === "user" ? (
              <p className="rounded-2xl bg-ink px-4 py-2.5 text-sm text-paper">{b.text}</p>
            ) : (
              <div className="rounded-2xl border border-line bg-card px-4 py-3">
                {b.statuses.length ? (
                  <ul className="mb-2 flex flex-col gap-0.5 font-mono text-[11px] text-soft">
                    {b.statuses.map((s, i) => (
                      <li key={i}>
                        {s}
                        {b.pending && i === b.statuses.length - 1 ? "..." : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {b.text ? <p className="whitespace-pre-wrap text-sm">{b.text}</p> : null}
                <ItemChips items={b.items} />
                {b.proposals.map((p, i) => (
                  <ProposalCard
                    key={i}
                    value={p}
                    onApply={() => applyOne(b.id, i, p)}
                    onDismiss={() => setProposal(b.id, i, { state: "dismissed" })}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <div ref={bottom} />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="sticky bottom-4 flex gap-2 rounded-2xl border border-line bg-paper p-2 shadow-sm"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Where is my passport?"
          aria-label="Ask about your things"
          maxLength={500}
          className={fieldClass}
        />
        <button type="submit" disabled={busy || !input.trim()} className={primaryButton}>
          {busy ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
