"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ label, children }: { label: string; children: ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const skipNextClose = useRef(false);

  // Next keeps visited routes alive but hidden, so this effect also runs when the
  // modal is hidden and shown again. Closing on hide keeps the dialog out of the top
  // layer; that close is ours, not the user's, so it must not navigate back.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!element.open) element.showModal();
    return () => {
      if (element.open) {
        skipNextClose.current = true;
        element.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={() => {
        if (skipNextClose.current) {
          skipNextClose.current = false;
          return;
        }
        router.back();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close();
      }}
      className="m-auto max-h-[calc(100svh-2rem)] w-[min(56rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-[#18212c]/45"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => dialog.current?.close()}
        className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-card/90 text-soft hover:text-ink"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
          <path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {children}
    </dialog>
  );
}
