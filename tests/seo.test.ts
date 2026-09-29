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

import { faqLd, softwareApplicationLd } from "../src/lib/seo";
describe("structured data", () => {
  it("describes QEDly Code as a SoftwareApplication at the site URL", () => {
    expect(softwareApplicationLd()).toMatchObject({ "@type": "SoftwareApplication", name: "QEDly Code", url: "https://qedly.github.io/code" });
  });
  it("builds FAQPage structured data", () => {
    expect(faqLd([{ q: "How do I say it?", a: "Q-E-D-lee." }])).toEqual({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "How do I say it?", acceptedAnswer: { "@type": "Answer", text: "Q-E-D-lee." } }] });
  });
});
