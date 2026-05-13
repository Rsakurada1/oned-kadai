import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";

const searchUrl =
  "/?q=next&language=TypeScript&topic=frontend&minStars=100&sort=stars&order=desc";

test("search results have no serious accessibility violations", async ({
  page,
}) => {
  await page.goto(searchUrl);
  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible({ timeout: 15_000 });

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include("main")
    .analyze();
  // CI では重大度の高い問題に絞り、軽微な指摘でデリバリーを止めすぎない。
  const seriousViolations = accessibilityScanResults.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );

  expect(seriousViolations).toEqual([]);
});

test("search results render a non-empty responsive viewport", async ({
  page,
}) => {
  // 代表的な mobile/tablet/desktop 幅で横スクロールと描画の空振りをまとめて検知する。
  for (const viewport of [
    { width: 360, height: 740 },
    { width: 768, height: 900 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(searchUrl);
    await expect(
      page.getByRole("heading", { name: "検索結果" }),
    ).toBeVisible({ timeout: 15_000 });

    const hasHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    const screenshot = await page.screenshot({ caret: "initial" });
    const image = PNG.sync.read(screenshot);
    expect(image.width).toBeGreaterThanOrEqual(viewport.width);
    expect(image.height).toBeGreaterThanOrEqual(viewport.height);
    expect(countSampledColors(image)).toBeGreaterThan(20);
  }
});

/**
 * スクリーンショットが真っ白や単色に近い状態になっていないかを軽量に検出する。
 */
function countSampledColors(image: PNG): number {
  const colors = new Set<string>();
  const step = Math.max(1, Math.floor((image.width * image.height) / 5_000));

  for (let index = 0; index < image.data.length; index += 4 * step) {
    colors.add(
      `${image.data[index]}-${image.data[index + 1]}-${image.data[index + 2]}`,
    );
  }

  return colors.size;
}
