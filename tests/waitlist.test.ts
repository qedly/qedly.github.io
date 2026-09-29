import { describe, expect, it } from "vitest";
import { waitlistAction, WAITLIST_TAGS } from "../src/lib/waitlist";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import WaitlistForm from "../src/components/site/WaitlistForm.astro";

describe("waitlist", () => {
  it("posts to the list's Buttondown embed-subscribe address", () => {
    expect(waitlistAction("qedly")).toBe("https://buttondown.com/api/emails/embed-subscribe/qedly");
  });
  it("escapes an odd username rather than building a different address", () => {
    expect(waitlistAction("a/b")).toBe("https://buttondown.com/api/emails/embed-subscribe/a%2Fb");
  });
  it("lists the two product waitlists and the design-partner list", () => {
    expect(WAITLIST_TAGS).toEqual(["workspace", "cloud", "partners"]);
  });
});

describe("WaitlistForm", () => {
  it("sends the email and the chosen product as Buttondown metadata, not a paid tag", async () => {
    const html = await (await AstroContainer.create()).renderToString(WaitlistForm, { props: { tag: "cloud", product: "QEDly Cloud" } });
    expect(html).toContain('name="email"');
    expect(html).toContain('name="metadata__product" value="cloud"');
    expect(html).not.toContain('name="tag"');
  });
  it("uses the label and button it is given, for the design-partner form", async () => {
    const html = await (await AstroContainer.create()).renderToString(WaitlistForm, { props: { tag: "partners", product: "the design-partner programme", label: "Talk to the founders about a pilot", button: "Become a design partner" } });
    expect(html).toContain("Talk to the founders about a pilot");
    expect(html).toContain("Become a design partner");
    expect(html).toContain('name="metadata__product" value="partners"');
  });
});
