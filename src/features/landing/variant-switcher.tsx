"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Option = { slug: string; name: string };

export function VariantSwitcher({ options, current }: { options: Option[]; current: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const index = Math.max(
    0,
    options.findIndex((option) => option.slug === current),
  );

  useEffect(() => {
    const go = (step: number) => {
      const next = options[(index + step + options.length) % options.length];
      router.replace(`/?v=${next.slug}`);
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, options, router]);

  const step = (delta: number) => {
    const next = options[(index + delta + options.length) % options.length];
    setOpen(false);
    router.replace(`/?v=${next.slug}`);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[1000] flex justify-center px-3 font-sans">
      <div className="pointer-events-auto relative flex items-center gap-1 rounded-full bg-black/85 p-1 text-white shadow-lg backdrop-blur">
        {open ? (
          <ul className="absolute bottom-full left-1/2 mb-2 max-h-[60vh] w-56 -translate-x-1/2 overflow-y-auto rounded-2xl bg-black/90 p-1.5 backdrop-blur">
            {options.map((option, optionIndex) => (
              <li key={option.slug}>
                <button
                  type="button"
                  onClick={() => step(optionIndex - index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    optionIndex === index ? "bg-white text-black" : "hover:bg-white/10"
                  }`}
                >
                  <span className="w-5 text-right tabular-nums opacity-60">{optionIndex + 1}</span>
                  {option.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous design"
          className="flex size-9 items-center justify-center rounded-full hover:bg-white/15"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-40 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-white/15"
        >
          <span className="tabular-nums opacity-60">
            {index + 1}/{options.length}
          </span>
          {options[index]?.name}
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next design"
          className="flex size-9 items-center justify-center rounded-full hover:bg-white/15"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
