import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilterSummary } from "../filter-summary";

describe("FilterSummary", () => {
  it("renders active filters with remove links and reset", () => {
    render(
      <FilterSummary
        search={{
          q: "react",
          languages: ["TypeScript", "JavaScript"],
          frameworks: ["React"],
          clouds: ["AWS"],
          stars: 100,
          forks: 100,
          lowIssues: true,
          recentlyUpdated: true,
          readme: true,
          sort: "stars",
          order: "desc",
          page: 2,
        }}
      />,
    );

    expect(screen.getByLabelText("適用中の検索条件")).toBeInTheDocument();
    expect(screen.getByText("キーワード: react")).toBeInTheDocument();
    expect(screen.getByText("言語: TypeScript")).toBeInTheDocument();
    expect(screen.getByText("言語: JavaScript")).toBeInTheDocument();
    expect(screen.getByText("FW: React")).toBeInTheDocument();
    expect(screen.getByText("Cloud: AWS")).toBeInTheDocument();
    expect(screen.getByText("Star 100以上")).toBeInTheDocument();
    expect(screen.getByText("Fork 100以上")).toBeInTheDocument();
    expect(screen.getByText("Issueが少ない")).toBeInTheDocument();
    expect(screen.getByText("最近更新された")).toBeInTheDocument();
    expect(screen.getByText("READMEあり")).toBeInTheDocument();
    expect(screen.getByText("並び替え: stars")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "すべてリセット" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "言語: TypeScript を解除" }),
    ).toHaveAttribute(
      "href",
      "/?q=react&languages=JavaScript&frameworks=React&clouds=AWS&stars=100&forks=100&lowIssues=true&recentlyUpdated=true&readme=true&sort=stars&order=desc&page=1",
    );
  });

  it("renders nothing without active filters", () => {
    const { container } = render(
      <FilterSummary
        search={{
          q: "",
          languages: [],
          frameworks: [],
          clouds: [],
          stars: null,
          forks: null,
          lowIssues: false,
          recentlyUpdated: false,
          readme: false,
          sort: "best-match",
          order: "desc",
          page: 1,
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
