import { expect, test } from "@playwright/test";

test("searches repositories and navigates to detail page", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("combobox", { name: "検索キーワード" }).fill("next");
  await page.getByLabel("Language").fill("TypeScript");
  await page.getByLabel("Topic").fill("frontend");
  await page.getByLabel("Star 下限").fill("100");
  await page.getByLabel("並び替え").selectOption("stars");
  await page.getByRole("button", { name: "検索" }).click();

  await expect(page).toHaveURL(/q=next/);
  await expect(page).toHaveURL(/language=TypeScript/);
  await expect(page).toHaveURL(/topic=frontend/);
  await expect(page).toHaveURL(/minStars=100/);
  await expect(page).toHaveURL(/sort=stars/);
  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "GitHub API 残量" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("41 / 60 回")).toBeVisible();

  const repositoryLink = page.getByRole("link", { name: "vercel/next.js" });
  await repositoryLink.scrollIntoViewIfNeeded();
  await repositoryLink.click();

  await expect(page).toHaveURL(/\/repositories\/vercel\/next\.js/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { name: "vercel/next.js" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByAltText("vercel icon")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("2,300")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: "検索結果へ戻る" }).click();

  await expect(page).toHaveURL(/q=next/);
  await expect(page).toHaveURL(/language=TypeScript/);
  await expect(page).toHaveURL(/topic=frontend/);
  await expect(page).toHaveURL(/minStars=100/);
  await expect(page).toHaveURL(/sort=stars/);
  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible();
});

test("shows an empty state when the search has no results", async ({ page }) => {
  await page.goto("/?q=empty");

  await expect(
    page.getByRole("heading", { name: "検索結果はありません" }),
  ).toBeVisible();
});

test("shows rate limit guidance in the page", async ({ page }) => {
  await page.goto("/?q=ratelimit");

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "GitHub API の制限に達しました" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "GitHub API 残量" }),
  ).toBeVisible();
});

test("supports keyboard search and repository activation", async (
  { page },
  testInfo,
) => {
  test.skip(
    testInfo.project.name === "mobile-chrome",
    "Hardware keyboard activation is covered by the desktop project.",
  );

  await page.goto("/");

  await page.getByRole("combobox", { name: "検索キーワード" }).focus();
  await page.keyboard.type("next");
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible({ timeout: 15_000 });

  const repositoryLink = page.getByRole("link", { name: "vercel/next.js" });
  await repositoryLink.press("Enter");

  await expect(page).toHaveURL(/\/repositories\/vercel\/next\.js/, {
    timeout: 15_000,
  });
});
