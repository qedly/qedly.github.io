/**
 * Receipts (spec 042 FR-022): one per merged pull request that QEDly Code opened on the site repository.
 * A receipt is always a commit and the CI runs that checked it; it never repeats an agent's own report.
 */
export type PullRequest = {
  number: number; title: string; html_url: string; merged_at: string | null;
  head: { sha: string }; user: { login: string }; merged_by: { login: string } | null; body: string | null;
};
export type CheckRun = { name: string; conclusion: string | null; started_at: string | null; completed_at: string | null; html_url: string };
export type Gate = { name: string; status: string; seconds: number | null; url: string };
export type Receipt = { number: number; title: string; url: string; commit: string; gates: Gate[]; requester: string; mergedBy: string; mergedAt: string; logsExpired: boolean };

export function keepQedlyCode(prs: PullRequest[], appLogin: string): PullRequest[] {
  return prs.filter((entry) => entry.merged_at && entry.user.login === appLogin);
}

/** Only names people agreed to show (src/data/consent.yaml). Slack IDs and thread links never reach the site. */
function requesterOf(body: string | null, consent: Record<string, string>): string {
  const ids = /Requested in Slack thread \S+ by ([A-Z0-9, ]+)\./.exec(body ?? "")?.[1]?.split(",").map((id) => id.trim()) ?? [];
  const named = ids.map((id) => consent[id]).filter((name): name is string => Boolean(name));
  return named.length ? named.join(", ") : "a QEDly team member";
}

export function toReceipt(pr: PullRequest, checkRuns: CheckRun[], consent: Record<string, string>): Receipt {
  const gates = checkRuns.map((run) => ({
    name: run.name,
    status: run.conclusion ?? "pending",
    seconds: run.started_at && run.completed_at ? Math.round((Date.parse(run.completed_at) - Date.parse(run.started_at)) / 1000) : null,
    url: run.html_url,
  }));
  return {
    number: pr.number, title: pr.title, url: pr.html_url, commit: pr.head.sha, gates,
    requester: requesterOf(pr.body, consent), mergedBy: pr.merged_by?.login ?? "unknown", mergedAt: pr.merged_at ?? "", logsExpired: false,
  };
}

/** GitHub drops old check runs. A receipt keeps the result it recorded and says the log has expired. */
export function mergeWithCache(fresh: Receipt[], cached: Receipt[]): Receipt[] {
  const byNumber = new Map(cached.map((receipt) => [receipt.number, receipt]));
  return fresh.map((receipt) => {
    const old = byNumber.get(receipt.number);
    return receipt.gates.length === 0 && old && old.gates.length > 0 ? { ...receipt, gates: old.gates, logsExpired: true } : receipt;
  });
}

/** A pull request that no CI run checked is not a receipt, whatever its description says. */
export function onlyChecked(receipts: Receipt[]): Receipt[] {
  return receipts.filter((receipt) => receipt.gates.length > 0);
}

export function totals(receipts: Receipt[]): { receipts: number; checksRun: number; allPassed: number } {
  return {
    receipts: receipts.length,
    checksRun: receipts.reduce((sum, receipt) => sum + receipt.gates.length, 0),
    allPassed: receipts.filter((receipt) => receipt.gates.length > 0 && receipt.gates.every((gate) => gate.status === "success")).length,
  };
}
