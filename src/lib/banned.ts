/** Words our copy never uses (spec FR-003). Quoted competitor wording goes inside an element with data-quote. */
export const BANNED = [
  "10x", "autonomous", "ai engineer", "ai employee", "teammate", "swarm", "army of agents",
  "software factory", "mission control", "production-ready in minutes", "game-changing",
  "enterprise-grade", "open source",
] as const;

function visibleText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<([a-z0-9]+)\b[^>]*\bdata-quote\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function escape(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}

export function findBanned(html: string): { word: string; context: string }[] {
  const text = visibleText(html);
  const hits: { word: string; context: string }[] = [];
  for (const word of BANNED) {
    const pattern = new RegExp(`(?<![a-z0-9])${escape(word)}(?![a-z0-9])`, "gi");
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      hits.push({ word, context: text.slice(Math.max(0, index - 40), index + word.length + 40).trim() });
    }
  }
  return hits;
}
