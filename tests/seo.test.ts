import { describe, expect, it } from "vitest";
import { robotsTxt } from "../src/lib/seo";

describe("robotsTxt", () => {
  it("disallows everything before launch", () => {
    expect(robotsTxt(false, "https://qedly.github.io/sitemap-index.xml")).toBe("User-agent: *\nDisallow: /\n");
  });
  it("allows crawling and names the sitemap after launch", () => {
    expect(robotsTxt(true, "https://qedly.github.io/sitemap-index.xml")).toBe("User-agent: *\nAllow: /\n\nSitemap: https://qedly.github.io/sitemap-index.xml\n");
  });
});
