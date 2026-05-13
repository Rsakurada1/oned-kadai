export type GitHubRateLimit = {
  limit: number | null;
  remaining: number | null;
  used: number | null;
  resetAt: string | null;
  resource: string | null;
  retryAfterSeconds: number | null;
};

/**
 * GitHub API の rate limit 関連ヘッダーを、画面表示とログで共通利用する形に正規化する。
 */
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

/**
 * 欠損や想定外の値は null に寄せ、呼び出し側で部分的な情報として扱えるようにする。
 */
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

/**
 * x-ratelimit-reset は Unix 秒なので、表示しやすい ISO 文字列へ変換する。
 */
function parseResetAt(value: string | null): string | null {
  const unixSeconds = parseIntegerHeader(value);
  if (unixSeconds === null) {
    return null;
  }

  return new Date(unixSeconds * 1_000).toISOString();
}
