// SigLIP 2 base turns a cosine score into a match probability with its own
// trained scale and bias: sigmoid(scale * cos + bias).
const SIGLIP_SCALE = 112.67;
const SIGLIP_BIAS = -16.77;

export const TEXT_MATCH_MIN = 0.01;
export const SAME_ITEM_MIN = 0.85;

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

export function textMatchProbability(cos: number) {
  return 1 / (1 + Math.exp(-(SIGLIP_SCALE * cos + SIGLIP_BIAS)));
}

export function rank<T extends { embedding: Buffer | null }>(query: Float32Array, rows: T[]) {
  const scored: { row: T; score: number }[] = [];
  for (const row of rows) {
    if (!row.embedding) continue;
    scored.push({ row, score: cosine(query, fromBlob(row.embedding)) });
  }
  return scored.sort((a, b) => b.score - a.score);
}
