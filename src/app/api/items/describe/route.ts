import { describeStaged } from "@/features/items/analysis";
import { isStagingToken } from "@/lib/images";

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: unknown };
  if (!isStagingToken(token)) return Response.json({ error: "Unknown photo." }, { status: 400 });
  return Response.json(await describeStaged(token));
}
