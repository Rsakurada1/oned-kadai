import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchForm } from "../search-form";

describe("SearchForm", () => {
  it("renders an accessible native GET search form with checkbox filters", () => {
    const { container } = render(
      <SearchForm
        search={{
          q: "next",
          languages: ["TypeScript"],
          frameworks: ["React", "Next.js"],
          clouds: ["AWS"],
          stars: 100,
          forks: 100,
          lowIssues: true,
          recentlyUpdated: true,
          readme: true,
          sort: "stars",
          order: "desc",
          page: 1,
        }}
      />,
    );

    const form = screen.getByRole("search");
    const input = screen.getByRole("searchbox", { name: "キーワード検索" });

    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/");
    expect(input).toHaveValue("next");
    expect(input).toHaveAttribute("placeholder", "リポジトリを検索");
    expect(screen.getByText("言語フィルター")).toBeInTheDocument();
    expect(screen.getByLabelText("TypeScript")).toBeChecked();
    expect(screen.getByLabelText("JavaScript")).not.toBeChecked();
    expect(screen.getByLabelText("React")).toBeChecked();
    expect(screen.getByLabelText("Next.js")).toBeChecked();
    expect(screen.getByLabelText("AWS")).toBeChecked();
    expect(screen.getByLabelText("Star 条件を使う")).toBeChecked();
    expect(screen.getByLabelText("Star 下限")).toHaveValue(100);
    expect(screen.getByLabelText("Fork 条件を使う")).toBeChecked();
    expect(screen.getByLabelText("Fork 下限")).toHaveValue(100);
    expect(screen.getByLabelText(/Issueが少ない/)).toBeChecked();
    expect(screen.getByLabelText(/最近更新された/)).toBeChecked();
    expect(screen.getByLabelText(/READMEあり/)).toBeChecked();
    expect(container.querySelector('input[name="sort"]')).toHaveValue("stars");
    expect(container.querySelector('input[name="order"]')).toHaveValue("desc");
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });

  it("omits hidden sort inputs for relevance sort", () => {
    const { container } = render(
      <SearchForm
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
    const form = within(container);

    expect(container.querySelector('input[name="sort"]')).not.toBeInTheDocument();
    expect(container.querySelector('input[name="order"]')).not.toBeInTheDocument();
    expect(form.getByLabelText("Star 条件を使う")).not.toBeChecked();
    expect(form.getByLabelText("Star 下限")).toBeDisabled();
    expect(form.getByLabelText("Fork 条件を使う")).not.toBeChecked();
    expect(form.getByLabelText("Fork 下限")).toBeDisabled();
  });
});
