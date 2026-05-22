import { describe, expect, it } from "vitest";

import {
  githubRepositoryResponse,
  githubRepositoryWithoutSubscribersResponse,
} from "@/test/fixtures/github-repository-response";
import {
  toRepositoryDetail,
  toRepositoryLanguages,
  toRepositoryListItem,
} from "../repository-mapper";

describe("toRepositoryListItem", () => {
  it("maps GitHub repository fields for list display", () => {
    expect(toRepositoryListItem(githubRepositoryResponse)).toMatchObject({
      id: 70107786,
      name: "next.js",
      fullName: "vercel/next.js",
      ownerLogin: "vercel",
      language: "JavaScript",
      stars: 128_000,
      forks: 27_000,
      openIssues: 2_100,
    });
  });
});

describe("toRepositoryDetail", () => {
  it("uses subscribers_count as watcher count", () => {
    expect(toRepositoryDetail(githubRepositoryResponse).watchers).toBe(2_300);
  });

  it("falls back to 0 when subscribers_count is missing", () => {
    expect(toRepositoryDetail(githubRepositoryWithoutSubscribersResponse).watchers).toBe(
      0,
    );
  });

  it("maps metadata for the detail page", () => {
    expect(toRepositoryDetail(githubRepositoryResponse)).toMatchObject({
      licenseName: "MIT License",
      topics: ["react", "nextjs", "javascript", "typescript"],
      homepageUrl: "https://nextjs.org",
      defaultBranch: "canary",
      pushedAt: "2026-05-20T10:00:00Z",
      sizeKb: 245_760,
      visibility: "public",
      isArchived: false,
      cloneUrl: "https://github.com/vercel/next.js.git",
    });
  });
});

describe("toRepositoryLanguages", () => {
  it("sorts languages by bytes and calculates percentages", () => {
    expect(
      toRepositoryLanguages({
        TypeScript: 300,
        JavaScript: 700,
        CSS: 0,
      }),
    ).toEqual([
      { name: "JavaScript", bytes: 700, percentage: 70 },
      { name: "TypeScript", bytes: 300, percentage: 30 },
    ]);
  });
});
