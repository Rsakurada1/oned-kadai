import type { GitHubRepository } from "@/lib/github/types";

export const githubRepositoryResponse: GitHubRepository = {
  id: 70107786,
  name: "next.js",
  full_name: "vercel/next.js",
  owner: {
    login: "vercel",
    avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4",
  },
  html_url: "https://github.com/vercel/next.js",
  description: "The React Framework",
  language: "JavaScript",
  homepage: "https://nextjs.org",
  topics: ["react", "nextjs", "javascript", "typescript"],
  license: {
    key: "mit",
    name: "MIT License",
    spdx_id: "MIT",
    url: "https://api.github.com/licenses/mit",
  },
  default_branch: "canary",
  created_at: "2016-10-05T23:32:51Z",
  updated_at: "2026-05-01T10:00:00Z",
  pushed_at: "2026-05-20T10:00:00Z",
  size: 245_760,
  visibility: "public",
  archived: false,
  clone_url: "https://github.com/vercel/next.js.git",
  ssh_url: "git@github.com:vercel/next.js.git",
  stargazers_count: 128_000,
  watchers_count: 128_000,
  subscribers_count: 2_300,
  forks_count: 27_000,
  open_issues_count: 2_100,
};

export const githubRepositoryWithoutSubscribersResponse: GitHubRepository = {
  ...githubRepositoryResponse,
  id: 2,
  name: "without-subscribers",
  full_name: "vercel/without-subscribers",
  subscribers_count: undefined,
};
