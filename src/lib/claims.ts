import { parse } from "yaml";
import { z } from "zod";

const EvidenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("pr"), repo: z.string(), number: z.number().int().positive() }).strict(),
  z.object({ kind: z.literal("file"), repo: z.string(), path: z.string().min(1) }).strict(),
]);

const ClaimSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  text: z.string().min(1),
  status: z.enum(["now", "next", "later"]),
  evidence: z.array(EvidenceSchema),
  note: z.string().optional(),
}).strict();

export type Evidence = z.infer<typeof EvidenceSchema>;
export type Claim = z.infer<typeof ClaimSchema>;

/** Parse the claims ledger. Throws on invalid entries, duplicate ids, or a current claim without evidence. */
export function loadClaims(yamlText: string): Claim[] {
  const claims = z.array(ClaimSchema).parse(parse(yamlText));
  const seen = new Set<string>();
  for (const claim of claims) {
    if (seen.has(claim.id)) throw new Error(`duplicate claim id ${claim.id}`);
    seen.add(claim.id);
    if (claim.status === "now" && claim.evidence.length === 0) throw new Error(`claim ${claim.id} is current but has no evidence`);
  }
  return claims;
}

export function claimById(claims: Claim[], id: string): Claim {
  const claim = claims.find((entry) => entry.id === id);
  if (!claim) throw new Error(`unknown claim ${id}`);
  return claim;
}
