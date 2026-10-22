"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { secondaryButton } from "@/components/form";
import { PhotoButton } from "@/components/photo-button";

type Facing = "environment" | "user";

const noSubscribe = () => () => {};

// The live camera only works on HTTPS or localhost. Elsewhere the button
// falls back to the phone's own camera app through a file input.
function useLiveCameraSupport() {
  return useSyncExternalStore(
    noSubscribe,
    () => window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia),
    () => false,
  );
}

function cameraError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError") return "Camera access was blocked. Allow the camera for this site in the browser settings.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera found on this device.";
  if (name === "NotReadableError") return "Another app is using the camera. Close it and try again.";
  return "Could not start the camera.";
}

export function CameraView({
  title,
  onCapture,
  onClose,
}: {
  title: string;
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [state, setState] = useState<"starting" | "live" | "error">("starting");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1920 } },
      })
      .then(async (media) => {
        stream = media;
        if (cancelled || !video.current) return media.getTracks().forEach((t) => t.stop());
        video.current.srcObject = media;
        await video.current.play().catch(() => undefined);
        setState("live");
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(cameraError(reason));
        setState("error");
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function shoot() {
    const el = video.current;
    if (!el || state !== "live" || !el.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    canvas.getContext("2d")?.drawImage(el, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-label={title}>
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-sm hover:bg-white/10" aria-label="Close the camera">
          Close
        </button>
        <span className="text-sm">{title}</span>
        <span className="w-14" />
      </div>

      <div className="relative min-h-0 flex-1">
        <video
          ref={video}
          playsInline
          muted
          autoPlay
          className={`h-full w-full object-contain ${facing === "user" ? "-scale-x-100" : ""}`}
        />
        {state === "starting" ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Starting the camera...</p>
        ) : null}
        {state === "error" ? (
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm">{error}</p>
        ) : null}
        <div className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${flash ? "opacity-70" : "opacity-0"}`} />
      </div>

      <div className="flex items-center justify-between px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <span className="w-14" />
        <button
          type="button"
          onClick={shoot}
          disabled={state !== "live"}
          aria-label="Take the photo"
          className="size-18 rounded-full border-4 border-white bg-white/20 transition active:scale-95 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={() => {
            setState("starting");
            setFacing(facing === "environment" ? "user" : "environment");
          }}
          aria-label="Switch between front and back camera"
          className="w-14 rounded-full py-2 text-sm hover:bg-white/10"
        >
          Flip
        </button>
      </div>
    </div>
  );
}

export function CameraButton({
  title,
  label = "Camera",
  disabled,
  open,
  onOpenChange,
  onPick,
}: {
  title: string;
  label?: string;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean, reason: "open" | "close" | "capture") => void;
  onPick: (file: File | undefined) => void;
}) {
  const live = useLiveCameraSupport();
  if (!live) return <PhotoButton label={label} capture onPick={onPick} disabled={disabled} />;
  return (
    <>
      <button type="button" onClick={() => onOpenChange(true, "open")} disabled={disabled} className={secondaryButton}>
        {label}
      </button>
      {open ? (
        <CameraView
          title={title}
          onClose={() => onOpenChange(false, "close")}
          onCapture={(file) => {
            onOpenChange(false, "capture");
            onPick(file);
          }}
        />
      ) : null}
    </>
  );
}
