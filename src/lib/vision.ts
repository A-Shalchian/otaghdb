import { ServiceDownError } from "@/lib/services";

const VISION_URL = process.env.VISION_URL ?? "http://127.0.0.1:7000";

type Box = [number, number, number, number];

export type Segment = { png: Buffer; box: Box; score: number };

async function call(path: string, init: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${VISION_URL}${path}`, { ...init, signal: AbortSignal.timeout(120_000) });
  } catch {
    throw new ServiceDownError(
      "The vision service is not running. Start it with services/vision/start.ps1.",
    );
  }
  if (!res.ok) throw new Error(`Vision service ${path} failed: ${res.status} ${await res.text()}`);
  return res;
}

function imageForm(field: string, image: Buffer, type: string) {
  const form = new FormData();
  form.append(field, new Blob([new Uint8Array(image)], { type }), type === "image/png" ? "image.png" : "image.jpg");
  return form;
}

export async function cutout(photo: Buffer): Promise<Buffer> {
  const res = await call("/cutout", { method: "POST", body: imageForm("photo", photo, "image/jpeg") });
  return Buffer.from(await res.arrayBuffer());
}

export async function segment(
  photo: Buffer,
  prompt: { points: [number, number][] } | { boxes: Box[] },
): Promise<Segment[]> {
  const form = imageForm("photo", photo, "image/jpeg");
  if ("points" in prompt) form.append("points", JSON.stringify(prompt.points));
  else form.append("boxes", JSON.stringify(prompt.boxes));
  const res = await call("/segment", { method: "POST", body: form });
  const { objects } = (await res.json()) as { objects: { png: string; box: Box; score: number }[] };
  return objects.map((o) => ({ png: Buffer.from(o.png, "base64"), box: o.box, score: o.score }));
}

export async function embedImage(image: Buffer): Promise<Float32Array> {
  const res = await call("/embed/image", { method: "POST", body: imageForm("image", image, "image/png") });
  const { vector } = (await res.json()) as { vector: number[] };
  return Float32Array.from(vector);
}

export async function embedText(text: string): Promise<Float32Array> {
  const res = await call("/embed/text", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const { vector } = (await res.json()) as { vector: number[] };
  return Float32Array.from(vector);
}
