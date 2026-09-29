import { describe, expect, it } from "vitest";
import { findBanned } from "../src/lib/banned";

describe("banned words", () => {
  it("finds a banned word in visible text, case-insensitively", () => {
    expect(findBanned("<p>An Autonomous agent.</p>").map((hit) => hit.word)).toEqual(["autonomous"]);
  });
  it("finds multi-word phrases", () => {
    expect(findBanned("<h2>Your software factory</h2>").map((hit) => hit.word)).toEqual(["software factory"]);
  });
  it("skips text inside data-quote elements", () => {
    expect(findBanned("<p>Devin calls itself <q data-quote>an autonomous software engineer</q>.</p>")).toEqual([]);
  });
  it("still checks our own words next to a quote", () => {
    expect(findBanned('<p>An autonomous agent, unlike <q data-quote>x</q>.</p>').map((hit) => hit.word)).toEqual(["autonomous"]);
  });
  it("ignores markup, scripts and attributes", () => {
    expect(findBanned('<div class="teammate"><script>var swarm=1</script>ok</div>')).toEqual([]);
  });
  it("does not match inside longer words", () => {
    expect(findBanned("<p>autonomously and autonomousness</p>")).toEqual([]);
  });
});
