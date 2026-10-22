import { db } from "@/lib/db";
import { describeItem, type ItemGuess } from "@/lib/ollama";
import { imageUrl, onWhite, readStaged, SINGLE_MAX_SIDE, stagePhoto, writeStaged } from "@/lib/images";
import { locationText } from "@/lib/places";
import { errorMessage } from "@/lib/services";
import { rank, SAME_ITEM_MIN, toBlob } from "@/lib/vectors";
import { cutout, embedImage, segment } from "@/lib/vision";
import { ITEM_SELECT_WITH_EMBEDDING, type ItemRowWithEmbedding } from "./queries";

export type SimilarItem = {
  id: number;
  name: string;
  score: number;
  imageUrl: string | null;
  location: string;
};

export async function stageSinglePhoto(photo: Buffer) {
  const staged = await stagePhoto(photo, SINGLE_MAX_SIDE, "original.jpg");
  try {
    await writeStaged(staged.token, "cutout.png", await cutout(staged.jpg));
    return { token: staged.token, hasCutout: true, warning: null };
  } catch (error) {
    return { token: staged.token, hasCutout: false, warning: errorMessage(error) };
  }
}

export async function recutAtPoint(token: string, x: number, y: number) {
  const original = await readStaged(token, "original.jpg");
  if (!original) throw new Error("That photo expired. Add it again.");
  const [object] = await segment(original, { points: [[x, y]] });
  if (!object) throw new Error("Nothing found at that spot. Tap closer to the middle of the thing.");
  await writeStaged(token, "cutout.png", object.png);
}

export async function stagedSubject(token: string) {
  return (await readStaged(token, "cutout.png")) ?? (await readStaged(token, "original.jpg"));
}

export function itemsWithEmbeddings(excludeId = 0) {
  return db
    .prepare(`${ITEM_SELECT_WITH_EMBEDDING} where i.embedding is not null and i.id != ?`)
    .all(excludeId) as ItemRowWithEmbedding[];
}

export function findSimilar(vector: Float32Array, limit = 3, excludeId?: number): SimilarItem[] {
  return rank(vector, itemsWithEmbeddings(excludeId))
    .slice(0, limit)
    .map(({ row, score }) => ({
      id: row.id,
      name: row.name,
      score,
      imageUrl: imageUrl(row.id, row.cutout_file ?? row.original_file),
      location: locationText(row),
    }));
}

export async function describeStaged(token: string): Promise<{
  guess: ItemGuess | null;
  error: string | null;
  duplicates: SimilarItem[];
}> {
  const subject = await stagedSubject(token);
  if (!subject) return { guess: null, error: "That photo expired. Add it again.", duplicates: [] };

  const [described, embedded] = await Promise.allSettled([
    onWhite(subject).then(describeItem),
    embedImage(subject),
  ]);

  let duplicates: SimilarItem[] = [];
  if (embedded.status === "fulfilled") {
    await writeStaged(token, "embedding.bin", toBlob(embedded.value));
    duplicates = findSimilar(embedded.value).filter((match) => match.score >= SAME_ITEM_MIN);
  }

  if (described.status === "rejected") {
    return { guess: null, error: errorMessage(described.reason), duplicates };
  }
  await writeStaged(token, "ai.json", described.value.raw);
  return { guess: described.value.guess, error: null, duplicates };
}
