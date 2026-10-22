import Link from "next/link";
import type { RoomSummary } from "@/features/items/queries";

function Tab({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line hover:bg-card"
      }`}
    >
      {label}
      <span className={`font-mono text-[11px] ${active ? "text-paper/70" : "text-soft"}`}>{count}</span>
    </Link>
  );
}

export function RoomTabs({
  rooms,
  activeId,
  total,
}: {
  rooms: RoomSummary[];
  activeId: number | null;
  total: number;
}) {
  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Tab href="/app" label="All" count={total} active={activeId === null} />
      {rooms.map((room) => (
        <Tab
          key={room.id}
          href={`/app?room=${room.id}`}
          label={room.name}
          count={room.item_count}
          active={room.id === activeId}
        />
      ))}
    </nav>
  );
}
