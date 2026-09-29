/**
 * Fetch receipts (spec 042 FR-022) from the GitHub API into src/data/receipts.json.
 *
 *   SITE_READ_TOKEN       token that can read the repository (GITHUB_TOKEN in Actions); optional for a public repository
 *   RECEIPTS_REPO         the repository to read; defaults to SITE.siteRepo
 *   RECEIPTS_ALLOW_EMPTY  "1" lets the build pass with no receipts, for use before launch
 */
import { readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";
import { SITE } from "../src/config/site";
import { keepQedlyCode, mergeWithCache, onlyChecked, toReceipt, type CheckRun, type PullRequest, type Receipt } from "../src/lib/receipts";

const token = process.env.SITE_READ_TOKEN;
const repo = process.env.RECEIPTS_REPO ?? SITE.siteRepo;
const allowEmpty = process.env.RECEIPTS_ALLOW_EMPTY === "1";
const target = "src/data/receipts.json";
const headers: Record<string, string> = { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

async function get<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`receipts: ${url} returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

const cached: Receipt[] = await readFile(target, "utf8").then((text) => JSON.parse(text) as Receipt[]).catch(() => []);
try {
  const prs: PullRequest[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await get<PullRequest[]>(`https://api.github.com/repos/${repo}/pulls?state=closed&per_page=100&page=${page}`);
    prs.push(...batch);
    if (batch.length < 100) break;
  }
  const consent = (parse(await readFile("src/data/consent.yaml", "utf8")) ?? {}) as Record<string, string>;
  const fresh: Receipt[] = [];
  for (const listed of keepQedlyCode(prs, SITE.qedlyCodeAppLogin)) {
    // The list endpoint leaves merged_by out; the single pull request has it.
    const pr = await get<PullRequest>(`https://api.github.com/repos/${repo}/pulls/${listed.number}`);
    const runs = await get<{ check_runs: CheckRun[] }>(`https://api.github.com/repos/${repo}/commits/${pr.head.sha}/check-runs`);
    fresh.push(toReceipt(pr, runs.check_runs, consent));
  }
  const merged = mergeWithCache(fresh, cached);
  const unchecked = merged.length - onlyChecked(merged).length;
  if (unchecked) console.warn(`receipts: left out ${unchecked} pull requests that no CI run checked`);
  const receipts = onlyChecked(merged).sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
  if (receipts.length === 0 && !allowEmpty) {
    throw new Error("receipts: no QEDly Code pull requests with CI runs found; refusing to publish an empty Receipts page (set RECEIPTS_ALLOW_EMPTY=1 before launch)");
  }
  await writeFile(target, `${JSON.stringify(receipts, null, 2)}\n`);
  console.log(`wrote ${receipts.length} receipts from ${repo}`);
} catch (error) {
  if (cached.length === 0 && !allowEmpty) throw error;
  console.warn(`receipts: kept ${cached.length} cached receipts: ${(error as Error).message}`);
  await writeFile(target, `${JSON.stringify(cached, null, 2)}\n`);
}
