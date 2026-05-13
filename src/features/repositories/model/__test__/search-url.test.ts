import { describe, expect, it } from "vitest";

import { createRepositorySearchUrl } from "../search-url";

describe("createRepositorySearchUrl", () => {
  it("preserves advanced filters in the URL", () => {
    expect(
      createRepositorySearchUrl(
        {
          q: "react testing",
          language: "TypeScript",
          topic: "frontend",
          minStars: 100,
          sort: "stars",
          order: "asc",
          page: 2,
        },
        3,
      ),
    ).toBe(
      "/?q=react+testing&language=TypeScript&topic=frontend&minStars=100&sort=stars&order=asc&page=3",
    );
  });
});
