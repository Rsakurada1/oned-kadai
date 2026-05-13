import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RateLimitStatus } from "../rate-limit-status";

describe("RateLimitStatus", () => {
  it("renders GitHub API rate limit metadata", () => {
    render(
      <RateLimitStatus
        rateLimit={{
          limit: 60,
          remaining: 42,
          used: 18,
          resetAt: "2024-03-09T16:00:00.000Z",
          resource: "search",
          retryAfterSeconds: null,
        }}
      />,
    );

    expect(
      screen.getByLabelText("GitHub API rate limit"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "GitHub API 残量" }),
    ).toBeInTheDocument();
    expect(screen.getByText("42 / 60 回")).toBeInTheDocument();
    expect(screen.getByText("search")).toBeInTheDocument();
  });

  it("renders nothing without rate limit metadata", () => {
    const { container } = render(<RateLimitStatus rateLimit={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
