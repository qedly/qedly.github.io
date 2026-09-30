import { describe, expect, it } from "vitest";
import { rewriteLink, slugFor, toStarlightPage } from "../src/lib/docs";

const repo = "PrepLabsAI/AgentX";
const tag = "v0.1.0";

describe("rewriteLink", () => {
  it("sends README anchors to GitHub at the tag", () => {
    expect(rewriteLink("../README.md#configure-codebuild-gates", "docs/project-configuration.md", repo, tag))
      .toBe("https://github.com/PrepLabsAI/AgentX/blob/v0.1.0/README.md#configure-codebuild-gates");
  });
  it("sends example folders and source files to GitHub at the tag", () => {
    expect(rewriteLink("../examples/projects/", "docs/project-configuration.md", repo, tag))
      .toBe("https://github.com/PrepLabsAI/AgentX/tree/v0.1.0/examples/projects/");
    expect(rewriteLink("../packages/contracts/src/project.ts", "docs/project-configuration.md", repo, tag))
      .toBe("https://github.com/PrepLabsAI/AgentX/blob/v0.1.0/packages/contracts/src/project.ts");
  });
  it("turns links between docs pages into site routes, keeping anchors", () => {
    expect(rewriteLink("connectors/linear.md", "docs/project-configuration.md", repo, tag)).toBe("/docs/agentx/connectors/linear/");
    expect(rewriteLink("../openrouter.md#setup", "docs/connectors/jira.md", repo, tag)).toBe("/docs/agentx/openrouter/#setup");
  });
  it("leaves in-page anchors, absolute URLs and mail links alone", () => {
    expect(rewriteLink("#fields", "docs/cli.md", repo, tag)).toBe("#fields");
    expect(rewriteLink("https://example.com/x", "docs/cli.md", repo, tag)).toBe("https://example.com/x");
    expect(rewriteLink("mailto:a@b.co", "docs/cli.md", repo, tag)).toBe("mailto:a@b.co");
  });
});

describe("toStarlightPage", () => {
  it("moves the H1 into frontmatter, stamps the release and rewrites links", () => {
    const page = toStarlightPage("# Project configuration\n\nSee [Linear](connectors/linear.md).\n", "docs/project-configuration.md", repo, tag);
    expect(page.slug).toBe("project-configuration");
    expect(page.content).toBe('---\ntitle: "Project configuration"\ndescription: "AgentX v0.1.0 documentation"\nsidebar:\n  order: 4\n---\n\n> Documents AgentX v0.1.0.\n\nSee [Linear](/docs/agentx/connectors/linear/).\n');
  });
  it("quotes titles that contain a colon", () => {
    expect(toStarlightPage("# Setup: the short way\n\nx\n", "docs/a.md", repo, tag).content).toContain('title: "Setup: the short way"');
  });
  it("refuses a page with no H1", () => {
    expect(() => toStarlightPage("no title\n", "docs/cli.md", repo, tag)).toThrow(/docs\/cli.md has no # title/);
  });
  it("leaves links inside code blocks alone", () => {
    const page = toStarlightPage("# T\n\n```md\n[x](connectors/linear.md)\n```\n", "docs/a.md", repo, tag);
    expect(page.content).toContain("[x](connectors/linear.md)");
  });
});

describe("slugFor", () => {
  it("keeps sub-folders", () => {
    expect(slugFor("docs/connectors/asana.md")).toBe("connectors/asana");
  });
});

describe("sidebar order", () => {
  it("puts the reader's path first and leaves unlisted pages after it", () => {
    const quickstart = toStarlightPage("# Quickstart\n\nx\n", "docs/quickstart.md", "o/r", "v1").content;
    const other = toStarlightPage("# Zeta\n\nx\n", "docs/zeta.md", "o/r", "v1").content;
    expect(quickstart).toContain("sidebar:\n  order: 1\n");
    expect(other).toContain("sidebar:\n  order: 100\n");
  });
});
