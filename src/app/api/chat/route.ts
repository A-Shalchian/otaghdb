import { z } from "zod";
import { runAgent, type ChatEvent } from "@/features/chat/agent";
import { errorMessage } from "@/lib/services";

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(40),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad chat request." }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ChatEvent) => {
        if (!request.signal.aborted) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        await runAgent(parsed.data.messages, emit, request.signal);
      } catch (error) {
        emit({ type: "error", text: errorMessage(error) });
      }
      if (!request.signal.aborted) controller.close();
    },
  });
  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
