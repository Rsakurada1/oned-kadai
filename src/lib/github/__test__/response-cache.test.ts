import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearGitHubResponseCache,
  createGitHubCacheKey,
  getCachedGitHubResponse,
  setCachedGitHubResponse,
} from "../response-cache";

describe("GitHub response cache", () => {
  afterEach(() => {
    vi.useRealTimers();
    clearGitHubResponseCache();
  });

  it("returns fresh cached responses before revalidation expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T00:00:00.000Z"));

    const key = createGitHubCacheKey(new URL("https://api.github.com/test"));
    await setCachedGitHubResponse(
      key,
      { data: { ok: true }, rateLimit: null },
      60,
      300,
    );

    await expect(
      getCachedGitHubResponse<{ ok: boolean }>(key, "fresh"),
    ).resolves.toEqual({
      data: { ok: true },
      rateLimit: null,
      cacheStatus: "fresh",
    });
  });

  it("returns stale cached responses during the stale window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T00:00:00.000Z"));

    const key = createGitHubCacheKey(new URL("https://api.github.com/test"));
    await setCachedGitHubResponse(
      key,
      { data: { ok: true }, rateLimit: null },
      60,
      300,
    );

    vi.setSystemTime(new Date("2026-05-13T00:02:00.000Z"));

    await expect(
      getCachedGitHubResponse<{ ok: boolean }>(key, "fresh"),
    ).resolves.toBeNull();
    await expect(
      getCachedGitHubResponse<{ ok: boolean }>(key, "stale"),
    ).resolves.toEqual({
      data: { ok: true },
      rateLimit: null,
      cacheStatus: "stale",
    });
  });
});
