import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { githubSearchResponse } from "@/test/fixtures/github-search-response";
import { toRepositoryListItem } from "../model/repository-mapper";
import { RepositoryList } from "./repository-list";

describe("RepositoryList", () => {
  it("renders repositories with detail links and result count", () => {
    const repositories = githubSearchResponse.items.map(toRepositoryListItem);

    render(
      <RepositoryList
        repositories={repositories}
        search={{
          q: "next",
          language: "TypeScript",
          topic: "frontend",
          minStars: 100,
          sort: "stars",
          order: "desc",
          page: 2,
        }}
        totalCount={42}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "検索結果" }),
    ).toBeInTheDocument();
    expect(screen.getByText("42 件")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "vercel/next.js" }),
    ).toHaveAttribute(
      "href",
      "/repositories/vercel/next.js?q=next&language=TypeScript&topic=frontend&minStars=100&sort=stars&order=desc&page=2",
    );
    expect(screen.getByText("facebook/react")).toBeInTheDocument();
  });
});
