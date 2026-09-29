/**
 * Just enough Markdown to quote a docs section on a marketing page word for word: paragraphs, one level of
 * bullets, bold, inline code and links. Anything richer belongs in the docs themselves.
 */
export function sectionOf(markdown: string, heading: string): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) throw new Error(`section "${heading}" not found`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^#{1,2} /.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inlineHtml(text: string): string {
  // Set code spans aside first, so bold and links can wrap them and nothing inside them is treated as Markdown.
  const codes: string[] = [];
  const marked = text.replace(/`([^`]+)`/g, (_all, code: string) => `\u0000${codes.push(code) - 1}\u0000`);
  return escape(marked)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\u0000(\d+)\u0000/g, (_all, index: string) => `<code>${escape(codes[Number(index)])}</code>`);
}

export function bulletsHtml(section: string): string {
  return section.split(/\n\s*\n/).map((block) => {
    if (!/^- /.test(block)) return `<p>${inlineHtml(block.replace(/\s*\n\s*/g, " "))}</p>`;
    const items = block.split(/\n(?=- )/).map((item) => `<li>${inlineHtml(item.replace(/^- /, "").replace(/\s*\n\s*/g, " "))}</li>`);
    return `<ul>${items.join("")}</ul>`;
  }).join("");
}
