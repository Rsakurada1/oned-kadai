import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SortLinks } from "../sort-links";

describe("SortLinks", () => {
  it("renders GitHub Search API sort links", () => {
    render(
      <SortLinks
        search={{
          q: "next",
          languages: ["TypeScript"],
          frameworks: ["React"],
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

    expect(
      screen.getByRole("navigation", { name: "検索結果の並び替え" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "関連度順" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Star順" })).toHaveAttribute(
      "href",
      "/?q=next&languages=TypeScript&frameworks=React&sort=stars&order=desc&page=1",
    );
  });
});
