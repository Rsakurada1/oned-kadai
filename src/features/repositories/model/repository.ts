import type { GitHubRateLimit } from "@/lib/github/rate-limit";

export type RepositoryListItem = {
  id: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  description: string | null;
  language: string | null;
  updatedAt: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  htmlUrl: string;
};

export type RepositoryDetail = RepositoryListItem & {
  watchers: number;
};

export type RepositorySearchResult = {
  items: RepositoryListItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
  rateLimit: GitHubRateLimit | null;
};

export type RepositoryDetailResult = {
  repository: RepositoryDetail;
  rateLimit: GitHubRateLimit | null;
};
