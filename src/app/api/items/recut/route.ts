import { z } from "zod";
import { recutAtPoint } from "@/features/items/analysis";
import { isStagingToken } from "@/lib/images";
import { errorMessage } from "@/lib/services";

const Recut = z.object({
  token: z.string().refine(isStagingToken),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = Recut.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Bad tap." }, { status: 400 });
  try {
    await recutAtPoint(parsed.data.token, parsed.data.x, parsed.data.y);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
