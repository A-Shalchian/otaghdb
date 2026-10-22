import { isServedStagedFile, isStagingToken, readStaged } from "@/lib/images";

export async function GET(_req: Request, ctx: RouteContext<"/staging/[token]/[file]">) {
  const { token, file } = await ctx.params;
  if (!isStagingToken(token) || !isServedStagedFile(file)) {
    return new Response("not found", { status: 404 });
  }
  const body = await readStaged(token, file);
  if (!body) return new Response("not found", { status: 404 });
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": file.endsWith(".png") ? "image/png" : "image/jpeg",
      "cache-control": "no-store",
    },
  });
}
