import type { GitHubRateLimit } from "./rate-limit";

export type GitHubCacheStatus = "network" | "fresh" | "stale";

export type CachedGitHubResponse<T> = {
  data: T;
  rateLimit: GitHubRateLimit | null;
  cacheStatus: GitHubCacheStatus;
};

type CacheEntry = {
  data: unknown;
  rateLimit: GitHubRateLimit | null;
  freshUntil: number;
  staleUntil: number;
  storedAt: number;
};

const MAX_CACHE_ENTRIES = 200;
const responseCache = new Map<string, CacheEntry>();

export function createGitHubCacheKey(url: URL): string {
  return JSON.stringify({
    url: url.toString(),
    authenticated: Boolean(process.env.GITHUB_TOKEN),
  });
}

export function getCachedGitHubResponse<T>(
  cacheKey: string,
  cacheStatus: Exclude<GitHubCacheStatus, "network">,
): CachedGitHubResponse<T> | null {
  const entry = responseCache.get(cacheKey);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  const validUntil =
    cacheStatus === "fresh" ? entry.freshUntil : entry.staleUntil;

  if (now > validUntil) {
    if (now > entry.staleUntil) {
      responseCache.delete(cacheKey);
    }

    return null;
  }

  return {
    data: entry.data as T,
    rateLimit: entry.rateLimit,
    cacheStatus,
  };
}

export function setCachedGitHubResponse<T>(
  cacheKey: string,
  response: Pick<CachedGitHubResponse<T>, "data" | "rateLimit">,
  revalidateSeconds: number,
  staleWhileRevalidateSeconds: number,
) {
  evictOldestEntries();

  const now = Date.now();
  responseCache.set(cacheKey, {
    data: response.data,
    rateLimit: response.rateLimit,
    freshUntil: now + revalidateSeconds * 1_000,
    staleUntil: now + (revalidateSeconds + staleWhileRevalidateSeconds) * 1_000,
    storedAt: now,
  });
}

export function clearGitHubResponseCache() {
  responseCache.clear();
}

function evictOldestEntries() {
  if (responseCache.size < MAX_CACHE_ENTRIES) {
    return;
  }

  const oldest = [...responseCache.entries()].sort(
    ([, a], [, b]) => a.storedAt - b.storedAt,
  )[0];

  if (oldest) {
    responseCache.delete(oldest[0]);
  }
}

