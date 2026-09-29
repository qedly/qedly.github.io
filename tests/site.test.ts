import { describe, expect, it } from "vitest";
import { SITE, absoluteUrl, STATUS_LABEL } from "../src/config/site";

describe("site settings", () => {
  it("builds absolute URLs from the one site URL", () => {
    expect(absoluteUrl("/docs/")).toBe("https://qedly.github.io/docs/");
    expect(absoluteUrl("receipts")).toBe("https://qedly.github.io/receipts");
  });
  it("keeps the licence wording exact", () => {
    expect(SITE.licence).toBe("Source-available (FSL-1.1-ALv2). Every line is readable. Each release becomes Apache 2.0 two years after it ships.");
  });
  it("writes the name with QED in capitals", () => {
    expect(SITE.name).toBe("QEDly");
  });
  it("uses exactly three status labels", () => {
    expect(STATUS_LABEL).toEqual({ now: "Now", next: "Next", later: "Later" });
  });
  it("starts unlaunched", () => {
    expect(SITE.launched).toBe(false);
  });
});
