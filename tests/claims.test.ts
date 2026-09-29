import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadClaims, claimById } from "../src/lib/claims";
import { findBanned } from "../src/lib/banned";

const ok = `
- id: a
  text: One.
  status: now
  evidence: [{ kind: pr, repo: PrepLabsAI/AgentX, number: 1 }]
`;

describe("claims ledger", () => {
  it("parses a valid ledger", () => {
    expect(loadClaims(ok)).toEqual([{ id: "a", text: "One.", status: "now", evidence: [{ kind: "pr", repo: "PrepLabsAI/AgentX", number: 1 }] }]);
  });
  it("rejects a current claim with no evidence", () => {
    expect(() => loadClaims("- { id: b, text: Two., status: now, evidence: [] }")).toThrow(/b.*evidence/);
  });
  it("rejects duplicate ids", () => {
    expect(() => loadClaims(ok + ok)).toThrow(/duplicate claim id a/);
  });
  it("throws on an unknown id so a page cannot cite a missing claim", () => {
    expect(() => claimById(loadClaims(ok), "zzz")).toThrow(/unknown claim zzz/);
  });
  it("keeps the real ledger valid and free of banned words", () => {
    const claims = loadClaims(readFileSync("src/data/claims.yaml", "utf8"));
    expect(claims.length).toBeGreaterThan(15);
    for (const claim of claims) expect(findBanned(`<p>${claim.text}</p>`), claim.id).toEqual([]);
  });
});
