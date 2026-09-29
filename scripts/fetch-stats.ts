/**
 * Count AgentX mainline commits since the rebuild into src/data/stats.json, for the founders' line.
 *
 *   AGENTX_READ_TOKEN  read-only token for PrepLabsAI/AgentX while it is private
 */
import { writeFile } from "node:fs/promises";
import { SITE } from "../src/config/site";
import { countCommits, REBUILD_DATE, type GitHubCommit, type Stats } from "../src/lib/stats";

const token = process.env.AGENTX_READ_TOKEN;
const headers: Record<string, string> = { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
const commits: GitHubCommit[] = [];
for (let page = 1; ; page += 1) {
  const url = `https://api.github.com/repos/${SITE.agentxRepo}/commits?sha=mainline&since=${REBUILD_DATE}T00:00:00Z&per_page=100&page=${page}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`stats: ${url} returned HTTP ${response.status}`);
  const batch = (await response.json()) as GitHubCommit[];
  commits.push(...batch);
  if (batch.length < 100) break;
}
const stats: Stats = { since: REBUILD_DATE, ...countCommits(commits) };
await writeFile("src/data/stats.json", `${JSON.stringify(stats, null, 2)}\n`);
console.log(`stats: ${stats.commits} commits since ${REBUILD_DATE}, ${stats.aiCommits} co-written by AI agents`);
