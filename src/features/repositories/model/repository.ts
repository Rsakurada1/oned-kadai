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

export type RepositoryLanguage = {
  name: string;
  bytes: number;
  percentage: number;
};

export type RepositoryDetail = RepositoryListItem & {
  watchers: number;
  licenseName: string | null;
  topics: string[];
  homepageUrl: string | null;
  defaultBranch: string | null;
  createdAt: string | null;
  pushedAt: string | null;
  sizeKb: number | null;
  visibility: string | null;
  isArchived: boolean;
  cloneUrl: string | null;
  languages: RepositoryLanguage[];
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
