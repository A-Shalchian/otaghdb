"use client";

import { secondaryButton } from "@/components/form";

export function PhotoButton({
  label,
  capture,
  disabled,
  onPick,
}: {
  label: string;
  capture?: boolean;
  disabled?: boolean;
  onPick: (file: File | undefined) => void;
}) {
  return (
    <label className={`${secondaryButton} cursor-pointer ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      {label}
      <input
        type="file"
        accept="image/*"
        capture={capture ? "environment" : undefined}
        className="sr-only"
        onChange={(event) => {
          void onPick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </label>
  );
}
