// Tuned on SigLIP 2 base with real items: the right item scored cosine 0.084
// to 0.158 against its description, wrong items at most 0.084, and wrong
// items never came within 0.025 of the best match.
export const TEXT_MATCH_FLOOR = 0.08;
export const TEXT_MATCH_MARGIN = 0.025;

// Photo against photo: the same basket scored 0.903, other things in the
// same room 0.72 to 0.74.
export const SAME_ITEM_MIN = 0.85;
export const SIMILAR_ITEM_MIN = 0.8;

export function toBlob(vector: Float32Array) {
  return Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength);
}

export function fromBlob(blob: Buffer) {
  const copy = new Uint8Array(blob);
  return new Float32Array(copy.buffer);
}

export function cosine(a: Float32Array, b: Float32Array) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export function rank<T extends { embedding: Buffer | null }>(query: Float32Array, rows: T[]) {
  const scored: { row: T; score: number }[] = [];
  for (const row of rows) {
    if (!row.embedding) continue;
    scored.push({ row, score: cosine(query, fromBlob(row.embedding)) });
  }
  return scored.sort((a, b) => b.score - a.score);
}

export function textMatches<T extends { embedding: Buffer | null }>(query: Float32Array, rows: T[]) {
  const ranked = rank(query, rows);
  const best = ranked[0]?.score ?? 0;
  return ranked.filter(({ score }) => score >= TEXT_MATCH_FLOOR && score >= best - TEXT_MATCH_MARGIN);
}
