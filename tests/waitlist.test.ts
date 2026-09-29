import { describe, expect, it } from "vitest";
import { waitlistAction, WAITLIST_TAGS } from "../src/lib/waitlist";

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
