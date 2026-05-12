import "server-only";

import { githubFetch } from "@/lib/github/client";
import type { GitHubSearchRepositoriesResponse } from "@/lib/github/types";
import type { RepositorySearchResult } from "../model/repository";
import { toRepositoryListItem } from "../model/repository-mapper";

type SearchRepositoriesInput = {
  q: string;
  page: number;
  perPage: number;
};

const GITHUB_SEARCH_CACHE_SECONDS = 60;
const GITHUB_SEARCH_RESULT_LIMIT = 1_000;

export async function searchRepositories({
  q,
  page,
  perPage,
}: SearchRepositoriesInput): Promise<RepositorySearchResult> {
  const response = await githubFetch<GitHubSearchRepositoriesResponse>(
    "/search/repositories",
    {
      revalidate: GITHUB_SEARCH_CACHE_SECONDS,
      searchParams: {
        q,
        page,
        per_page: perPage,
      },
    },
  );

  const cappedTotalCount = Math.min(
    response.total_count,
    GITHUB_SEARCH_RESULT_LIMIT,
  );

  return {
    items: response.items.map(toRepositoryListItem),
    totalCount: response.total_count,
    page,
    perPage,
    totalPages:
      cappedTotalCount === 0 ? 0 : Math.ceil(cappedTotalCount / perPage),
  };
}

