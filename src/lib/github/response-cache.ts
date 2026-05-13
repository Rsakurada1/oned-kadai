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

/**
 * URL と認証有無から cache key を作ります。
 * 生 URL を Redis key に出さないよう sha256 で短く固定化しています。
 */
export function createGitHubCacheKey(url: URL): string {
  const source = JSON.stringify({
    url: url.toString(),
    authenticated: Boolean(process.env.GITHUB_TOKEN),
  });

  return `github-response:${createHash("sha256").update(source).digest("hex")}`;
}

/**
 * fresh/stale のどちらを取り出すかを呼び出し側で指定できる cache 読み取り処理。
 */
export async function getCachedGitHubResponse<T>(
  cacheKey: string,
  cacheStatus: Exclude<GitHubCacheStatus, "network">,
): Promise<CachedGitHubResponse<T> | null> {
  // まずプロセス内 cache、なければ Redis shared cache を見に行く二段構えです。
  const entry =
    responseCache.get(cacheKey) ?? (await getSharedCacheEntry(cacheKey));
  if (!entry) {
    return null;
  }

  const now = Date.now();
  const validUntil =
    cacheStatus === "fresh" ? entry.freshUntil : entry.staleUntil;

  if (now > validUntil) {
    // stale 期限も過ぎた entry は、このプロセスからは即時削除する。
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

/**
 * network で取得したレスポンスを process cache と shared cache の両方へ保存する。
 */
export async function setCachedGitHubResponse<T>(
  cacheKey: string,
  response: Pick<CachedGitHubResponse<T>, "data" | "rateLimit">,
  revalidateSeconds: number,
  staleWhileRevalidateSeconds: number,
) {
  evictOldestEntries();

  // freshUntil は通常利用、staleUntil は GitHub API 失敗時の fallback 用です。
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

/**
 * Unit test で状態を持ち越さないための in-memory cache 初期化。
 */
export function clearGitHubResponseCache() {
  responseCache.clear();
}

/**
 * ローカル process cache が増え続けないよう、最も古い entry を 1 件だけ削除する。
 */
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
  // Redis が不調でもアプリ本体は落とさず、in-memory cache だけで継続する。
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
  // Redis 書き込み失敗は observability に残し、リクエスト処理は成功させる。
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

/**
 * Redis は任意機能として遅延初期化し、未設定時は null で in-memory cache のみに戻す。
 */
function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.SHARED_CACHE_REDIS_URL ?? process.env.REDIS_URL;
  if (!url) {
    redisClient = null;
    return redisClient;
  }

  // enableOfflineQueue=false で Redis 停止時に待ち続けないようにする。
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
