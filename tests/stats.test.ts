import { describe, expect, it } from "vitest";
import { countCommits } from "../src/lib/stats";

const commit = (message: string, parents = 1) => ({ commit: { message }, parents: Array.from({ length: parents }, () => ({})) });

describe("countCommits", () => {
  it("counts non-merge commits and those an AI agent co-wrote", () => {
    const commits = [
      commit("feat: a\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"),
      commit("fix: b\n\nCo-authored-by: Codex <codex@openai.com>"),
      commit("docs: c\n\nCo-Authored-By: Pratik <p@example.com>"),
      commit("Merge pull request #1", 2),
      commit("chore: d"),
    ];
    expect(countCommits(commits)).toEqual({ commits: 4, aiCommits: 2 });
  });
});
