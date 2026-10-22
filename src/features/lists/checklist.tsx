"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { removeFromList, setChecked } from "./actions";

export type ChecklistGroup = {
  label: string;
  items: { id: number; name: string; imageUrl: string | null; detail: string | null; checked: boolean }[];
};

export function Checklist({ listId, groups }: { listId: number; groups: ChecklistGroup[] }) {
  const [, startTransition] = useTransition();
  const [checks, setOptimistic] = useOptimistic(
    new Map(groups.flatMap((g) => g.items.map((i) => [i.id, i.checked] as const))),
    (current, change: { id: number; checked: boolean }) => new Map(current).set(change.id, change.checked),
  );

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.label} className="flex flex-col gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-soft">{group.label}</h2>
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-card">
            {group.items.map((item) => {
              const checked = checks.get(item.id) ?? false;
              return (
                <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-label={`Packed ${item.name}`}
                    onChange={(event) => {
                      const next = event.target.checked;
                      startTransition(async () => {
                        setOptimistic({ id: item.id, checked: next });
                        await setChecked(listId, item.id, next);
                      });
                    }}
                    className="size-5 shrink-0 accent-[var(--accent)]"
                  />
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="size-10 shrink-0 rounded-lg object-contain" />
                  ) : null}
                  <Link href={`/app/items/${item.id}`} className={`min-w-0 flex-1 ${checked ? "text-soft line-through" : ""}`}>
                    <span className="block truncate text-sm">{item.name}</span>
                    {item.detail ? <span className="block truncate font-mono text-[11px] text-soft">{item.detail}</span> : null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => startTransition(() => removeFromList(listId, item.id))}
                    aria-label={`Remove ${item.name} from the list`}
                    className="rounded-full px-2 py-1 text-xs text-soft hover:bg-paper"
                  >
                    remove
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
