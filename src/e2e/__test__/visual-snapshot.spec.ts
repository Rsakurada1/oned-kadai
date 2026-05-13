import { expect, test } from "@playwright/test";

const searchUrl =
  "/?q=next&language=TypeScript&topic=frontend&minStars=100&sort=stars&order=desc";

test.describe("visual regression snapshots", () => {
  // スナップショット更新のノイズを避けるため、明示的に有効化したときだけ実行する。
  test.skip(
    process.env.VISUAL_SNAPSHOT !== "1",
    "Set VISUAL_SNAPSHOT=1 to run screenshot snapshot assertions.",
  );

  test("search panel and filter chips stay visually stable", async ({ page }) => {
    await page.goto(searchUrl);
    await expect(
      page.getByRole("heading", { name: "検索結果" }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.locator(".search-panel")).toHaveScreenshot(
      "search-panel.png",
      {
        animations: "disabled",
        maxDiffPixelRatio: 0.03,
      },
    );
    await expect(page.locator(".filter-summary")).toHaveScreenshot(
      "filter-summary.png",
      {
        animations: "disabled",
        maxDiffPixelRatio: 0.03,
      },
    );
  });

  test("repository card stays visually stable", async ({ page }) => {
    await page.goto(searchUrl);
    await expect(
      page.getByRole("heading", { name: "検索結果" }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.locator(".repository-card").first()).toHaveScreenshot(
      "repository-card.png",
      {
        animations: "disabled",
        maxDiffPixelRatio: 0.03,
      },
    );
  });
});
