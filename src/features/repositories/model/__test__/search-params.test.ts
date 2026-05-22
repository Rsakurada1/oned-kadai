import { describe, expect, it } from "vitest";

import {
  normalizeForkThreshold,
  normalizeOrder,
  normalizePage,
  normalizeSort,
  normalizeStarThreshold,
  parseSearchParams,
} from "../search-params";

describe("parseSearchParams", () => {
  it("trims q and normalizes page", () => {
    expect(parseSearchParams({ q: "  react  ", page: "3" })).toEqual({
      q: "react",
      languages: [],
      frameworks: [],
      clouds: [],
      stars: null,
      forks: null,
      lowIssues: false,
      recentlyUpdated: false,
      sort: "best-match",
      order: "desc",
      page: 3,
    });
  });

  it("normalizes repeated and comma-separated checkbox params", () => {
    expect(
      parseSearchParams({
        q: ["next", "react"],
        languages: ["TypeScript,JavaScript", "Unknown"],
        frameworks: ["React,Next.js"],
        clouds: ["AWS", "Docker"],
        stars: ["100", "1000"],
        forks: ["100"],
        lowIssues: "true",
        recentlyUpdated: "1",
        readme: "on",
        sort: ["stars"],
        order: ["asc"],
        page: ["2"],
      }),
    ).toEqual({
      q: "next",
      languages: ["TypeScript", "JavaScript"],
      frameworks: ["React", "Next.js"],
      clouds: ["AWS", "Docker"],
      stars: 1000,
      forks: 100,
      lowIssues: true,
      recentlyUpdated: true,
      sort: "stars",
      order: "asc",
      page: 2,
    });
  });

  it("returns initial search state for empty input", () => {
    expect(parseSearchParams()).toEqual({
      q: "",
      languages: [],
      frameworks: [],
      clouds: [],
      stars: null,
      forks: null,
      lowIssues: false,
      recentlyUpdated: false,
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

describe("normalizeStarThreshold", () => {
  it.each([
    [undefined, null],
    ["", null],
    ["-1", null],
    ["abc", null],
    ["100", 100],
    [["100", "1000"], 1000],
  ] as const)("normalizes %s to %s", (input, expected) => {
    expect(normalizeStarThreshold(input)).toBe(expected);
  });
});

describe("normalizeForkThreshold", () => {
  it.each([
    [undefined, null],
    ["", null],
    ["-1", null],
    ["99", 99],
    ["100", 100],
    ["100.9", 100],
  ] as const)("normalizes %s to %s", (input, expected) => {
    expect(normalizeForkThreshold(input)).toBe(expected);
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
