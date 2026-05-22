export type GitHubOwner = {
  login: string;
  avatar_url: string;
};

export type GitHubLicense = {
  key: string;
  name: string;
  spdx_id: string | null;
  url: string | null;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  language: string | null;
  homepage?: string | null;
  topics?: string[];
  license?: GitHubLicense | null;
  default_branch?: string;
  created_at?: string | null;
  updated_at?: string | null;
  pushed_at?: string | null;
  size?: number;
  visibility?: string;
  archived?: boolean;
  clone_url?: string;
  stargazers_count: number;
  watchers_count: number;
  subscribers_count?: number;
  forks_count: number;
  open_issues_count: number;
};

export type GitHubRepositoryLanguages = Record<string, number>;

export type GitHubSearchRepositoriesResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
};
