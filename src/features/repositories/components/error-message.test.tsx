import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ClassifiedGitHubError } from "@/lib/github/errors";
import { ErrorMessage } from "./error-message";

describe("ErrorMessage", () => {
  it("renders an alert with retry guidance", () => {
    const error: ClassifiedGitHubError = {
      kind: "rate-limit",
      title: "GitHub API の制限に達しました",
      message: "少し時間を置いてから再試行してください。",
      status: 403,
    };

    render(<ErrorMessage error={error} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "GitHub API の制限に達しました" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/再試行/)).toBeInTheDocument();
  });
});

