export const fieldClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none placeholder:text-soft focus:border-ink disabled:opacity-60";

export const primaryButton =
  "rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-85 disabled:opacity-50";

export const secondaryButton =
  "rounded-full border border-line px-4 py-2 text-sm transition-colors hover:bg-card disabled:opacity-50";

export const monoLabel = "font-mono text-[11px] uppercase tracking-wide text-soft";

export function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={monoLabel}>{text}</span>
      {children}
    </label>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-red-700">
      {children}
    </p>
  );
}
