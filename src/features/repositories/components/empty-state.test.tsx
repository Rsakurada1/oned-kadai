import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders an empty result message", () => {
    render(<EmptyState q="unknown-repo" />);

    expect(
      screen.getByRole("heading", { name: "検索結果はありません" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/unknown-repo/)).toBeInTheDocument();
  });
});

