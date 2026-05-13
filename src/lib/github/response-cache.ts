import type { GitHubRateLimit } from "./rate-limit";
import { logWarn } from "@/lib/observability/logger";
import Redis from "ioredis";
import { createHash } from "node:crypto";

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
let redisClient: Redis | null | undefined;

export function createGitHubCacheKey(url: URL): string {
  const source = JSON.stringify({
    url: url.toString(),
    authenticated: Boolean(process.env.GITHUB_TOKEN),
  });

  return `github-response:${createHash("sha256").update(source).digest("hex")}`;
}

export async function getCachedGitHubResponse<T>(
  cacheKey: string,
  cacheStatus: Exclude<GitHubCacheStatus, "network">,
): Promise<CachedGitHubResponse<T> | null> {
  const entry =
    responseCache.get(cacheKey) ?? (await getSharedCacheEntry(cacheKey));
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

export async function setCachedGitHubResponse<T>(
  cacheKey: string,
  response: Pick<CachedGitHubResponse<T>, "data" | "rateLimit">,
  revalidateSeconds: number,
  staleWhileRevalidateSeconds: number,
) {
  evictOldestEntries();

  const now = Date.now();
  const entry = {
    data: response.data,
    rateLimit: response.rateLimit,
    freshUntil: now + revalidateSeconds * 1_000,
    staleUntil: now + (revalidateSeconds + staleWhileRevalidateSeconds) * 1_000,
    storedAt: now,
  };

  responseCache.set(cacheKey, entry);
  await setSharedCacheEntry(
    cacheKey,
    entry,
    revalidateSeconds + staleWhileRevalidateSeconds,
  );
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

async function getSharedCacheEntry(
  cacheKey: string,
): Promise<CacheEntry | null> {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  try {
    const value = await redis.get(cacheKey);
    if (!value) {
      return null;
    }

    const entry = JSON.parse(value) as CacheEntry;
    responseCache.set(cacheKey, entry);
    return entry;
  } catch (error) {
    logWarn("shared_cache_read_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function setSharedCacheEntry(
  cacheKey: string,
  entry: CacheEntry,
  ttlSeconds: number,
) {
  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.set(cacheKey, JSON.stringify(entry), "EX", ttlSeconds);
  } catch (error) {
    logWarn("shared_cache_write_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.SHARED_CACHE_REDIS_URL ?? process.env.REDIS_URL;
  if (!url) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis(url, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });
  redisClient.on("error", (error) => {
    logWarn("shared_cache_connection_error", {
      message: error.message,
    });
  });

  return redisClient;
}
