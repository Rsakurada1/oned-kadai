import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearGitHubResponseCache,
  createGitHubCacheKey,
  getCachedGitHubResponse,
  setCachedGitHubResponse,
} from "./response-cache";

describe("GitHub response cache", () => {
  afterEach(() => {
    vi.useRealTimers();
    clearGitHubResponseCache();
  });

  it("returns fresh cached responses before revalidation expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T00:00:00.000Z"));

    const key = createGitHubCacheKey(new URL("https://api.github.com/test"));
    setCachedGitHubResponse(
      key,
      { data: { ok: true }, rateLimit: null },
      60,
      300,
    );

    expect(getCachedGitHubResponse<{ ok: boolean }>(key, "fresh")).toEqual({
      data: { ok: true },
      rateLimit: null,
      cacheStatus: "fresh",
    });
  });

  it("returns stale cached responses during the stale window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T00:00:00.000Z"));

    const key = createGitHubCacheKey(new URL("https://api.github.com/test"));
    setCachedGitHubResponse(
      key,
      { data: { ok: true }, rateLimit: null },
      60,
      300,
    );

    vi.setSystemTime(new Date("2026-05-13T00:02:00.000Z"));

    expect(getCachedGitHubResponse<{ ok: boolean }>(key, "fresh")).toBeNull();
    expect(getCachedGitHubResponse<{ ok: boolean }>(key, "stale")).toEqual({
      data: { ok: true },
      rateLimit: null,
      cacheStatus: "stale",
    });
  });
});

