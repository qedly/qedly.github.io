import { posix } from "node:path";

/** docs/connectors/asana.md -> connectors/asana */
export function slugFor(sourcePath: string): string {
  return sourcePath.replace(/^docs\//, "").replace(/\.md$/, "");
}

/**
 * Rewrite one link in an AgentX docs page. Links to other docs pages become site routes; links to
 * anything else in the repository open on GitHub at the documented tag, so they never 404 on the site.
 */
export function rewriteLink(href: string, fromPath: string, repo: string, tag: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#") || href.startsWith("//")) return href;
  const hashIndex = href.indexOf("#");
  const path = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const resolved = posix.normalize(posix.join(posix.dirname(fromPath), path));
  if (resolved.startsWith("docs/") && resolved.endsWith(".md")) return `/docs/agentx/${slugFor(resolved)}/${hash}`;
  const isFolder = path.endsWith("/") || posix.extname(resolved) === "";
  const trailing = path.endsWith("/") ? "/" : "";
  return `https://github.com/${repo}/${isFolder ? "tree" : "blob"}/${tag}/${resolved.replace(/\/$/, "")}${trailing}${hash}`;
}

/** Turn one AgentX docs file into a Starlight page: H1 into frontmatter, release stamp, links rewritten outside code blocks. */
export function toStarlightPage(markdown: string, sourcePath: string, repo: string, tag: string): { slug: string; content: string } {
  const match = /^# (.+)\n+/.exec(markdown);
  if (!match) throw new Error(`${sourcePath} has no # title`);
  const parts = markdown.slice(match[0].length).split(/(```[\s\S]*?```)/g);
  const body = parts
    .map((part) => part.startsWith("```") ? part : part.replace(/\]\(([^)\s]+)\)/g, (_all, href: string) => `](${rewriteLink(href, sourcePath, repo, tag)})`))
    .join("");
  const title = match[1].trim();
  const content = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(`AgentX ${tag} documentation`)}\n---\n\n> Documents AgentX ${tag}.\n\n${body}`;
  return { slug: slugFor(sourcePath), content };
}
