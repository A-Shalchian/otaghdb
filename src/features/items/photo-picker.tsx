"use client";

import { useEffect, useState } from "react";

export function PhotoPicker() {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-card text-center transition-colors hover:border-ink">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Selected photo" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="flex flex-col gap-1 px-6">
          <span className="text-sm font-medium">Take or choose a photo</span>
          <span className="font-mono text-[11px] text-soft">jpg, png or webp</span>
        </span>
      )}
      <input
        type="file"
        name="photo"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
      />
      {preview ? (
        <span className="absolute bottom-3 rounded-full bg-paper/90 px-3 py-1 text-xs">Change photo</span>
      ) : null}
    </label>
  );
}
