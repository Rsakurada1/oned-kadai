import { describe, expect, it } from "vitest";

import {
  normalizeMinStars,
  normalizeOrder,
  normalizePage,
  normalizeSort,
  parseSearchParams,
} from "../search-params";

describe("parseSearchParams", () => {
  it("trims q and normalizes page", () => {
    expect(parseSearchParams({ q: "  react  ", page: "3" })).toEqual({
      q: "react",
      language: "",
      topic: "",
      minStars: null,
      sort: "best-match",
      order: "desc",
      page: 3,
    });
  });

  it("uses the first value when search params contain arrays", () => {
    expect(
      parseSearchParams({
        q: ["next", "react"],
        language: ["TypeScript", "JavaScript"],
        topic: ["frontend"],
        minStars: ["100"],
        sort: ["stars"],
        order: ["asc"],
        page: ["2"],
      }),
    ).toEqual({
      q: "next",
      language: "TypeScript",
      topic: "frontend",
      minStars: 100,
      sort: "stars",
      order: "asc",
      page: 2,
    });
  });

  it("returns initial search state for empty input", () => {
    expect(parseSearchParams()).toEqual({
      q: "",
      language: "",
      topic: "",
      minStars: null,
      sort: "best-match",
      order: "desc",
      page: 1,
    });
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

describe("normalizeMinStars", () => {
  it.each([
    [undefined, null],
    ["", null],
    ["-1", null],
    ["abc", null],
    ["100.9", 100],
    [200, 200],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeMinStars(input)).toBe(expected);
  });
});

describe("normalizeSort", () => {
  it.each([
    ["stars", "stars"],
    ["forks", "forks"],
    ["updated", "updated"],
    ["unknown", "best-match"],
  ] as const)("normalizes %s to %s", (input, expected) => {
    expect(normalizeSort(input)).toBe(expected);
  });
});

describe("normalizeOrder", () => {
  it.each([
    ["asc", "asc"],
    ["desc", "desc"],
    ["unknown", "desc"],
  ] as const)("normalizes %s to %s", (input, expected) => {
    expect(normalizeOrder(input)).toBe(expected);
  });
});
