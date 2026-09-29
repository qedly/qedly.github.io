import { describe, expect, it } from "vitest";
import { buildLlmsFull, buildLlmsTxt, docPageFrom } from "../src/lib/llms";

describe("llms.txt", () => {
  it("lists docs with absolute URLs from the site setting", () => {
    expect(buildLlmsTxt([{ title: "Quickstart", path: "/docs/agentx/quickstart/", summary: "Install AgentX." }]))
      .toBe("# QEDly\n\n> QEDly is where people and AI agents take work from a hunch to a proven result. QEDly Code is the first product.\n\n## Docs\n\n- [Quickstart](https://qedly.github.io/docs/agentx/quickstart.md): Install AgentX.\n");
  });
  it("bundles full docs in order", () => {
    expect(buildLlmsFull([{ title: "A", markdown: "one" }, { title: "B", markdown: "two" }])).toBe("# A\n\none\n\n# B\n\ntwo\n");
  });
});

describe("docPageFrom", () => {
  const synced = '---\ntitle: "Jira: connect"\ndescription: "AgentX v0.1.0 documentation"\n---\n\n> Documents AgentX v0.1.0.\n\nConnect Jira with an\nAPI token.\n\n## Steps\n\nMore.\n';
  it("reads the title, strips frontmatter and summarises with the first real paragraph", () => {
    expect(docPageFrom(synced, "connectors/jira")).toEqual({
      title: "Jira: connect", path: "/docs/agentx/connectors/jira/", summary: "Connect Jira with an API token.",
      markdown: "> Documents AgentX v0.1.0.\n\nConnect Jira with an\nAPI token.\n\n## Steps\n\nMore.",
    });
  });
  it("falls back to the title when a page has no prose paragraph", () => {
    expect(docPageFrom('---\ntitle: "Only code"\n---\n\n```sh\nls\n```\n', "x").summary).toBe("Only code");
  });
});
