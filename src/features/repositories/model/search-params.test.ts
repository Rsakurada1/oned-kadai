import { describe, expect, it } from "vitest";

import { normalizePage, parseSearchParams } from "./search-params";

describe("parseSearchParams", () => {
  it("trims q and normalizes page", () => {
    expect(parseSearchParams({ q: "  react  ", page: "3" })).toEqual({
      q: "react",
      page: 3,
    });
  });

  it("uses the first value when search params contain arrays", () => {
    expect(parseSearchParams({ q: ["next", "react"], page: ["2"] })).toEqual({
      q: "next",
      page: 2,
    });
  });

  it("returns initial search state for empty input", () => {
    expect(parseSearchParams()).toEqual({ q: "", page: 1 });
  });
});

describe("normalizePage", () => {
  it.each([
    [undefined, 1],
    ["", 1],
    ["0", 1],
    ["-1", 1],
    ["abc", 1],
    ["2.9", 2],
    [4, 4],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizePage(input)).toBe(expected);
  });
});

