import type { GitHubSearchRepositoriesResponse } from "@/lib/github/types";
import { githubRepositoryResponse } from "./github-repository-response";

export const githubSearchResponse: GitHubSearchRepositoriesResponse = {
  total_count: 42,
  incomplete_results: false,
  items: [
    githubRepositoryResponse,
    {
      ...githubRepositoryResponse,
      id: 10270250,
      name: "react",
      full_name: "facebook/react",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
      html_url: "https://github.com/facebook/react",
      description: "The library for web and native user interfaces.",
      language: "JavaScript",
      stargazers_count: 230_000,
      watchers_count: 230_000,
      subscribers_count: 6_400,
      forks_count: 47_000,
      open_issues_count: 900,
    },
  ],
};

