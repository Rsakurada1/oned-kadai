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

async function githubFetchWithSpan<T>(
  path: string,
  options: GitHubFetchOptions,
  span: import("@opentelemetry/api").Span,
): Promise<GitHubResponse<T>> {
  const url = createGitHubUrl(path, options.searchParams);
  const cacheKey = createGitHubCacheKey(url);
  const cachedResponse = await getCachedGitHubResponse<T>(cacheKey, "fresh");

  if (cachedResponse) {
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

function shouldServeStaleResponse(status: number): boolean {
  return status === 403 || status === 429 || status >= 500;
}

function sanitizeUrlForTelemetry(url: URL): string {
  const sanitized = new URL(url);
  sanitized.searchParams.delete("access_token");
  return sanitized.toString();
}

function setSpanAttributes(
  span: import("@opentelemetry/api").Span,
  attributes: Record<string, null | number | string | undefined>,
) {
  const compactAttributes: Attributes = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (value != null) {
      compactAttributes[key] = value;
    }
  }

  span.setAttributes(compactAttributes);
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}
