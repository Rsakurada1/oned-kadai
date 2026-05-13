import { describe, expect, it } from "vitest";

import {
  githubRepositoryResponse,
  githubRepositoryWithoutSubscribersResponse,
} from "@/test/fixtures/github-repository-response";
import { toRepositoryDetail, toRepositoryListItem } from "../repository-mapper";

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
});
