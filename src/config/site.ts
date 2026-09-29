/** The one place for site-wide settings. Change the URL here and every canonical link, sitemap entry and llms.txt link follows. */
export const SITE = {
  url: "https://qedly.github.io",
  name: "QEDly",
  tagline: "From hunch to proof.",
  licence: "Source-available (FSL-1.1-ALv2). Every line is readable. Each release becomes Apache 2.0 two years after it ships.",
  docsRelease: "v0.1.0",
  agentxRepo: "PrepLabsAI/AgentX",
  siteRepo: "qedly/qedly.github.io",
  qedlyCodeAppLogin: "agentx-sdlc[bot]",
  buttondownUser: "qedly",
  /** The one place the install command is written. The CLI rename (plan Owner TODO) changes only this. */
  installCommand: "npx @charterarc/agentx init",
  launched: false,
} as const;

export type Status = "now" | "next" | "later";
export const STATUS_LABEL: Record<Status, string> = { now: "Now", next: "Next", later: "Later" };

export function absoluteUrl(path: string): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE.url).toString();
}
