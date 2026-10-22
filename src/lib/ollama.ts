import { z } from "zod";
import { CATEGORIES, CLOTHING_TYPES } from "@/lib/categories";
import { ServiceDownError } from "@/lib/services";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";

export const MODEL = process.env.OTAGHDB_MODEL ?? "qwen3.5:9b";

// 4096 is the largest context that keeps qwen3.5:9b fully on an 8 GB GPU.
// Ollama reloads the model whenever num_ctx changes, so every call sends it.
const OPTIONS = { temperature: 0, num_ctx: 4096 };

export type ToolCall = { function: { name: string; arguments: Record<string, unknown> } };

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  images?: string[];
  tool_calls?: ToolCall[];
  tool_name?: string;
};

export type ToolDefinition = {
  type: "function";
  function: { name: string; description: string; parameters: object };
};

export async function chat({
  messages,
  format,
  tools,
}: {
  messages: ChatMessage[];
  format?: object;
  tools?: ToolDefinition[];
}): Promise<ChatMessage> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      body: JSON.stringify({
        model: MODEL,
        messages,
        format,
        tools,
        stream: false,
        think: false,
        keep_alive: "30m",
        options: OPTIONS,
      }),
      signal: AbortSignal.timeout(240_000),
    });
  } catch {
    throw new ServiceDownError("Ollama is not running. Open the Ollama app, then try again.");
  }
  if (!res.ok) throw new Error(`Ollama failed: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { message: ChatMessage };
  return body.message;
}

async function structured<T>(validator: z.ZodType<T>, format: object, messages: ChatMessage[]) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await chat({ messages, format });
    try {
      const parsed = validator.safeParse(JSON.parse(message.content));
      if (parsed.success) return { data: parsed.data, raw: message.content };
    } catch {
      // Unparseable JSON gets the same single retry as a reply that fails validation.
    }
  }
  throw new Error("The model replied with broken JSON twice. Fill the form by hand.");
}

const CLOTHING_TYPE_OR_NONE = [...CLOTHING_TYPES, "none"] as const;

const itemFormat = {
  type: "object",
  properties: {
    name: { type: "string" },
    category: { type: "string", enum: CATEGORIES },
    clothing_type: { type: "string", enum: CLOTHING_TYPE_OR_NONE },
    color: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    description: { type: "string" },
    looks_like_container: { type: "boolean" },
  },
  required: ["name", "category", "clothing_type", "color", "tags", "description", "looks_like_container"],
};

const ItemReply = z.object({
  name: z.string().trim().min(1),
  category: z.enum(CATEGORIES),
  clothing_type: z.enum(CLOTHING_TYPE_OR_NONE),
  color: z.string().trim(),
  tags: z.array(z.string().trim()),
  description: z.string().trim(),
  looks_like_container: z.boolean(),
});

export type ItemGuess = {
  name: string;
  category: (typeof CATEGORIES)[number];
  clothingType: (typeof CLOTHING_TYPES)[number] | null;
  color: string;
  tags: string[];
  description: string;
  looksLikeContainer: boolean;
};

const ITEM_PROMPT = `This photo shows one thing from someone's home, cut out on a white background. Describe it for a home inventory.
- name: 2 to 4 lowercase words a person would write on a label, like "black zip hoodie" or "usb-c charger".
- category: the closest one from the list.
- clothing_type: the closest type if the category is clothing, otherwise "none".
- color: the main color in one or two words, like "black" or "navy blue". No details.
- tags: 3 to 6 short lowercase words someone might search for.
- description: one short sentence about the thing itself, not the background.
- looks_like_container: true only if it is made to hold other things, like a bag, box, pouch, case or basket.`;

function normalizeGuess(reply: z.infer<typeof ItemReply>): ItemGuess {
  const clean = (text: string, max: number) => text.toLowerCase().slice(0, max).trim();
  return {
    name: clean(reply.name, 80),
    category: reply.category,
    clothingType: reply.category === "clothing" && reply.clothing_type !== "none" ? reply.clothing_type : null,
    color: clean(reply.color, 40),
    tags: [...new Set(reply.tags.map((tag) => clean(tag, 30)).filter(Boolean))].slice(0, 8),
    description: reply.description.slice(0, 300),
    looksLikeContainer: reply.looks_like_container,
  };
}

export async function describeItem(imageJpg: Buffer) {
  const { data, raw } = await structured(ItemReply, itemFormat, [
    { role: "user", content: ITEM_PROMPT, images: [imageJpg.toString("base64")] },
  ]);
  return { guess: normalizeGuess(data), raw };
}

const detectFormat = {
  type: "object",
  properties: {
    objects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: CATEGORIES },
          clothing_type: { type: "string", enum: CLOTHING_TYPE_OR_NONE },
          color: { type: "string" },
          bbox_2d: { type: "array", items: { type: "integer" }, minItems: 4, maxItems: 4 },
        },
        required: ["name", "category", "clothing_type", "color", "bbox_2d"],
      },
    },
  },
  required: ["objects"],
};

const DetectReply = z.object({
  objects: z.array(
    z.object({
      name: z.string().trim().min(1),
      category: z.enum(CATEGORIES),
      clothing_type: z.enum(CLOTHING_TYPE_OR_NONE),
      color: z.string().trim(),
      bbox_2d: z.array(z.number()).length(4),
    }),
  ),
});

const DETECT_PROMPT = `This photo shows a drawer, shelf, desk or table in someone's home. Find every distinct thing in it that a person owns and would want to find later. Skip people, pets, furniture, walls and the surface the things sit on.
For each thing give:
- name: 2 to 4 lowercase words, like "usb-c cable" or "blue notebook".
- category: the closest one from the list.
- clothing_type: the closest type if the category is clothing, otherwise "none".
- color: the main color in one or two words.
- bbox_2d: [x1, y1, x2, y2] around the thing.`;

export type Detection = {
  name: string;
  category: (typeof CATEGORIES)[number];
  clothingType: (typeof CLOTHING_TYPES)[number] | null;
  color: string;
  box: [number, number, number, number];
};

function overlap(a: number[], b: number[]) {
  const ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const area = (r: number[]) => (r[2] - r[0]) * (r[3] - r[1]);
  return inter / (area(a) + area(b) - inter);
}

// Qwen's vision models give boxes on a 0 to 1000 scale whatever the photo size.
export async function detectObjects(photoJpg: Buffer, width: number, height: number) {
  const { data, raw } = await structured(DetectReply, detectFormat, [
    { role: "user", content: DETECT_PROMPT, images: [photoJpg.toString("base64")] },
  ]);

  const kept: Detection[] = [];
  for (const object of data.objects) {
    const [x1, y1, x2, y2] = object.bbox_2d;
    const inRange = [x1, y1, x2, y2].every((v) => v >= 0 && v <= 1000);
    const area = (x2 - x1) * (y2 - y1);
    if (!inRange || x2 <= x1 || y2 <= y1 || area > 900_000) continue;

    const box: Detection["box"] = [
      Math.round((x1 / 1000) * width),
      Math.round((y1 / 1000) * height),
      Math.round((x2 / 1000) * width),
      Math.round((y2 / 1000) * height),
    ];
    if (kept.some((k) => overlap(k.box, box) > 0.8)) continue;

    const guess = normalizeGuess({ ...object, tags: [], description: "", looks_like_container: false });
    kept.push({ name: guess.name, category: guess.category, clothingType: guess.clothingType, color: guess.color, box });
  }
  return { objects: kept, raw };
}
