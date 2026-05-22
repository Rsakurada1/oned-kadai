import { describe, expect, it } from "vitest";

import type { RepositorySearchParams } from "../search-params";
import {
  createSearchFilterChips,
  createSearchFilterLabels,
  hasSearchCriteria,
} from "../search-state";

const initialSearch: RepositorySearchParams = {
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
};

describe("hasSearchCriteria", () => {
  it("detects only filters that can affect GitHub search results", () => {
    expect(hasSearchCriteria(initialSearch)).toBe(false);
    expect(
      hasSearchCriteria({
        ...initialSearch,
        sort: "stars",
      }),
    ).toBe(false);
    expect(
      hasSearchCriteria({
        ...initialSearch,
        languages: ["TypeScript"],
      }),
    ).toBe(true);
  });
});

describe("createSearchFilterLabels", () => {
  it("returns labels for active search filters", () => {
    expect(
      createSearchFilterLabels({
        ...initialSearch,
        q: "react",
        languages: ["TypeScript"],
        frameworks: ["Next.js"],
        clouds: ["AWS"],
        stars: 100,
        forks: 50,
        lowIssues: true,
        recentlyUpdated: true,
      }),
    ).toEqual([
      "キーワード: react",
      "言語: TypeScript",
      "FW: Next.js",
      "Cloud: AWS",
      "Star 100以上",
      "Fork 50以上",
      "Issueが少ない",
      "最近更新された",
    ]);
  });
});

describe("createSearchFilterChips", () => {
  it("adds sort as a removable chip without treating it as a search criterion", () => {
    expect(
      createSearchFilterChips({
        ...initialSearch,
        q: "react",
        sort: "stars",
      }),
    ).toEqual([
      {
        key: "q",
        label: "キーワード: react",
        removeSearch: {
          ...initialSearch,
          q: "",
          sort: "stars",
          page: 1,
        },
      },
      {
        key: "sort",
        label: "並び替え: stars",
        removeSearch: {
          ...initialSearch,
          q: "react",
          sort: "best-match",
          order: "desc",
          page: 1,
        },
      },
    ]);
  });
});
