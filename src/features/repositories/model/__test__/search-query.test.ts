import { describe, expect, it } from "vitest";

import { buildRepositorySearchQuery } from "../search-query";

describe("buildRepositorySearchQuery", () => {
  it("adds a language qualifier", () => {
    expect(
      buildRepositorySearchQuery({
        q: "react",
        language: "TypeScript",
        topic: "",
        minStars: null,
      }),
    ).toBe("react language:TypeScript");
  });

  it("quotes language values that contain spaces", () => {
    expect(
      buildRepositorySearchQuery({
        q: "notebook",
        language: "Jupyter Notebook",
        topic: "",
        minStars: null,
      }),
    ).toBe('notebook language:"Jupyter Notebook"');
  });

  it("adds topic and minimum stars qualifiers", () => {
    expect(
      buildRepositorySearchQuery({
        q: "react",
        language: "TypeScript",
        topic: "frontend",
        minStars: 100,
      }),
    ).toBe("react language:TypeScript topic:frontend stars:>=100");
  });

  it("omits the language qualifier when language is empty", () => {
    expect(
      buildRepositorySearchQuery({
        q: " next ",
        language: " ",
        topic: "",
        minStars: null,
      }),
    ).toBe("next");
  });
});
