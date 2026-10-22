import { readFile } from "node:fs/promises";
import path from "node:path";
import { IMAGE_FILES, itemImageDir, type ImageFile } from "@/lib/images";

function isImageFile(file: string): file is ImageFile {
  return Object.hasOwn(IMAGE_FILES, file);
}

export async function GET(_req: Request, ctx: RouteContext<"/images/[id]/[file]">) {
  const { id, file } = await ctx.params;
  if (!/^\d+$/.test(id) || !isImageFile(file)) {
    return new Response("not found", { status: 404 });
  }

  try {
    const body = await readFile(path.join(itemImageDir(id), file));
    return new Response(body, {
      headers: { "content-type": IMAGE_FILES[file], "cache-control": "no-store" },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
