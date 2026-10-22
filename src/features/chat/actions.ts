"use server";

import { refresh } from "next/cache";
import { applyProposal, ProposalSchema, type ApplyResult } from "./proposals";

export async function applyProposalAction(raw: unknown): Promise<ApplyResult> {
  const parsed = ProposalSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "That change is no longer valid." };
  const result = applyProposal(parsed.data);
  if (result.ok) refresh();
  return result;
}
