import "server-only";

import { logError, logInfo, logWarn } from "@/lib/observability/logger";
import {
  recordGitHubCacheEvent,
  recordGitHubRequest,
  withSpan,
} from "@/lib/observability/telemetry";
import type { Attributes } from "@opentelemetry/api";
import { createGitHubHeaders } from "./headers";
import { GitHubApiError } from "./errors";
import {
  parseGitHubRateLimitHeaders,
  type GitHubRateLimit,
} from "./rate-limit";
import {
  createGitHubCacheKey,
  getCachedGitHubResponse,
  setCachedGitHubResponse,
  type GitHubCacheStatus,
} from "./response-cache";

type GitHubFetchOptions = {
  revalidate: number;
  staleWhileRevalidate?: number;
  tags?: string[];
  searchParams?: Record<string, number | string | undefined>;
};

export type GitHubResponse<T> = {
  data: T;
  rateLimit: GitHubRateLimit | null;
  cacheStatus: GitHubCacheStatus;
};

const DEFAULT_GITHUB_API_BASE_URL = "https://api.github.com";

/**
 * GitHub API 呼び出しの入口です。
 * URL 生成、cache、rate limit header、OpenTelemetry、structured log をここへ集約します。
 */
export async function githubFetch<T>(
  path: string,
  options: GitHubFetchOptions,
): Promise<GitHubResponse<T>> {
  return withSpan(
    "github.fetch",
    {
      "github.path": path,
      "github.cache.revalidate_seconds": options.revalidate,
    },
    (span) => githubFetchWithSpan<T>(path, options, span),
  );
}

/**
 * cache 確認、network fetch、fallback 判定を 1 つの span の中で実行する本体処理。
 */
async function githubFetchWithSpan<T>(
  path: string,
  options: GitHubFetchOptions,
  span: import("@opentelemetry/api").Span,
): Promise<GitHubResponse<T>> {
  const url = createGitHubUrl(path, options.searchParams);
  const cacheKey = createGitHubCacheKey(url);
  const cachedResponse = await getCachedGitHubResponse<T>(cacheKey, "fresh");

  if (cachedResponse) {
    // fresh cache は GitHub API を叩かず返す。trace/metrics には cache hit として残す。
    span.setAttributes({
      "github.cache.status": cachedResponse.cacheStatus,
      "github.request.url": sanitizeUrlForTelemetry(url),
    });
    recordGitHubCacheEvent({
      "github.path": path,
      "github.cache.status": cachedResponse.cacheStatus,
    });
    logInfo("github_api_cache_hit", {
      path,
      cacheStatus: cachedResponse.cacheStatus,
      rateLimit: cachedResponse.rateLimit ?? undefined,
    });

    return cachedResponse;
  }

  const startedAt = performance.now();

  const response = await fetch(url, {
    cache: "force-cache",
    headers: createGitHubHeaders(),
    next: {
      revalidate: options.revalidate,
      tags: options.tags,
    },
  });
  const durationMs = Math.round(performance.now() - startedAt);
  const rateLimit = parseGitHubRateLimitHeaders(response.headers);
  setSpanAttributes(span, {
    "github.request.url": sanitizeUrlForTelemetry(url),
    "github.response.status": response.status,
    "github.request.duration_ms": durationMs,
    "github.rate_limit.remaining": rateLimit?.remaining,
    "github.rate_limit.resource": rateLimit?.resource,
    "github.request_id": response.headers.get("x-github-request-id"),
  });
  recordGitHubRequest(
    {
      "github.path": path,
      "github.response.status": response.status,
      "github.cache.status": "network",
    },
    durationMs,
  );
  const logFields = {
    path,
    status: response.status,
    durationMs,
    rateLimit: rateLimit ?? undefined,
    githubRequestId: response.headers.get("x-github-request-id"),
  };

  if (!response.ok) {
    const staleResponse = await getCachedGitHubResponse<T>(cacheKey, "stale");

    if (staleResponse && shouldServeStaleResponse(response.status)) {
      // rate limit や GitHub 側障害では、期限内の stale cache を優先して UX を守る。
      span.setAttribute("github.cache.status", staleResponse.cacheStatus);
      recordGitHubCacheEvent({
        "github.path": path,
        "github.cache.status": staleResponse.cacheStatus,
      });
      logWarn("github_api_stale_cache_served", {
        ...logFields,
        cacheStatus: staleResponse.cacheStatus,
      });

      return staleResponse;
    }

    logError("github_api_request_failed", logFields);
    throw new GitHubApiError(
      response.status,
      await readErrorMessage(response),
      rateLimit,
    );
  }

  logInfo("github_api_request_succeeded", logFields);

  const parsedResponse: GitHubResponse<T> = {
    data: (await response.json()) as T,
    rateLimit,
    cacheStatus: "network",
  };

  await setCachedGitHubResponse(
    cacheKey,
    parsedResponse,
    options.revalidate,
    options.staleWhileRevalidate ?? options.revalidate * 5,
  );

  return parsedResponse;
}

/**
 * 環境変数で差し替え可能な GitHub API base URL と path/query から完全な URL を作る。
 */
function createGitHubUrl(
  path: string,
  searchParams?: GitHubFetchOptions["searchParams"],
): URL {
  const baseUrl = process.env.GITHUB_API_BASE_URL ?? DEFAULT_GITHUB_API_BASE_URL;
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(normalizedPath, `${baseUrl.replace(/\/$/, "")}/`);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

/** 一時的な API 失敗だけ stale fallback を許可し、validation/404 は正しく失敗させます。 */
function shouldServeStaleResponse(status: number): boolean {
  return status === 403 || status === 429 || status >= 500;
}

/** token などが URL に混ざっても telemetry に出さないための保険です。 */
function sanitizeUrlForTelemetry(url: URL): string {
  const sanitized = new URL(url);
  sanitized.searchParams.delete("access_token");
  return sanitized.toString();
}

/**
 * undefined/null を除いた属性だけを span に渡し、OTel 側の型制約を吸収する。
 */
function setSpanAttributes(
  span: import("@opentelemetry/api").Span,
  attributes: Record<string, null | number | string | undefined>,
) {
  // OpenTelemetry Attributes は null を受け付けないため、ここでまとめて除去する。
  const compactAttributes: Attributes = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (value != null) {
      compactAttributes[key] = value;
    }
  }

  span.setAttributes(compactAttributes);
}

/**
 * API エラー本文からユーザー向け分類に使う message を取り出す。
 */
async function readErrorMessage(response: Response): Promise<string> {
  // GitHub の error body は JSON が多いが、proxy 等で非 JSON になる可能性もある。
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}
