import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import ProofTable from "../src/components/brand/ProofTable.astro";
import Strike from "../src/components/brand/Strike.astro";
import MarkerBox from "../src/components/brand/MarkerBox.astro";
import Highlight from "../src/components/brand/Highlight.astro";
import HandNote from "../src/components/brand/HandNote.astro";
import Eyebrow from "../src/components/brand/Eyebrow.astro";
import Button from "../src/components/brand/Button.astro";

const container = await AstroContainer.create();
const render = (component: any, props = {}, slot?: string) =>
  container.renderToString(component, { props, ...(slot ? { slots: { default: slot } } : {}) });

describe("ProofTable", () => {
  const props = {
    given: "Priya asks for a Notes page.",
    toProve: "the change works.",
    rows: [
      { statement: "Unit tests pass.", reason: "Your CodeBuild, on 4e60f7b", passed: true },
      { statement: "A person decides.", reason: "Pull request opened for Priya" },
    ],
    conclusion: "The change works.",
  };

  it("numbers every statement and pairs it with its reason", async () => {
    const html = await render(ProofTable, props);
    expect(html).toContain("1.");
    expect(html).toContain("2.");
    expect(html).toContain("Unit tests pass.");
    expect(html).toContain("Your CodeBuild, on 4e60f7b");
  });

  it("always labels itself an illustration unless told it is a real receipt", async () => {
    expect(await render(ProofTable, props)).toContain("Illustration");
    expect(await render(ProofTable, { ...props, illustration: false })).not.toContain("Illustration");
  });

  it("ends with the therefore sign and the QED stamp", async () => {
    const html = await render(ProofTable, props);
    expect(html).toContain("∴");
    expect(html).toContain('alt="QED"');
  });
});

describe("hand-drawn marks", () => {
  it("Strike keeps the struck text readable and draws the pen line as decoration", async () => {
    const html = await render(Strike, {}, "done");
    expect(html).toContain("done");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("<del");
  });

  it("MarkerBox draws a box around its text", async () => {
    const html = await render(MarkerBox, {}, "QED.");
    expect(html).toContain("QED.");
    expect(html).toMatch(/<path[^>]*class="[^"]*q-draw/);
  });

  it("Highlight marks its text", async () => {
    expect(await render(Highlight, {}, "prove its work")).toMatch(/<mark[^>]*>prove its work<\/mark>/);
  });

  it("HandNote uses one of the pen colours only", async () => {
    expect(await render(HandNote, { pen: "red" }, "same commit")).toContain("q-pen-red");
    await expect(render(HandNote, { pen: "purple" }, "x")).rejects.toThrow(/pen/);
  });
});

describe("labels and actions", () => {
  it("Eyebrow renders its text in the chosen tone", async () => {
    expect(await render(Eyebrow, { tone: "green" }, "Step 2 · Prove")).toContain("q-tone-green");
  });

  it("Button is a real link", async () => {
    const html = await render(Button, { href: "/docs/", variant: "primary" }, "Deploy QEDly Code");
    expect(html).toMatch(/<a[^>]*href="\/docs\/"/);
    expect(html).toContain("Deploy QEDly Code");
  });
});
