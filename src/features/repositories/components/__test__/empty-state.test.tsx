import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("renders an empty result message", () => {
    render(
      <EmptyState
        search={{
          q: "unknown-repo",
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
      screen.getByRole("heading", { name: "検索結果はありません" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/unknown-repo/)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/)).toBeInTheDocument();
  });
});
