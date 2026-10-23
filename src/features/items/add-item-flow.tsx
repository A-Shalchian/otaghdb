"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ErrorText, primaryButton, secondaryButton } from "@/components/form";
import type { PlaceTree } from "@/lib/places";
import { createItem, type ItemFormState } from "./actions";
import type { SimilarItem } from "./analysis";
import { AiFieldInputs, emptyAiFields, KeptFieldInputs, type AiFields } from "./item-fields";
import { CameraButton } from "@/components/camera";
import { PhotoButton } from "@/components/photo-button";
import { PlacePicker } from "./place-picker";

type Phase = "idle" | "uploading" | "naming" | "recutting" | "ready";

type Guess = {
  name: string;
  category: string;
  clothingType: string | null;
  color: string;
  tags: string[];
  description: string;
  looksLikeContainer: boolean;
};

const PHASE_TEXT: Record<Phase, string | null> = {
  idle: null,
  uploading: "Cutting it out...",
  naming: "Naming it. The first one after a restart takes up to a minute while the model loads.",
  recutting: "Cutting out what you tapped...",
  ready: null,
};

const initialState: ItemFormState = { error: null };

const KEEP_SHOOTING = "otaghdb.keepShooting";

// After a save the page comes back with the camera already open, so adding
// a pile of things while unpacking is shoot, check, save, repeat.
function readKeepShooting() {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(KEEP_SHOOTING) === "1";
  } catch {
    return false;
  }
}

function writeKeepShooting(on: boolean) {
  try {
    if (on) window.sessionStorage.setItem(KEEP_SHOOTING, "1");
    else window.sessionStorage.removeItem(KEEP_SHOOTING);
  } catch {
    // Private browsing can block storage; the camera just stays closed.
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T & { error?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function AddItemFlow({
  tree,
  defaultRoomId,
  defaultSpotId,
  defaultContainerId,
  resumeCamera,
}: {
  tree: PlaceTree;
  defaultRoomId: number | null;
  defaultSpotId: number | null;
  defaultContainerId: number | null;
  resumeCamera: boolean;
}) {
  const [state, formAction, saving] = useActionState(createItem, initialState);
  const [phase, setPhase] = useState<Phase>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hasCutout, setHasCutout] = useState(false);
  const [version, setVersion] = useState(0);
  const [view, setView] = useState<"cutout" | "photo">("cutout");
  const [notice, setNotice] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<SimilarItem[]>([]);
  const [ai, setAi] = useState<AiFields>(emptyAiFields);
  const dirty = useRef(new Set<keyof AiFields>());
  const photoRef = useRef<HTMLImageElement>(null);
  const [cameraOpen, setCameraOpen] = useState(() => resumeCamera && readKeepShooting());

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function applyGuess(guess: Guess) {
    const filled: AiFields = {
      name: guess.name,
      category: guess.category,
      clothingType: guess.clothingType ?? "",
      color: guess.color,
      tags: guess.tags.join(", "),
      description: guess.description,
      isContainer: guess.looksLikeContainer,
    };
    setAi((current) => {
      const next = { ...current };
      for (const key of Object.keys(filled) as (keyof AiFields)[]) {
        if (!dirty.current.has(key)) Object.assign(next, { [key]: filled[key] });
      }
      return next;
    });
  }

  async function describe(currentToken: string) {
    setPhase("naming");
    const result = await postJson<{ guess: Guess | null; duplicates: SimilarItem[] }>(
      "/api/items/describe",
      { token: currentToken },
    ).catch(() => ({ guess: null, duplicates: [], error: "Could not reach the app server." }));
    setDuplicates(result.duplicates ?? []);
    if (result.guess) applyGuess(result.guess);
    if (result.error) setNotice(`${result.error} You can fill the form yourself.`);
    setPhase("ready");
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setToken(null);
    setHasCutout(false);
    setDuplicates([]);
    setNotice(null);
    setView("cutout");
    dirty.current.clear();
    setAi(emptyAiFields);
    setPhase("uploading");

    const form = new FormData();
    form.append("photo", file);
    const res = await fetch("/api/items/analyze", { method: "POST", body: form }).catch(() => null);
    const result = (await res?.json().catch(() => null)) as
      | { token?: string; hasCutout?: boolean; warning?: string | null; error?: string }
      | null;
    if (!result?.token) {
      setNotice(result?.error ?? "Could not upload that photo.");
      setPhase("idle");
      return;
    }
    setToken(result.token);
    setHasCutout(Boolean(result.hasCutout));
    setVersion((v) => v + 1);
    if (result.warning) setNotice(`${result.warning} The photo is saved without a cutout.`);
    await describe(result.token);
  }

  async function onTap(event: React.MouseEvent<HTMLImageElement>) {
    const img = photoRef.current;
    if (!img || !token || phase !== "ready") return;
    const rect = img.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * img.naturalHeight);
    setPhase("recutting");
    setNotice(null);
    const result = await postJson<{ ok?: boolean }>("/api/items/recut", { token, x, y }).catch(() => ({
      error: "Could not reach the app server.",
    }));
    if (result.error) {
      setNotice(result.error);
      setPhase("ready");
      return;
    }
    dirty.current.clear();
    setAi(emptyAiFields);
    setDuplicates([]);
    setHasCutout(true);
    setVersion((v) => v + 1);
    setView("cutout");
    await describe(token);
  }

  const busy = phase === "uploading" || phase === "naming" || phase === "recutting";
  const photoSrc = token ? `/staging/${token}/original.jpg` : preview;
  const cutoutSrc = token && hasCutout ? `/staging/${token}/cutout.png?v=${version}` : null;
  const showCutout = view === "cutout" && cutoutSrc;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <div className="flex flex-col gap-3">
        {photoSrc ? (
          <div className="relative overflow-hidden rounded-2xl border border-line bg-card">
            {showCutout ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cutoutSrc} alt="Cutout" className="tile mx-auto max-h-[28rem] w-full object-contain p-4" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={photoRef}
                src={photoSrc}
                alt="Your photo. Tap the thing you mean."
                onClick={onTap}
                className={`block h-auto w-full ${token && phase === "ready" ? "cursor-crosshair" : ""}`}
              />
            )}
            {busy ? (
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-paper/90 px-3 py-2 text-xs">
                {PHASE_TEXT[phase]}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-card px-6 text-center">
            <p className="text-sm font-medium">Photograph one thing</p>
            <p className="font-mono text-[11px] text-soft">Tap Camera. The background is removed and the AI names it.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <CameraButton
            title="Photograph one thing"
            label={photoSrc ? "Camera again" : "Camera"}
            open={cameraOpen}
            disabled={busy}
            onOpenChange={(open, reason) => {
              setCameraOpen(open);
              if (reason === "capture") writeKeepShooting(true);
              if (reason === "close") writeKeepShooting(false);
            }}
            onPick={onPhoto}
          />
          <PhotoButton label={photoSrc ? "Choose another" : "Choose photo"} onPick={onPhoto} disabled={busy} />
          {cutoutSrc ? (
            <button
              type="button"
              onClick={() => setView(view === "cutout" ? "photo" : "cutout")}
              className={secondaryButton}
              disabled={busy}
            >
              {view === "cutout" ? "Wrong thing? Tap it on the photo" : "Show cutout"}
            </button>
          ) : null}
        </div>
        {view === "photo" && token ? (
          <p className="text-xs text-soft">Tap the thing you mean. It gets cut out and named again.</p>
        ) : null}

        {notice ? <p className="text-xs text-soft">{notice}</p> : null}

        {duplicates.length > 0 ? (
          <div className="rounded-2xl border border-accent/50 bg-card p-3">
            <p className="text-sm font-medium">You may already own this</p>
            <ul className="mt-2 flex flex-col gap-2">
              {duplicates.map((match) => (
                <li key={match.id}>
                  <Link href={`/app/items/${match.id}`} className="flex items-center gap-3 hover:underline">
                    {match.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={match.imageUrl} alt="" className="size-10 rounded-lg border border-line object-contain" />
                    ) : null}
                    <span className="text-sm">
                      {match.name}
                      <span className="block font-mono text-[11px] text-soft">
                        {match.location} · {Math.round(match.score * 100)}% match
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token ?? ""} />
        <AiFieldInputs
          values={ai}
          pending={phase === "naming" || phase === "uploading"}
          onChange={(patch) => {
            for (const key of Object.keys(patch) as (keyof AiFields)[]) dirty.current.add(key);
            setAi((current) => ({ ...current, ...patch }));
          }}
        />
        <PlacePicker
          tree={tree}
          initial={{ roomId: defaultRoomId, spotId: defaultSpotId, containerId: defaultContainerId }}
          category={ai.category}
          clothingType={ai.clothingType || null}
        />
        <KeptFieldInputs initial={{ wouldDiscard: "never", whyKept: "", notes: "" }} />

        {state.error ? <ErrorText>{state.error}</ErrorText> : null}

        <button type="submit" disabled={saving || phase === "uploading" || phase === "recutting"} className={`mt-2 ${primaryButton}`}>
          {saving ? "Saving..." : "Save item"}
        </button>
      </div>
    </form>
  );
}
