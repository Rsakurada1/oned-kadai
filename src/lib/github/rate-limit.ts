export type GitHubRateLimit = {
  limit: number | null;
  remaining: number | null;
  used: number | null;
  resetAt: string | null;
  resource: string | null;
  retryAfterSeconds: number | null;
};

export function parseGitHubRateLimitHeaders(
  headers: Headers,
): GitHubRateLimit | null {
  const limit = parseIntegerHeader(headers.get("x-ratelimit-limit"));
  const remaining = parseIntegerHeader(headers.get("x-ratelimit-remaining"));
  const used = parseIntegerHeader(headers.get("x-ratelimit-used"));
  const resetAt = parseResetAt(headers.get("x-ratelimit-reset"));
  const resource = headers.get("x-ratelimit-resource");
  const retryAfterSeconds = parseIntegerHeader(headers.get("retry-after"));

  if (
    limit === null &&
    remaining === null &&
    used === null &&
    resetAt === null &&
    resource === null &&
    retryAfterSeconds === null
  ) {
    return null;
  }

  return {
    limit,
    remaining,
    used,
    resetAt,
    resource,
    retryAfterSeconds,
  };
}

function parseIntegerHeader(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

function parseResetAt(value: string | null): string | null {
  const unixSeconds = parseIntegerHeader(value);
  if (unixSeconds === null) {
    return null;
  }

  return new Date(unixSeconds * 1_000).toISOString();
}

