"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { placeSprite } from "./actions";
import type { Sprite } from "./queries";

type Position = { x: number | null; y: number | null };

type Drag = { id: number; startX: number; startY: number; x: number; y: number; moved: boolean };

const TAP_SLOP = 6;

export function PixelRoom({
  sprites,
  cols,
  rows,
  wallRows,
}: {
  sprites: Sprite[];
  cols: number;
  rows: number;
  wallRows: number;
}) {
  const [positions, setPositions] = useState(() => new Map<number, Position>(sprites.map((s) => [s.id, { x: s.x, y: s.y }])));
  const [drag, setDrag] = useState<Drag | null>(null);
  const [selected, setSelected] = useState<Sprite | null>(null);
  const [, startTransition] = useTransition();
  const grid = useRef<HTMLDivElement>(null);

  const byId = new Map(sprites.map((s) => [s.id, s]));
  const placed = sprites.filter((s) => positions.get(s.id)?.x != null);
  const tray = sprites.filter((s) => positions.get(s.id)?.x == null);

  function tileAt(clientX: number, clientY: number) {
    const rect = grid.current?.getBoundingClientRect();
    if (!rect) return null;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
    return {
      x: Math.min(cols - 1, Math.floor(((clientX - rect.left) / rect.width) * cols)),
      y: Math.min(rows - 1, Math.floor(((clientY - rect.top) / rect.height) * rows)),
    };
  }

  function occupied(x: number, y: number, except: number) {
    for (const [id, p] of positions) if (id !== except && p.x === x && p.y === y) return true;
    return false;
  }

  function move(id: number, next: Position) {
    const before = positions.get(id) ?? { x: null, y: null };
    setPositions((current) => new Map(current).set(id, next));
    startTransition(async () => {
      const result = await placeSprite(id, next.x, next.y);
      if (!result.ok) setPositions((current) => new Map(current).set(id, before));
    });
  }

  function onPointerDown(event: React.PointerEvent, sprite: Sprite) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setDrag({ id: sprite.id, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false });
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > TAP_SLOP;
    setDrag({ ...drag, x: event.clientX, y: event.clientY, moved });
  }

  function onPointerUp(event: React.PointerEvent) {
    if (!drag) return;
    const sprite = byId.get(drag.id) ?? null;
    if (!drag.moved) {
      setSelected(sprite);
    } else {
      const tile = tileAt(event.clientX, event.clientY);
      if (!tile) move(drag.id, { x: null, y: null });
      else if (tile.y >= wallRows && !occupied(tile.x, tile.y, drag.id)) move(drag.id, tile);
    }
    setDrag(null);
  }

  const tileW = 100 / cols;
  const tileH = 100 / rows;
  const dragged = drag?.moved ? byId.get(drag.id) : null;

  return (
    <div className="flex flex-col gap-4 select-none" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div
        ref={grid}
        className="relative w-full overflow-hidden rounded-xl border-4 border-ink"
        style={{
          aspectRatio: `${cols} / ${rows}`,
          backgroundImage: [
            `linear-gradient(to bottom, #8c6a4f 0, #8c6a4f ${wallRows * tileH - 1.5}%, #5b4433 ${wallRows * tileH - 1.5}%, #5b4433 ${wallRows * tileH}%, transparent ${wallRows * tileH}%)`,
            "conic-gradient(#d9c7a3 25%, #cdb68d 0 50%, #d9c7a3 0 75%, #cdb68d 0)",
          ].join(", "),
          backgroundSize: `100% 100%, ${tileW * 2}% ${tileH * 2}%`,
        }}
      >
        {placed.map((sprite) => {
          const p = positions.get(sprite.id)!;
          const hidden = dragged?.id === sprite.id;
          return (
            <button
              key={sprite.id}
              type="button"
              title={sprite.name}
              onPointerDown={(event) => onPointerDown(event, sprite)}
              className={`absolute touch-none cursor-grab ${hidden ? "opacity-30" : ""} ${selected?.id === sprite.id ? "outline-2 outline-accent" : ""}`}
              style={{ left: `${(p.x ?? 0) * tileW}%`, top: `${(p.y ?? 0) * tileH}%`, width: `${tileW}%`, height: `${tileH}%` }}
            >
              <SpriteImage sprite={sprite} />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-wide text-soft">
          Not placed yet ({tray.length}) · drag onto the floor, drag off the room to put back here
        </p>
        <div className="flex min-h-16 flex-wrap gap-1 rounded-xl border border-dashed border-line p-2">
          {tray.map((sprite) => (
            <button
              key={sprite.id}
              type="button"
              title={sprite.name}
              onPointerDown={(event) => onPointerDown(event, sprite)}
              className={`size-12 touch-none cursor-grab ${dragged?.id === sprite.id ? "opacity-30" : ""}`}
            >
              <SpriteImage sprite={sprite} />
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <p className="text-sm">
          <Link href={`/app/items/${selected.id}`} className="font-medium underline underline-offset-4">
            {selected.name}
          </Link>
          {selected.place ? <span className="text-soft"> · {selected.place}</span> : null}
        </p>
      ) : (
        <p className="text-sm text-soft">Tap a sprite to see what it is.</p>
      )}

      {dragged && drag ? (
        <div className="pointer-events-none fixed z-50 size-14 -translate-x-1/2 -translate-y-1/2" style={{ left: drag.x, top: drag.y }}>
          <SpriteImage sprite={dragged} />
        </div>
      ) : null}
    </div>
  );
}

function SpriteImage({ sprite }: { sprite: Sprite }) {
  return sprite.src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sprite.src} alt={sprite.name} draggable={false} className="pixelated h-full w-full object-contain" />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-ink font-mono text-[9px] text-paper">
      {sprite.name.slice(0, 2)}
    </span>
  );
}
