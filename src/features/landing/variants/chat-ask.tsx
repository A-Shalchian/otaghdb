"use client";

import { memo, useEffect, useState, useSyncExternalStore } from "react";
import { sampleItems, stats, type SampleItem } from "../content";
import { ObjectArt } from "../objects";
import { SendIcon } from "./chat-parts";

const QUESTIONS = [
  { itemId: 42, text: "where is my passport?" },
  { itemId: 23, text: "where are my house keys?" },
  { itemId: 31, text: "where's the usb-c cable?" },
  { itemId: 77, text: "where did I leave my sunglasses?" },
  { itemId: 12, text: "where is my wallet?" },
  { itemId: 54, text: "where are the wired headphones?" },
  { itemId: 61, text: "where is the blue mug?" },
  { itemId: 8, text: "where's my grey hoodie?" },
];

const HOLD_AFTER_WRITTEN_MS = 2000;

type Question = { item: SampleItem; text: string };
type Phase = "typing" | "holding" | "erasing";

const asked: Question[] = QUESTIONS.flatMap(({ itemId, text }) => {
  const item = sampleItems.find((entry) => entry.id === itemId);
  return item ? [{ item, text }] : [];
});

const longest = asked.reduce((a, b) => (b.text.length > a.text.length ? b : a)).text;

function spotPhrase(spot: string) {
  return /drawer|cabinet|cup/.test(spot) ? `in the ${spot}` : `on the ${spot}`;
}

function replyFor(item: SampleItem) {
  const parts = [item.container ? `in the ${item.container}` : null, spotPhrase(item.spot), `in the ${item.room}`];
  const text = parts.filter(Boolean).join(", ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

function pathFor(item: SampleItem) {
  return [
    { kind: "room", value: item.room },
    { kind: "spot", value: item.spot },
    ...(item.container ? [{ kind: "container", value: item.container }] : []),
    { kind: "thing", value: item.name },
  ];
}

function stepDelay(phase: Phase, typed: number, length: number) {
  if (phase === "holding") return HOLD_AFTER_WRITTEN_MS;
  if (phase === "erasing") return typed === 0 ? 350 : 22;
  if (typed === 0) return 450;
  if (typed === length) return 120;
  return 38 + ((typed * 7) % 5) * 10;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

function Answer({ question, active }: { question: Question; active: boolean }) {
  const { item } = question;
  const rise = active ? "chat-rise" : "";
  const path = pathFor(item);
  const containerObject = sampleItems.find((entry) => entry.name === item.container)?.object;

  return (
    <div>
      <p className={`${rise} flex items-center gap-2 text-sm text-[#4f5b69]`}>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
          <path d="m3 8.5 3 3 7-7" fill="none" stroke="#3d4f8f" strokeWidth="2" />
        </svg>
        Looked through {stats.items} things in {stats.rooms} rooms
      </p>
      <p
        className={`${rise} mt-3 max-w-[24ch] text-[1.7rem] font-semibold leading-tight tracking-tight sm:text-4xl`}
        style={{ animationDelay: "0.15s" }}
      >
        {replyFor(item)}
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr] md:items-start">
        <div
          className={`${rise} w-full max-w-[240px] rounded-[18px] border border-[#c4ceda] bg-[#f6f8fa] p-4 md:max-w-none`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="grid aspect-square place-items-center rounded-[12px] bg-[#e1e7ef]">
            <ObjectArt name={item.object} className="size-3/4" />
          </div>
          <p className="mt-3 text-lg font-semibold">{item.name}</p>
          <p className="text-sm text-[#4f5b69]">{item.category}</p>
          <p className="text-sm text-[#4f5b69]">Kept because: {item.kept}</p>
        </div>
        <ol aria-label="Where it is" className="grid md:mt-6 md:auto-cols-fr md:grid-flow-col">
          {path.map((node, index) => (
            <li
              key={node.kind}
              className={`${rise} relative border-l-2 border-[#9fb0d6] pb-6 pl-6 last:border-transparent last:pb-0 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pr-4 md:pt-6`}
              style={{ animationDelay: `${0.45 + index * 0.12}s` }}
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[8px] top-0 size-3.5 rounded-full border-2 border-[#3d4f8f] md:-top-[8px] md:left-0 ${
                  index === path.length - 1 ? "bg-[#3d4f8f]" : "bg-[#e8ecf1]"
                }`}
              />
              <span className="block text-sm text-[#4f5b69]">{node.kind}</span>
              <span className="mt-0.5 flex items-center gap-2 text-lg font-semibold leading-tight">
                {node.kind === "container" && containerObject ? (
                  <span aria-hidden="true">
                    <ObjectArt name={containerObject} className="size-7" />
                  </span>
                ) : null}
                {node.value}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const AnswerStack = memo(function AnswerStack({ answerIndex }: { answerIndex: number | null }) {
  return (
    <div className="mt-8 grid">
      {asked.map((question, questionIndex) => (
        <div
          key={question.item.id}
          aria-hidden={questionIndex !== answerIndex}
          className={`col-start-1 row-start-1 ${questionIndex === answerIndex ? "" : "invisible"}`}
        >
          <Answer question={question} active={questionIndex === answerIndex} />
        </div>
      ))}
    </div>
  );
});

export function AskLoop() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const length = asked[index].text.length;
    const timer = window.setTimeout(() => {
      if (phase === "typing") {
        if (typed < length) {
          setTyped(typed + 1);
        } else {
          setShown(index);
          setPhase("holding");
        }
      } else if (phase === "holding") {
        setPhase("erasing");
      } else if (typed > 0) {
        setTyped(typed - 1);
      } else {
        setIndex((index + 1) % asked.length);
        setPhase("typing");
      }
    }, stepDelay(phase, typed, length));
    return () => window.clearTimeout(timer);
  }, [reduced, index, typed, phase]);

  const visibleText = reduced ? asked[0].text : asked[index].text.slice(0, typed);
  const answerIndex = reduced ? 0 : shown;
  const blinking = reduced || phase === "holding";

  return (
    <>
      <div className="flex items-center gap-3 rounded-[28px] border border-[#c4ceda] bg-[#f6f8fa] py-2 pl-5 pr-2 sm:pl-7">
        <h2 className="min-w-0 flex-1 py-2 text-[1.35rem] font-semibold leading-tight tracking-tight sm:text-[2.5rem]">
          <span className="sr-only">Ask anything, for example: {asked[0].text}</span>
          <span aria-hidden="true" className="grid">
            <span className="invisible col-start-1 row-start-1">{longest}</span>
            <span className="col-start-1 row-start-1">
              {visibleText}
              <span
                className={`${blinking ? "chat-caret" : ""} ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] bg-[#3d4f8f]`}
              />
            </span>
          </span>
        </h2>
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#3d4f8f] text-white sm:size-14"
        >
          <SendIcon />
        </span>
      </div>
      <AnswerStack answerIndex={answerIndex} />
    </>
  );
}
