import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilterSummary } from "../filter-summary";

describe("FilterSummary", () => {
  it("renders active filters with remove links and reset", () => {
    render(
      <FilterSummary
        search={{
          q: "react",
          language: "TypeScript",
          topic: "frontend",
          minStars: 100,
          sort: "stars",
          order: "desc",
          page: 2,
        }}
      />,
    );

    expect(screen.getByLabelText("適用中の検索条件")).toBeInTheDocument();
    expect(screen.getByText("Keyword: react")).toBeInTheDocument();
    expect(screen.getByText("Language: TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Topic: frontend")).toBeInTheDocument();
    expect(screen.getByText("Stars: 100+")).toBeInTheDocument();
    expect(screen.getByText("Sort: stars / desc")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "すべてリセット" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Language: TypeScript を解除" }),
    ).toHaveAttribute(
      "href",
      "/?q=react&topic=frontend&minStars=100&sort=stars&order=desc&page=1",
    );
  });

  it("renders nothing without active filters", () => {
    const { container } = render(
      <FilterSummary
        search={{
          q: "",
          language: "",
          topic: "",
          minStars: null,
          sort: "best-match",
          order: "desc",
          page: 1,
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
