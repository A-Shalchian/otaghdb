import { z } from "zod";
import { addScenePoint } from "@/features/items/scene";
import { isStagingToken } from "@/lib/images";
import { errorMessage } from "@/lib/services";

const Point = z.object({
  token: z.string().refine(isStagingToken),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = Point.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Bad tap." }, { status: 400 });
  try {
    return Response.json({ candidate: await addScenePoint(parsed.data.token, parsed.data.x, parsed.data.y) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
