import { expect, test } from "@playwright/test";

test("shows starter searches before any search has run", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "条件を選んで検索してください" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "検索結果の並び替え" }),
  ).toBeHidden();
  await expect(page.getByRole("link", { name: "Next.js" })).toHaveAttribute(
    "href",
    "/?q=next&languages=TypeScript&page=1",
  );
});

test("searches repositories and navigates to detail page", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: "キーワード検索" }).fill("next");
  await page.getByLabel("TypeScript").check();
  await page.getByLabel("React").check();
  await page.getByLabel("Star 条件を使う").check();
  await page.getByLabel("Star 下限").fill("100");
  await page.getByRole("button", { name: "検索" }).click();
  await expect(page).toHaveURL(/q=next/);
  await page.getByRole("link", { name: "Star順" }).click();

  await expect(page).toHaveURL(/q=next/);
  await expect(page).toHaveURL(/languages=TypeScript/);
  await expect(page).toHaveURL(/frameworks=React/);
  await expect(page).toHaveURL(/stars=100/);
  await expect(page).toHaveURL(/sort=stars/);
  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "GitHub API 残量" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("42 / 60 回")).toBeVisible();

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
  await expect(
    page.getByRole("heading", { name: "言語構成" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "リポジトリ情報" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("link", { name: "GitHubで開く" }),
  ).toHaveAttribute("href", "https://github.com/vercel/next.js");
  await expect(
    page.getByText("git clone https://github.com/vercel/next.js.git"),
  ).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "SSH" }).click();
  await expect(
    page.getByText("git clone git@github.com:vercel/next.js.git"),
  ).toBeVisible();

  await page.getByRole("link", { name: "検索結果へ戻る" }).click();

  await expect(page).toHaveURL(/q=next/);
  await expect(page).toHaveURL(/languages=TypeScript/);
  await expect(page).toHaveURL(/frameworks=React/);
  await expect(page).toHaveURL(/stars=100/);
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

  await expect(
    page.getByRole("alert", { name: "GitHub API の制限に達しました" }),
  ).toBeVisible();
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

  await page.getByRole("searchbox", { name: "キーワード検索" }).focus();
  await page.keyboard.type("next");
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: "検索結果" }),
  ).toBeVisible({ timeout: 15_000 });

  const repositoryLink = page.getByRole("link", { name: "vercel/next.js" });
  await repositoryLink.focus();
  await expect(repositoryLink).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/repositories\/vercel\/next\.js/, {
    timeout: 15_000,
  });
});
