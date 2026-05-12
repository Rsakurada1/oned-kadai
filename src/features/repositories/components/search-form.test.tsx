import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchForm } from "./search-form";

describe("SearchForm", () => {
  it("renders an accessible native GET search form", () => {
    render(<SearchForm q="next" />);

    const form = screen.getByRole("search");
    const input = screen.getByRole("searchbox", { name: "検索キーワード" });

    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/");
    expect(input).toHaveValue("next");
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });
});

