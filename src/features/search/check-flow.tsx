"use client";

import Link from "next/link";
import { useState } from "react";
import { CameraButton } from "@/components/camera";
import { PhotoButton } from "@/components/photo-button";
import type { SimilarItem } from "@/features/items/analysis";
import { SAME_ITEM_MIN, SIMILAR_ITEM_MIN } from "@/lib/vectors";

type Result = { cutoutUrl: string | null; matches: SimilarItem[]; error?: string };

function verdict(top: SimilarItem | undefined) {
  if (!top) return "You have nothing saved with a photo yet.";
  if (top.score >= SAME_ITEM_MIN) return `Yes, you already own this: ${top.name}.`;
  if (top.score >= SIMILAR_ITEM_MIN) return `Maybe. The closest thing you own is ${top.name}.`;
  return "Probably not. Nothing you own looks much like it.";
}

export function CheckFlow() {
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setBusy(true);
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch("/api/check", { method: "POST", body: form }).catch(() => null);
    setResult(((await res?.json().catch(() => null)) as Result | null) ?? { cutoutUrl: null, matches: [], error: "Could not reach the app server." });
    setBusy(false);
  }

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="tile flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line">
          {result?.cutoutUrl || preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result?.cutoutUrl ?? preview ?? ""} alt="What you photographed" className="max-h-full w-full object-contain p-4" />
          ) : (
            <p className="px-6 text-center text-sm text-soft">Point the camera at the thing in the store.</p>
          )}
        </div>
        <div className="flex gap-2">
          <CameraButton
            title="Point at the thing"
            open={cameraOpen}
            disabled={busy}
            onOpenChange={(open) => setCameraOpen(open)}
            onPick={onPhoto}
          />
          <PhotoButton label="Choose photo" onPick={onPhoto} disabled={busy} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {busy ? <p className="text-sm text-soft">Cutting it out and comparing with everything you own...</p> : null}
        {result?.error ? <p className="text-sm text-soft">{result.error}</p> : null}
        {result && !result.error ? (
          <>
            <p className="text-xl font-medium">{verdict(result.matches[0])}</p>
            <ul className="flex flex-col gap-3">
              {result.matches.map((match) => (
                <li key={match.id}>
                  <Link href={`/app/items/${match.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2 hover:border-ink">
                    {match.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={match.imageUrl} alt="" className="size-16 rounded-xl object-contain" />
                    ) : null}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{match.name}</span>
                      <span className="truncate font-mono text-[11px] text-soft">{match.location}</span>
                    </span>
                    <span className="font-mono text-sm">{Math.round(match.score * 100)}%</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="font-mono text-[11px] text-soft">
              Scores are SigLIP 2 image similarity. Above {SAME_ITEM_MIN * 100}% is very likely the same thing.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
