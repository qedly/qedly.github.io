/**
 * The docs sync (spec 042 FR-030). Copies AgentX's docs/ at one release tag into Starlight pages.
 *
 *   AGENTX_READ_TOKEN  read-only token for PrepLabsAI/AgentX while it is private
 *   DOCS_REF           the AgentX ref to copy; defaults to SITE.docsRelease. Before the first release tag, use a branch.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SITE } from "../src/config/site";
import { toStarlightPage } from "../src/lib/docs";

const token = process.env.AGENTX_READ_TOKEN;
const ref = process.env.DOCS_REF ?? SITE.docsRelease;
const headers: Record<string, string> = { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
const out = "src/content/docs/docs/agentx";

async function list(path: string): Promise<string[]> {
  const response = await fetch(`https://api.github.com/repos/${SITE.agentxRepo}/contents/${path}?ref=${encodeURIComponent(ref)}`, { headers });
  if (!response.ok) throw new Error(`docs sync: ${path} at ${ref} returned HTTP ${response.status}`);
  const entries = (await response.json()) as { type: string; path: string }[];
  const nested = await Promise.all(entries.map((entry) =>
    entry.type === "dir" ? list(entry.path) : Promise.resolve(entry.path.endsWith(".md") ? [entry.path] : [])));
  return nested.flat();
}

const files = await list("docs");
if (files.length === 0) throw new Error("docs sync: no pages found");
await rm(out, { recursive: true, force: true });
for (const file of files) {
  const raw = await fetch(`https://api.github.com/repos/${SITE.agentxRepo}/contents/${file}?ref=${encodeURIComponent(ref)}`, { headers: { ...headers, Accept: "application/vnd.github.raw" } });
  if (!raw.ok) throw new Error(`docs sync: ${file} returned HTTP ${raw.status}`);
  // The docs are labelled with the release they document; a branch ref shows as the branch name.
  const page = toStarlightPage(await raw.text(), file, SITE.agentxRepo, ref);
  const target = join(out, `${page.slug}.md`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, page.content);
}
console.log(`synced ${files.length} docs pages from ${SITE.agentxRepo}@${ref}`);
