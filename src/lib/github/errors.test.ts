import { describe, expect, it } from "vitest";

import { classifyGitHubError, GitHubApiError } from "./errors";

describe("classifyGitHubError", () => {
  it("classifies 422 as validation", () => {
    expect(classifyGitHubError(new GitHubApiError(422, "Validation Failed"))).toMatchObject({
      kind: "validation",
      status: 422,
    });
  });

  it.each([403, 429])("classifies %s as rate limit", (status) => {
    expect(classifyGitHubError(new GitHubApiError(status, "rate limit"))).toMatchObject({
      kind: "rate-limit",
      status,
    });
  });

  it("classifies 404 as not found", () => {
    expect(classifyGitHubError(new GitHubApiError(404, "Not Found"))).toMatchObject({
      kind: "not-found",
      status: 404,
    });
  });

  it("classifies unknown errors as unexpected", () => {
    expect(classifyGitHubError(new Error("boom")).kind).toBe("unexpected");
  });
});

