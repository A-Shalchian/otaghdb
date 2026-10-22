"use client";

import { useEffect, useState } from "react";

type Field = { label: string; value: string };

export function TypedFields({ fields }: { fields: Field[] }) {
  const starts = fields.map((_, index) =>
    fields.slice(0, index).reduce((sum, field) => sum + field.value.length, 0),
  );
  const total = fields.reduce((sum, field) => sum + field.value.length, 0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let typed = 0;
    let timer = 0;
    const delay = window.setTimeout(() => {
      timer = window.setInterval(() => {
        typed += 1;
        setCount(typed);
        if (typed >= total) window.clearInterval(timer);
      }, 42);
    }, 450);
    return () => {
      window.clearTimeout(delay);
      window.clearInterval(timer);
    };
  }, [total]);

  return (
    <dl>
      {fields.map((field, index) => {
        const start = starts[index];
        const shown = Math.min(Math.max(count - start, 0), field.value.length);
        const typing = count >= start && count < start + field.value.length;
        return (
          <div
            key={field.label}
            className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[8.5rem_minmax(0,1fr)]"
          >
            <dt className="font-plex text-[11px] leading-7 text-[#5B6577]">{field.label}</dt>
            <dd className="font-typewriter text-[15px] leading-7 sm:text-base">
              {field.value.slice(0, shown)}
              {typing ? (
                <span aria-hidden className="relative">
                  <span className="catalog-caret absolute bottom-[-0.2em] left-0 h-[1.1em] w-[0.5em] bg-[#1F2430] motion-reduce:hidden" />
                </span>
              ) : null}
              <span className="motion-safe:opacity-0">{field.value.slice(shown)}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
