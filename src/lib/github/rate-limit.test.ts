import { describe, expect, it } from "vitest";

import { parseGitHubRateLimitHeaders } from "./rate-limit";

describe("parseGitHubRateLimitHeaders", () => {
  it("parses GitHub rate limit headers", () => {
    const headers = new Headers({
      "x-ratelimit-limit": "60",
      "x-ratelimit-remaining": "42",
      "x-ratelimit-used": "18",
      "x-ratelimit-reset": "1710000000",
      "x-ratelimit-resource": "search",
      "retry-after": "30",
    });

    expect(parseGitHubRateLimitHeaders(headers)).toEqual({
      limit: 60,
      remaining: 42,
      used: 18,
      resetAt: "2024-03-09T16:00:00.000Z",
      resource: "search",
      retryAfterSeconds: 30,
    });
  });

  it("returns null when no rate limit headers exist", () => {
    expect(parseGitHubRateLimitHeaders(new Headers())).toBeNull();
  });
});

