import { describe, expect, it } from "vitest";
import { waitlistAction, WAITLIST_TAGS } from "../src/lib/waitlist";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import WaitlistForm from "../src/components/site/WaitlistForm.astro";

describe("waitlist", () => {
  it("posts to the list's Buttondown embed-subscribe address", () => {
    expect(waitlistAction("qedly")).toBe("https://buttondown.com/qedly/embed-subscribe");
  });
  it("escapes an odd username rather than building a different address", () => {
    expect(waitlistAction("a/b")).toBe("https://buttondown.com/a%2Fb/embed-subscribe");
  });
  it("tags only the two products that take a waitlist", () => {
    expect(WAITLIST_TAGS).toEqual(["workspace", "cloud"]);
  });
});

describe("WaitlistForm", () => {
  it("sends the email and the chosen product as Buttondown metadata, not a paid tag", async () => {
    const html = await (await AstroContainer.create()).renderToString(WaitlistForm, { props: { tag: "cloud", product: "QEDly Cloud" } });
    expect(html).toContain('name="email"');
    expect(html).toContain('name="metadata__product" value="cloud"');
    expect(html).not.toContain('name="tag"');
  });
});
