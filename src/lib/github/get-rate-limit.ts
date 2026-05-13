import "server-only";

import { logWarn } from "@/lib/observability/logger";
import { githubFetch } from "./client";
import type { GitHubRateLimit } from "./rate-limit";

type GitHubRateLimitResource = {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
};

type GitHubRateLimitResponse = {
  resources: Record<string, GitHubRateLimitResource | undefined>;
  rate: GitHubRateLimitResource;
};

const GITHUB_RATE_LIMIT_CACHE_SECONDS = 60;

export async function getGitHubSearchRateLimit(): Promise<GitHubRateLimit | null> {
  try {
    const response = await githubFetch<GitHubRateLimitResponse>("/rate_limit", {
      revalidate: GITHUB_RATE_LIMIT_CACHE_SECONDS,
      staleWhileRevalidate: 300,
      tags: ["github:rate-limit"],
    });

    return toGitHubRateLimit(response.data.resources.search, "search");
  } catch (error) {
    logWarn("github_rate_limit_status_unavailable", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function toGitHubRateLimit(
  resource: GitHubRateLimitResource | undefined,
  resourceName: string,
): GitHubRateLimit | null {
  if (!resource) {
    return null;
  }

  return {
    limit: resource.limit,
    remaining: resource.remaining,
    resetAt: new Date(resource.reset * 1_000).toISOString(),
    resource: resourceName,
    retryAfterSeconds: null,
    used: resource.used,
  };
}

