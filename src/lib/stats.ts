/** The founders' line (spec 042 Appendix A item 8): commits since the rebuild, and how many an AI agent co-wrote. */
export type GitHubCommit = { commit: { message: string }; parents: unknown[] };
export type Stats = { since: string; commits: number; aiCommits: number };

export const REBUILD_DATE = "2026-09-19";
const AI_COAUTHOR = /^co-authored-by:[^<\n]*\b(claude|codex|gpt|copilot|cursor|gemini|paperclip)\b/im;

export function countCommits(commits: GitHubCommit[]): { commits: number; aiCommits: number } {
  const authored = commits.filter((entry) => entry.parents.length < 2);
  return { commits: authored.length, aiCommits: authored.filter((entry) => AI_COAUTHOR.test(entry.commit.message)).length };
}
