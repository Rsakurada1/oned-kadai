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
        repository={toRepositoryDetail(githubRepositoryResponse, {
          JavaScript: 5_600_000,
          TypeScript: 3_100_000,
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "vercel/next.js" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("vercel icon")).toBeInTheDocument();
    expect(screen.getByText("主な言語")).toBeInTheDocument();
    expect(screen.getByText("2,300")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "言語構成" })).toBeInTheDocument();
    expect(screen.getByText("64.4%")).toBeInTheDocument();
    expect(screen.getByText("MIT License")).toBeInTheDocument();
    expect(screen.getByText("canary")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByText("https://github.com/vercel/next.js.git")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "検索結果へ戻る" }),
    ).toHaveAttribute("href", "/?q=next&page=1");
    expect(
      screen.getByRole("link", { name: "公式サイトを開く" }),
    ).toHaveAttribute("href", "https://nextjs.org");
  });
});
