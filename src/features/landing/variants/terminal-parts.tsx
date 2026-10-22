"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { answer, sampleItems } from "../content";

type Tone = "table" | "dim" | "reply";

type Segment =
  | { kind: "command"; text: string }
  | { kind: "output"; lines: string[]; tone: Tone };

type Step =
  | { kind: "command"; text: string; from: number; start: number; end: number }
  | { kind: "output"; lines: string[]; tone: Tone; from: number; end: number };

const item = sampleItems.find((entry) => entry.object === "passport") ?? sampleItems[0];

function asciiTable(header: string[], rows: string[][]) {
  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...rows.map((row) => row[column].length)),
  );
  const rule = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
  const line = (cells: string[]) =>
    `| ${cells.map((cell, column) => cell.padEnd(widths[column])).join(" | ")} |`;
  return [rule, line(header), rule, ...rows.map(line), rule];
}

const segments: Segment[] = [
  {
    kind: "command",
    text: `select name, spot, room from items where name like '%${item.name}%';`,
  },
  {
    kind: "output",
    tone: "table",
    lines: asciiTable(["name", "spot", "room"], [[item.name, item.spot, item.room]]),
  },
  { kind: "output", tone: "dim", lines: ["1 row"] },
  { kind: "command", text: `ask "${answer.question}"` },
  { kind: "output", tone: "reply", lines: [answer.reply] },
  { kind: "output", tone: "dim", lines: ["answered by qwen3.5 on this laptop"] },
  { kind: "command", text: "" },
];

function schedule(list: Segment[]) {
  const timeline: Step[] = [];
  let clock = 0;
  for (const segment of list) {
    if (segment.kind === "command") {
      const start = clock + 16;
      const end = start + segment.text.length;
      timeline.push({ ...segment, from: clock, start, end });
      clock = end + 12;
    } else {
      const end = clock + segment.lines.length * 2;
      timeline.push({ ...segment, from: clock, end });
      clock = end + 6;
    }
  }
  return { timeline, total: timeline[timeline.length - 1].from };
}

const { timeline, total } = schedule(segments);

const toneClass: Record<Tone, string> = {
  table: "whitespace-pre",
  dim: "text-[#c48d14] [text-shadow:none]",
  reply: "whitespace-pre-wrap text-[#ffd073]",
};

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
}

function Cursor() {
  return (
    <span className="terminal-cursor ml-px inline-block h-[0.85em] w-[0.5em] translate-y-[0.1em] bg-[#ffb000]" />
  );
}

function Transcript({ at, className }: { at: number; className: string }) {
  const last = timeline.findLastIndex((step) => step.from <= at);
  return (
    <div aria-hidden className={className}>
      {timeline.map((step, index) => {
        if (step.from > at) return null;
        if (step.kind === "command") {
          const typed = step.text.slice(0, Math.max(0, at - step.start));
          return (
            <p
              key={index}
              className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${index > 0 ? "mt-[1.2em]" : ""}`}
            >
              <span className="text-[#c48d14]">otagh&gt; </span>
              {typed}
              {index === last ? <Cursor /> : null}
            </p>
          );
        }
        const count = Math.min(step.lines.length, Math.floor((at - step.from) / 2) + 1);
        return (
          <div key={index} className={toneClass[step.tone]}>
            {step.lines.slice(0, count).map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function TerminalSession() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced || tick >= total) return;
    const delay = 26 + ((tick * 7) % 5) * 9;
    const id = window.setTimeout(() => setTick((value) => value + 1), delay);
    return () => window.clearTimeout(id);
  }, [reduced, tick]);

  const now = reduced ? total : tick;

  return (
    <>
      <div className="grid">
        <Transcript at={total} className="invisible col-start-1 row-start-1" />
        <Transcript at={now} className="col-start-1 row-start-1" />
      </div>
      <div className="sr-only">
        <p>
          Query: select name, spot, room from items where name like passport. Result: {item.name},{" "}
          {item.spot}, {item.room}.
        </p>
        <p>
          Question: {answer.question} Answer: {answer.reply}
        </p>
      </div>
    </>
  );
}
