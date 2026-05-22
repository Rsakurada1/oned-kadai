import { describe, expect, it } from "vitest";

import { createRepositorySearchUrl } from "../search-url";

describe("createRepositorySearchUrl", () => {
  it("preserves advanced filters in the URL", () => {
    expect(
      createRepositorySearchUrl(
        {
          q: "react testing",
          languages: ["TypeScript", "JavaScript"],
          frameworks: ["React", "Next.js"],
          clouds: ["AWS"],
          stars: 100,
          forks: 100,
          lowIssues: true,
          recentlyUpdated: true,
          sort: "stars",
          order: "asc",
          page: 2,
        },
        3,
      ),
    ).toBe(
      "/?q=react+testing&languages=TypeScript%2CJavaScript&frameworks=React%2CNext.js&clouds=AWS&stars=100&forks=100&lowIssues=true&recentlyUpdated=true&sort=stars&order=asc&page=3",
    );
  });

  it("drops sort-only state because sorting has no effect before a search", () => {
    expect(
      createRepositorySearchUrl({
        q: "",
        languages: [],
        frameworks: [],
        clouds: [],
        stars: null,
        forks: null,
        lowIssues: false,
        recentlyUpdated: false,
        sort: "stars",
        order: "desc",
        page: 4,
      }),
    ).toBe("/");
  });
});
