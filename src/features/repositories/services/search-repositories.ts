import "server-only";

import { githubFetch } from "@/lib/github/client";
import type { GitHubSearchRepositoriesResponse } from "@/lib/github/types";
import type { RepositorySearchResult } from "../model/repository";
import type {
  RepositorySearchOrder,
  RepositorySearchSort,
} from "../model/search-params";
import { toRepositoryListItem } from "../model/repository-mapper";
import { buildRepositorySearchQuery } from "../model/search-query";

type SearchRepositoriesInput = {
  q: string;
  language: string;
  topic: string;
  minStars: number | null;
  sort: RepositorySearchSort;
  order: RepositorySearchOrder;
  page: number;
  perPage: number;
};

const GITHUB_SEARCH_CACHE_SECONDS = 60;
const GITHUB_SEARCH_RESULT_LIMIT = 1_000;

/**
 * リポジトリ検索の application service です。
 * GitHub API の件数制限や filter の query 化をここに閉じ込めます。
 */
export async function searchRepositories({
  q,
  language,
  topic,
  minStars,
  sort,
  order,
  page,
  perPage,
}: SearchRepositoriesInput): Promise<RepositorySearchResult> {
  const response = await githubFetch<GitHubSearchRepositoriesResponse>(
    "/search/repositories",
    {
      revalidate: GITHUB_SEARCH_CACHE_SECONDS,
      staleWhileRevalidate: 300,
      tags: ["github:search"],
      searchParams: {
        q: buildRepositorySearchQuery({ q, language, topic, minStars }),
        sort: sort === "best-match" ? undefined : sort,
        order: sort === "best-match" ? undefined : order,
        page,
        per_page: perPage,
      },
    },
  );

  const cappedTotalCount = Math.min(
    response.data.total_count,
    GITHUB_SEARCH_RESULT_LIMIT,
  );

  // GitHub Search API は 1,000 件までしかページングできないため、UI の総ページも上限に合わせる。
  return {
    items: response.data.items.map(toRepositoryListItem),
    totalCount: response.data.total_count,
    page,
    perPage,
    totalPages:
      cappedTotalCount === 0 ? 0 : Math.ceil(cappedTotalCount / perPage),
    rateLimit: response.rateLimit,
  };
}
