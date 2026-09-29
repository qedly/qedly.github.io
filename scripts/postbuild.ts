/**
 * After astro build (spec 042 FR-042): Markdown copies of the docs, llms.txt, llms-full.txt,
 * robots.txt, the Open Graph PNG, and the sitemap without internal pages.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";
import { absoluteUrl, SITE } from "../src/config/site";
import { buildLlmsFull, buildLlmsTxt, docPageFrom } from "../src/lib/llms";
import { robotsTxt } from "../src/lib/seo";

const source = "src/content/docs/docs/agentx";
const INTERNAL = ["/styleguide/"];

const files = (await readdir(source, { recursive: true })).filter((file) => file.endsWith(".md")).sort();
if (files.length === 0) throw new Error(`postbuild: no docs in ${source}; run npm run sync:docs first`);
const pages = await Promise.all(files.map(async (file) =>
  docPageFrom(await readFile(join(source, file), "utf8"), relative(source, join(source, file)).replace(/\.md$/, ""))));
for (const page of pages) {
  const target = join("dist", page.path.replace(/\/$/, ".md"));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `# ${page.title}\n\n${page.markdown}\n`);
}
await writeFile("dist/llms.txt", buildLlmsTxt(pages));
await writeFile("dist/llms-full.txt", buildLlmsFull(pages));
await writeFile("dist/robots.txt", robotsTxt(SITE.launched, absoluteUrl("/sitemap-index.xml")));
// Social sites do not render SVG previews; the template is all paths, so it needs no fonts.
await sharp("public/brand/og-template.svg").png().toFile("dist/brand/og.png");

const sitemap = "dist/sitemap-0.xml";
const xml = await readFile(sitemap, "utf8");
await writeFile(sitemap, INTERNAL.reduce((out, path) => out.replace(`<url><loc>${absoluteUrl(path)}</loc></url>`, ""), xml));
console.log(`postbuild: ${pages.length} docs copies, llms.txt, robots.txt (${SITE.launched ? "open" : "closed"}), og.png`);
