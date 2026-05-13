export type GitHubOwner = {
  login: string;
  avatar_url: string;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at?: string | null;
  stargazers_count: number;
  watchers_count: number;
  subscribers_count?: number;
  forks_count: number;
  open_issues_count: number;
};

export type GitHubSearchRepositoriesResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
};
