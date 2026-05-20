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
          readme: true,
          sort: "stars",
          order: "asc",
          page: 2,
        },
        3,
      ),
    ).toBe(
      "/?q=react+testing&languages=TypeScript%2CJavaScript&frameworks=React%2CNext.js&clouds=AWS&stars=100&forks=100&lowIssues=true&recentlyUpdated=true&readme=true&sort=stars&order=asc&page=3",
    );
  });
});
