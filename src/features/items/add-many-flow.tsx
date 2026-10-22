"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { ErrorText, fieldClass, monoLabel, primaryButton } from "@/components/form";
import { CATEGORIES, CLOTHING_TYPES } from "@/lib/categories";
import type { PlaceTree } from "@/lib/places";
import { PhotoButton } from "@/components/photo-button";
import { PlacePicker } from "./place-picker";
import type { SceneCandidate } from "./scene";
import { saveScene, type SceneSaveState } from "./scene-actions";

type Row = SceneCandidate & { include: boolean };

type Phase = "idle" | "detecting" | "adding" | "ready";

const initialState: SceneSaveState = { error: null };

function mostCommon(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other";
}

export function AddManyFlow({ tree, defaultRoomId }: { tree: PlaceTree; defaultRoomId: number | null }) {
  const [state, formAction, saving] = useActionState(saveScene, initialState);
  const [phase, setPhase] = useState<Phase>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [rows, setRows] = useState<Row[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  const included = rows.filter((row) => row.include);

  function update(n: number, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.n === n ? { ...row, ...patch } : row)));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhase("detecting");
    setRows([]);
    setToken(null);
    setNotice(null);
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch("/api/scenes/analyze", { method: "POST", body: form }).catch(() => null);
    const result = (await res?.json().catch(() => null)) as
      | { token?: string; width: number; height: number; candidates: SceneCandidate[]; warning: string | null; error?: string }
      | null;
    if (!result?.token) {
      setNotice(result?.error ?? "Could not upload that photo.");
      setPhase("idle");
      return;
    }
    setToken(result.token);
    setSize({ width: result.width, height: result.height });
    setRows(result.candidates.map((c) => ({ ...c, include: true })));
    setNotice(
      result.warning ??
        (result.candidates.length
          ? `Found ${result.candidates.length}. Untick mistakes, fix names, tap the photo for anything missed.`
          : "Found nothing. Tap each thing on the photo to add it."),
    );
    setPhase("ready");
  }

  async function onTap(event: React.MouseEvent<HTMLImageElement>) {
    const img = photoRef.current;
    if (!img || !token || phase !== "ready") return;
    const rect = img.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * img.naturalHeight);
    setPhase("adding");
    const res = await fetch("/api/scenes/point", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, x, y }),
    }).catch(() => null);
    const result = (await res?.json().catch(() => null)) as { candidate?: SceneCandidate; error?: string } | null;
    if (result?.candidate) {
      const added = result.candidate;
      setRows((current) => [...current, { ...added, include: true }]);
      setNotice(`Added ${added.name}.`);
    } else {
      setNotice(result?.error ?? "Could not add that.");
    }
    setPhase("ready");
  }

  const busy = phase === "detecting" || phase === "adding";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="mt-8 flex flex-col gap-8"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-3">
          {token ? (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={photoRef}
                src={`/staging/${token}/scene.jpg`}
                alt="Your photo. Tap anything that was missed."
                onClick={onTap}
                className={`block h-auto w-full ${phase === "ready" ? "cursor-crosshair" : ""}`}
              />
              {rows.map((row, index) => (
                <span
                  key={row.n}
                  className={`pointer-events-none absolute rounded-md border-2 ${
                    row.include ? "border-accent" : "border-dashed border-soft/60"
                  }`}
                  style={{
                    left: `${(row.box[0] / size.width) * 100}%`,
                    top: `${(row.box[1] / size.height) * 100}%`,
                    width: `${((row.box[2] - row.box[0]) / size.width) * 100}%`,
                    height: `${((row.box[3] - row.box[1]) / size.height) * 100}%`,
                  }}
                >
                  <span className="absolute -left-0.5 -top-0.5 rounded-br-md bg-accent px-1.5 font-mono text-[10px] text-paper">
                    {index + 1}
                  </span>
                </span>
              ))}
              {busy ? (
                <div className="absolute inset-x-3 bottom-3 rounded-xl bg-paper/90 px-3 py-2 text-xs">
                  {phase === "adding" ? "Cutting out and naming what you tapped..." : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-card px-6 text-center">
              <p className="text-sm font-medium">
                {phase === "detecting" ? "Finding everything in the photo..." : "Photograph an open drawer, a shelf or a desk"}
              </p>
              <p className="font-mono text-[11px] text-soft">
                {phase === "detecting"
                  ? "Qwen finds each thing, SAM cuts each one out. About 10 seconds."
                  : "Spread things out a little so each one is visible."}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <PhotoButton label="Take photo" capture onPick={onPhoto} disabled={busy} />
            <PhotoButton label={token ? "Start over with another photo" : "Choose photo"} onPick={onPhoto} disabled={busy} />
          </div>
          {notice ? <p className="text-xs text-soft">{notice}</p> : null}
        </div>

        <div className="flex flex-col gap-4">
          <p className={monoLabel}>Where all of these go</p>
          <PlacePicker
            tree={tree}
            initial={{ roomId: defaultRoomId, spotId: null, containerId: null }}
            category={mostCommon(included.map((row) => row.category))}
            clothingType={null}
          />
          <input type="hidden" name="token" value={token ?? ""} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              included.map(({ n, name, category, clothingType, color }) => ({ n, name, category, clothingType, color })),
            )}
          />
          {state.error ? <ErrorText>{state.error}</ErrorText> : null}
          <button type="submit" disabled={saving || busy || included.length === 0} className={primaryButton}>
            {saving ? `Saving ${included.length}...` : `Save ${included.length} ${included.length === 1 ? "thing" : "things"}`}
          </button>
        </div>
      </div>

      {rows.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, index) => (
            <li
              key={row.n}
              className={`flex gap-3 rounded-2xl border bg-card p-3 ${row.include ? "border-line" : "border-dashed border-line opacity-55"}`}
            >
              <div className="flex shrink-0 flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.imageUrl} alt="" className="checkerboard size-20 rounded-xl object-contain p-1" />
                <label className="flex items-center gap-1.5 font-mono text-[11px]">
                  <input
                    type="checkbox"
                    checked={row.include}
                    onChange={(event) => update(row.n, { include: event.target.checked })}
                    className="size-4 accent-[var(--accent)]"
                  />
                  #{index + 1}
                </label>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  value={row.name}
                  maxLength={80}
                  aria-label={`Name of thing ${index + 1}`}
                  onChange={(event) => update(row.n, { name: event.target.value })}
                  className={fieldClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={row.category}
                    aria-label={`Category of thing ${index + 1}`}
                    onChange={(event) => update(row.n, { category: event.target.value })}
                    className={fieldClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {row.category === "clothing" ? (
                    <select
                      value={row.clothingType ?? ""}
                      aria-label={`Clothing type of thing ${index + 1}`}
                      onChange={(event) => update(row.n, { clothingType: event.target.value || null })}
                      className={fieldClass}
                    >
                      <option value="">type?</option>
                      {CLOTHING_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={row.color}
                      maxLength={40}
                      aria-label={`Color of thing ${index + 1}`}
                      onChange={(event) => update(row.n, { color: event.target.value })}
                      className={fieldClass}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
