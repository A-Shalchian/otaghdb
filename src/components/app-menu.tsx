"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const LINKS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/app",
    label: "Everything",
    icon: <path {...stroke} d="M3 4h5v5H3zM12 4h5v5h-5zM3 13h5v5H3zM12 13h5v5h-5z" />,
  },
  {
    href: "/app/closet",
    label: "Closet",
    icon: <path {...stroke} d="M4 3h12v15H4zM10 3v15M8 10v1M12 10v1" />,
  },
  {
    href: "/app/ask",
    label: "Ask",
    icon: <path {...stroke} d="M4 4h12v9H9l-4 3v-3H4z" />,
  },
  {
    href: "/app/check",
    label: "Do I own this?",
    icon: <path {...stroke} d="M8.5 15a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM13 13l4 4M6 9l2 2 3-4" />,
  },
  {
    href: "/app/lists",
    label: "Lists",
    icon: <path {...stroke} d="M8 5h9M8 10h9M8 15h9M3.5 5h.01M3.5 10h.01M3.5 15h.01" />,
  },
  {
    href: "/app/phone",
    label: "Phone",
    icon: <path {...stroke} d="M6 2.5h8v15H6zM9 14.5h2" />,
  },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

export function AppMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LINKS.find((link) => isActive(pathname, link.href));

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-sm transition-colors ${
          open ? "border-accent" : "border-line hover:border-accent"
        }`}
      >
        <span className="grid size-8 place-items-center rounded-full bg-tile text-accent">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px]">
            <path {...stroke} d="M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3.5 17.5a6.5 6.5 0 0 1 13 0" />
          </svg>
        </span>
        <span className="hidden sm:inline">{current?.label ?? "Menu"}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true" className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-line bg-card p-1.5 shadow-xl"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-sm font-semibold">Your home</p>
            <p className="text-xs text-soft">Everything runs on this laptop.</p>
          </div>
          <div className="border-t border-line pt-1.5">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                    active ? "bg-tile font-semibold" : "hover:bg-tile"
                  }`}
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true" className={`size-[18px] ${active ? "text-accent" : "text-soft"}`}>
                    {link.icon}
                  </svg>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
