import { describe, expect, it } from "vitest";
import { PRODUCTS } from "../src/data/products";

describe("products", () => {
  it("carries the spec's statuses exactly", () => {
    expect(PRODUCTS.map((product) => [product.name, product.status])).toEqual([
      ["QEDly Code", "now"], ["QEDly Checks", "now"], ["QEDly Workspace", "next"],
      ["QEDly Passport", "next"], ["QEDly Outcomes", "later"], ["QEDly Cloud", "later"],
    ]);
  });
  it("offers waitlists only for Workspace and Cloud", () => {
    expect(PRODUCTS.filter((product) => product.waitlist).map((product) => product.waitlist)).toEqual(["workspace", "cloud"]);
  });
});
