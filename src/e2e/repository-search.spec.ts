import { expect, test } from "@playwright/test";

test("searches repositories and navigates to detail page", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: "検索キーワード" }).fill("next");
  await page.getByRole("button", { name: "検索" }).click();

  await expect(page).toHaveURL(/q=next/);
  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "vercel/next.js" }).click();

  await expect(page).toHaveURL(/\/repositories\/vercel\/next\.js/);
  await expect(
    page.getByRole("heading", { name: "vercel/next.js" }),
  ).toBeVisible();
  await expect(page.getByAltText("vercel icon")).toBeVisible();
  await expect(page.getByText("2,300")).toBeVisible();

  await page.getByRole("link", { name: "検索結果へ戻る" }).click();

  await expect(page).toHaveURL(/q=next/);
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
});

