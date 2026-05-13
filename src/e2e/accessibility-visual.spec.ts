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
  const seriousViolations = accessibilityScanResults.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );

  expect(seriousViolations).toEqual([]);
});

test("search results render a non-empty responsive viewport", async ({
  page,
}) => {
  await page.goto(searchUrl);
  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible({ timeout: 15_000 });

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const screenshot = await page.screenshot();
  const image = PNG.sync.read(screenshot);
  expect(image.width).toBeGreaterThan(300);
  expect(image.height).toBeGreaterThan(300);
  expect(countSampledColors(image)).toBeGreaterThan(20);
});

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
