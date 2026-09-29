import { describe, expect, it } from "vitest";
import { keepQedlyCode, mergeWithCache, onlyChecked, toReceipt, totals, type PullRequest, type Receipt } from "../src/lib/receipts";

const pr = (over: Partial<PullRequest> = {}): PullRequest => ({
  number: 7, title: "Add FAQ page", html_url: "https://github.com/qedly/qedly.github.io/pull/7",
  merged_at: "2026-10-02T10:00:00Z", head: { sha: "def4567890" },
  user: { login: "agentx-sdlc[bot]" }, merged_by: { login: "abhishek255" },
  body: "Adds the FAQ.\n\n---\nRequested in Slack thread https://slack.com/archives/C1/p1 by U0AAA, U0BBB.",
  ...over,
});
const run = { name: "site-build", conclusion: "success", started_at: "2026-10-02T09:50:00Z", completed_at: "2026-10-02T09:53:30Z", html_url: "https://github.com/r/1" };

describe("keepQedlyCode", () => {
  it("keeps only merged pull requests opened by the app", () => {
    const prs = [pr(), pr({ number: 8, user: { login: "abhishek255" } }), pr({ number: 9, merged_at: null }), pr({ number: 10, user: { login: "dependabot[bot]" } })];
    expect(keepQedlyCode(prs, "agentx-sdlc[bot]").map((entry) => entry.number)).toEqual([7]);
  });
});

describe("toReceipt", () => {
  it("shows a consented display name and never a raw Slack ID", () => {
    expect(toReceipt(pr(), [run], { U0AAA: "Pratik" }).requester).toBe("Pratik");
    const anonymous = toReceipt(pr(), [run], {});
    expect(anonymous.requester).toBe("a QEDly team member");
    expect(JSON.stringify(anonymous)).not.toContain("U0AAA");
  });
  it("names every consenting requester", () => {
    expect(toReceipt(pr(), [run], { U0AAA: "Pratik", U0BBB: "Abhishek" }).requester).toBe("Pratik, Abhishek");
  });
  it("records each check with its duration", () => {
    expect(toReceipt(pr(), [run], {}).gates).toEqual([{ name: "site-build", status: "success", seconds: 210, url: "https://github.com/r/1" }]);
  });
  it("uses the head commit, which is what the checks ran on", () => {
    expect(toReceipt(pr(), [run], {}).commit).toBe("def4567890");
  });
  it("keeps the Slack thread link out of the receipt", () => {
    expect(JSON.stringify(toReceipt(pr(), [run], {}))).not.toContain("slack.com");
  });
});

describe("mergeWithCache", () => {
  const cached: Receipt[] = [{ number: 7, title: "t", url: "u", commit: "c", gates: [{ name: "g", status: "success", seconds: 5, url: "x" }], requester: "r", mergedBy: "m", mergedAt: "2026-10-02T10:00:00Z", logsExpired: false }];
  it("keeps cached checks and marks logs expired when GitHub no longer returns them", () => {
    expect(mergeWithCache([{ ...cached[0], gates: [] }], cached)[0]).toMatchObject({ gates: cached[0].gates, logsExpired: true });
  });
  it("prefers fresh checks when GitHub still has them", () => {
    const fresh = [{ ...cached[0], gates: [{ name: "g", status: "failure", seconds: 9, url: "y" }] }];
    expect(mergeWithCache(fresh, cached)[0].gates[0].status).toBe("failure");
  });
});

describe("totals", () => {
  it("counts receipts, checks run and receipts whose checks all passed", () => {
    const base: Receipt = { number: 1, title: "", url: "", commit: "", requester: "", mergedBy: "", mergedAt: "", logsExpired: false, gates: [{ name: "g", status: "success", seconds: 1, url: "" }] };
    const retried: Receipt = { ...base, number: 2, gates: [{ name: "g", status: "failure", seconds: 1, url: "" }, { name: "g", status: "success", seconds: 1, url: "" }] };
    const unchecked: Receipt = { ...base, number: 3, gates: [] };
    expect(totals([base, retried, unchecked])).toEqual({ receipts: 3, checksRun: 3, allPassed: 1 });
  });
});

describe("onlyChecked", () => {
  it("drops pull requests that no CI run checked, because those are not receipts", () => {
    const checked = toReceipt(pr(), [run], {});
    const unchecked = toReceipt(pr({ number: 8 }), [], {});
    expect(onlyChecked([checked, unchecked]).map((receipt) => receipt.number)).toEqual([7]);
  });
});
