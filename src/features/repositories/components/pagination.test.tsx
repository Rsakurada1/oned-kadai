import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders previous and next links with q preserved", () => {
    render(
      <Pagination
        currentPage={2}
        search={{
          q: "react testing",
          language: "TypeScript",
          topic: "frontend",
          minStars: 100,
          sort: "stars",
          order: "desc",
          page: 2,
        }}
        totalPages={4}
      />,
    );

    expect(
      screen.getByRole("link", { name: "前のページ 1 へ" }),
    ).toHaveAttribute(
      "href",
      "/?q=react+testing&language=TypeScript&topic=frontend&minStars=100&sort=stars&order=desc&page=1",
    );
    expect(
      screen.getByRole("link", { name: "次のページ 3 へ" }),
    ).toHaveAttribute(
      "href",
      "/?q=react+testing&language=TypeScript&topic=frontend&minStars=100&sort=stars&order=desc&page=3",
    );
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        search={{
          q: "react",
          language: "",
          topic: "",
          minStars: null,
          sort: "best-match",
          order: "desc",
          page: 1,
        }}
        totalPages={1}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
