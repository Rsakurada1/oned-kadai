import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchForm } from "../search-form";

describe("SearchForm", () => {
  it("renders an accessible native GET search form", () => {
    render(
      <SearchForm
        language="TypeScript"
        minStars={100}
        order="asc"
        q="next"
        sort="stars"
        topic="frontend"
      />,
    );

    const form = screen.getByRole("search");
    const input = screen.getByRole("combobox", { name: "検索キーワード" });

    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/");
    expect(input).toHaveValue("next");
    expect(screen.getByText("詳細フィルター")).toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("TypeScript");
    expect(input).toHaveAttribute("list", "repository-search-suggestions");
    expect(screen.getByLabelText("Language")).toHaveAttribute(
      "list",
      "repository-language-suggestions",
    );
    expect(screen.getByLabelText("Topic")).toHaveValue("frontend");
    expect(screen.getByLabelText("Star 下限")).toHaveValue(100);
    expect(screen.getByLabelText("並び替え")).toHaveValue("stars");
    expect(screen.getByLabelText("順序")).toHaveValue("asc");
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });
});
