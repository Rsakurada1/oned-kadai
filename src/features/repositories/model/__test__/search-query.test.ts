import { describe, expect, it } from "vitest";

import { buildRepositorySearchQuery } from "../search-query";

describe("buildRepositorySearchQuery", () => {
  it("adds a language qualifier", () => {
    expect(
      buildRepositorySearchQuery({
        q: "react",
        languages: ["TypeScript"],
        frameworks: [],
        clouds: [],
        stars: null,
        forks: null,
        lowIssues: false,
        recentlyUpdated: false,
      }),
    ).toBe("react language:TypeScript");
  });

  it("builds OR search for multiple languages", () => {
    expect(
      buildRepositorySearchQuery({
        q: "react",
        languages: ["TypeScript", "JavaScript"],
        frameworks: [],
        clouds: [],
        stars: null,
        forks: null,
        lowIssues: false,
        recentlyUpdated: false,
      }),
    ).toBe("react (language:TypeScript OR language:JavaScript)");
  });

  it("adds framework, cloud, stars, forks, and recent qualifiers", () => {
    expect(
      buildRepositorySearchQuery({
        q: "next",
        languages: ["TypeScript"],
        frameworks: ["React", "Next.js"],
        clouds: ["AWS"],
        stars: 100,
        forks: 100,
        lowIssues: false,
        recentlyUpdated: true,
        referenceDate: new Date(2026, 4, 20),
      }),
    ).toBe(
      "next language:TypeScript (react OR topic:react OR nextjs OR topic:nextjs) (aws OR topic:aws) stars:>=100 forks:>=100 pushed:>2026-04-20",
    );
  });

  it("adds a safe qualifier when low issue count is the only API-backed condition", () => {
    expect(
      buildRepositorySearchQuery({
        q: " ",
        languages: [],
        frameworks: [],
        clouds: [],
        stars: null,
        forks: null,
        lowIssues: true,
        recentlyUpdated: false,
      }),
    ).toBe("stars:>=0");
  });

  it("omits filters when they are empty", () => {
    expect(
      buildRepositorySearchQuery({
        q: " next ",
        languages: [],
        frameworks: [],
        clouds: [],
        stars: null,
        forks: null,
        lowIssues: false,
        recentlyUpdated: false,
      }),
    ).toBe("next");
  });
});
