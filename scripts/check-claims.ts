/**
 * The claims check (spec 042 FR-013). Fails when a current claim's evidence no longer resolves in
 * AgentX, or when built marketing HTML contains a banned word.
 *
 *   AGENTX_READ_TOKEN  read-only token for the private AgentX repository (not needed once it is public)
 *   CLAIMS_REF         the AgentX ref to check evidence against; defaults to SITE.docsRelease.
 *                      Before the first release tag exists, use CLAIMS_REF=mainline.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, sep } from "node:path";
import { loadClaims, type Evidence } from "../src/lib/claims";
import { findBanned } from "../src/lib/banned";
import { SITE } from "../src/config/site";

const token = process.env.AGENTX_READ_TOKEN;
const ref = process.env.CLAIMS_REF || SITE.docsRelease;
const headers: Record<string, string> = { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

async function resolves(evidence: Evidence): Promise<string | null> {
  const url = evidence.kind === "pr"
    ? `https://api.github.com/repos/${evidence.repo}/pulls/${evidence.number}`
    : `https://api.github.com/repos/${evidence.repo}/contents/${evidence.path}?ref=${encodeURIComponent(ref)}`;
  const response = await fetch(url, { headers });
  if (!response.ok) return `HTTP ${response.status}`;
  if (evidence.kind === "pr" && !(await response.json()).merged_at) return "not merged";
  return null;
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map((entry) =>
    entry.isDirectory() ? htmlFiles(join(dir, entry.name)) : Promise.resolve(entry.name.endsWith(".html") ? [join(dir, entry.name)] : [])));
  return nested.flat();
}

const problems: string[] = [];
const claims = loadClaims(await readFile("src/data/claims.yaml", "utf8"));
for (const claim of claims.filter((entry) => entry.status === "now")) {
  for (const evidence of claim.evidence) {
    const problem = await resolves(evidence);
    if (problem) problems.push(`claim ${claim.id}: ${JSON.stringify(evidence)} at ${ref}: ${problem}`);
  }
}

// Synced AgentX docs document the product rather than market it, so the banned-word scan skips them.
const syncedDocs = join("dist", "docs", "agentx") + sep;
const pages = (await htmlFiles("dist")).filter((file) => !file.startsWith(syncedDocs) && !file.startsWith(join("dist", "pagefind")));
for (const file of pages) {
  for (const hit of findBanned(await readFile(file, "utf8"))) problems.push(`${file}: banned "${hit.word}" in "${hit.context}"`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`claims check passed: ${claims.length} claims at ${ref}, ${pages.length} pages scanned`);
