import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchForm } from "../search-form";

describe("SearchForm", () => {
  it("renders an accessible native GET search form", () => {
    const { container } = render(
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
    const input = screen.getByRole("searchbox", { name: "検索キーワード" });

    expect(form).toHaveAttribute("method", "get");
    expect(form).toHaveAttribute("action", "/");
    expect(input).toHaveValue("next");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).not.toHaveAttribute("list");
    expect(
      container.querySelector("#repository-search-suggestions"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("詳細フィルター")).toBeInTheDocument();
    expect(screen.getByLabelText("Language 候補")).toHaveValue("TypeScript");
    expect(screen.getByLabelText("Language 自由入力")).toHaveValue("");
    expect(
      container.querySelector('input[name="language"][type="hidden"]'),
    ).toHaveValue("TypeScript");
    expect(screen.getByLabelText("Topic 候補")).toHaveValue("frontend");
    expect(screen.getByLabelText("Topic 自由入力")).toHaveValue("");
    expect(
      container.querySelector('input[name="topic"][type="hidden"]'),
    ).toHaveValue("frontend");
    expect(
      container.querySelector("#repository-language-suggestions"),
    ).toBeNull();
    expect(container.querySelector("#repository-topic-suggestions")).toBeNull();
    expect(screen.getByLabelText("Star 下限")).toHaveValue(100);
    expect(screen.getByLabelText("並び替え")).toHaveValue("stars");
    expect(screen.getByLabelText("順序")).toHaveValue("asc");
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });

  it("keeps free input values for language and topic filters", () => {
    const { container } = render(
      <SearchForm language="Elixir" q="next" topic="web3" />,
    );
    const form = within(container);

    const languagePreset = form.getByLabelText("Language 候補");
    const languageCustom = form.getByLabelText("Language 自由入力");
    const languageValue = container.querySelector(
      'input[name="language"][type="hidden"]',
    );

    expect(languagePreset).toHaveValue("");
    expect(languageCustom).toHaveValue("Elixir");
    expect(languageValue).toHaveValue("Elixir");
    expect(form.getByLabelText("Topic 候補")).toHaveValue("");
    expect(form.getByLabelText("Topic 自由入力")).toHaveValue("web3");

    fireEvent.change(languagePreset, { target: { value: "Go" } });
    expect(languageCustom).toHaveValue("");
    expect(languageValue).toHaveValue("Go");

    fireEvent.change(languageCustom, { target: { value: "Elixir" } });
    expect(languageValue).toHaveValue("Elixir");
  });
});
