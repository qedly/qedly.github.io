import { describe, expect, it } from "vitest";
import { sectionOf, inlineHtml, bulletsHtml } from "../src/lib/markdown";

const doc = "# Security\n\nIntro.\n\n## What AgentX does not protect against\n\nThese limits come from the sources above.\n\n- **Shared accounts are not a boundary.** Use a `dedicated` account.\n  It wraps here.\n- See [the docs](/docs/x/) & more.\n\n## Next\n\nLater.\n";

describe("sectionOf", () => {
  it("returns the body of one ## section, up to the next ## heading", () => {
    expect(sectionOf(doc, "What AgentX does not protect against")).toBe("These limits come from the sources above.\n\n- **Shared accounts are not a boundary.** Use a `dedicated` account.\n  It wraps here.\n- See [the docs](/docs/x/) & more.");
  });
  it("throws when the section is missing, so a renamed heading fails the build", () => {
    expect(() => sectionOf(doc, "Nope")).toThrow(/Nope/);
  });
});

describe("inlineHtml", () => {
  it("keeps bold that wraps inline code", () => {
    expect(inlineHtml("**The `cdk` engine exposes it** while `cdk deploy` runs.")).toBe("<strong>The <code>cdk</code> engine exposes it</strong> while <code>cdk deploy</code> runs.");
  });
  it("escapes HTML and renders bold, code and links", () => {
    expect(inlineHtml("**a** `b<c>` [d](/e/) & f")).toBe('<strong>a</strong> <code>b&lt;c&gt;</code> <a href="/e/">d</a> &amp; f');
  });
});

describe("bulletsHtml", () => {
  it("renders the paragraphs and the bullet list, joining wrapped lines", () => {
    expect(bulletsHtml(sectionOf(doc, "What AgentX does not protect against"))).toBe(
      '<p>These limits come from the sources above.</p><ul><li><strong>Shared accounts are not a boundary.</strong> Use a <code>dedicated</code> account. It wraps here.</li><li>See <a href="/docs/x/">the docs</a> &amp; more.</li></ul>');
  });
});
