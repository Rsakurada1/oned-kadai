import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { githubRepositoryResponse } from "@/test/fixtures/github-repository-response";
import { toRepositoryDetail } from "../../model/repository-mapper";
import { RepositoryDetail } from "../repository-detail";

describe("RepositoryDetail", () => {
  it("renders repository details and watcher count from subscribers", () => {
    render(
      <RepositoryDetail
        backHref="/?q=next&page=1"
        repository={toRepositoryDetail(githubRepositoryResponse)}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "vercel/next.js" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("vercel icon")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("2,300")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "検索結果へ戻る" }),
    ).toHaveAttribute("href", "/?q=next&page=1");
  });
});
