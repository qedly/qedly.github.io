import { parse } from "yaml";
import { absoluteUrl } from "../config/site";

/** llms.txt (spec 042 FR-042): an index of the docs, each linked to its Markdown copy. */
export function buildLlmsTxt(pages: { title: string; path: string; summary: string }[]): string {
  const lines = pages.map((page) => `- [${page.title}](${absoluteUrl(page.path.replace(/\/$/, ".md"))}): ${page.summary}`);
  return `# QEDly\n\n> QEDly is where people and AI agents take work from a hunch to a proven result. QEDly Code is the first product.\n\n## Docs\n\n${lines.join("\n")}\n`;
}

export function buildLlmsFull(pages: { title: string; markdown: string }[]): string {
  return pages.map((page) => `# ${page.title}\n\n${page.markdown}\n`).join("\n");
}

/** One synced docs page: its title, route, a one-line summary and its Markdown without frontmatter. */
export function docPageFrom(source: string, slug: string): { title: string; path: string; summary: string; markdown: string } {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  const title = String((match ? parse(match[1]) : {})?.title ?? slug);
  const markdown = source.slice(match?.[0].length ?? 0).trim();
  const prose = markdown.replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/).map((block) => block.trim())
    .find((block) => block && !/^[>#\-*|<!\d]/.test(block));
  return { title, path: `/docs/agentx/${slug}/`, summary: prose ? prose.replace(/\s+/g, " ") : title, markdown };
}
