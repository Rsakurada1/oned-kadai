import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders previous and next links with q preserved", () => {
    render(<Pagination currentPage={2} q="react testing" totalPages={4} />);

    expect(
      screen.getByRole("link", { name: "前のページ 1 へ" }),
    ).toHaveAttribute("href", "/?q=react+testing&page=1");
    expect(
      screen.getByRole("link", { name: "次のページ 3 へ" }),
    ).toHaveAttribute("href", "/?q=react+testing&page=3");
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination currentPage={1} q="react" totalPages={1} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

