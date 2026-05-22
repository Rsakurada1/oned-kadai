import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CloneCommandPanel } from "../clone-command-panel";

describe("CloneCommandPanel", () => {
  it("copies the clone URL and selected clone command", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <CloneCommandPanel
        httpsUrl="https://github.com/vercel/next.js.git"
        sshUrl="git@github.com:vercel/next.js.git"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "URLをコピー" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "https://github.com/vercel/next.js.git",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "SSH" }));
    expect(
      screen.getByText("git clone git@github.com:vercel/next.js.git"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "コマンドをコピー" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith(
        "git clone git@github.com:vercel/next.js.git",
      ),
    );
  });
});
