import "server-only";

import { githubFetch } from "@/lib/github/client";
import { GitHubApiError } from "@/lib/github/errors";
import type {
  GitHubRepository,
  GitHubRepositoryLanguages,
} from "@/lib/github/types";
import type { RepositoryDetailResult } from "../model/repository";
import { toRepositoryDetail } from "../model/repository-mapper";

type GetRepositoryDetailInput = {
  owner: string;
  repo: string;
};

const GITHUB_REPOSITORY_DETAIL_CACHE_SECONDS = 300;

/**
 * 詳細ページ用に必ず /repos/{owner}/{repo} を再取得します。
 * 一覧画面の情報へ依存しないことで、直リンクとリロード時の整合性を保ちます。
 */
export async function getRepositoryDetail({
  owner,
  repo,
}: GetRepositoryDetailInput): Promise<RepositoryDetailResult> {
  const repositoryPath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}`;
  const repositoryRequest = githubFetch<GitHubRepository>(repositoryPath, {
    revalidate: GITHUB_REPOSITORY_DETAIL_CACHE_SECONDS,
    staleWhileRevalidate: 1_800,
    tags: [`github:repository:${owner}/${repo}`],
  });
  const languagesRequest = githubFetch<GitHubRepositoryLanguages>(
    `${repositoryPath}/languages`,
    {
      revalidate: GITHUB_REPOSITORY_DETAIL_CACHE_SECONDS,
      staleWhileRevalidate: 1_800,
      tags: [`github:repository:${owner}/${repo}:languages`],
    },
  ).catch((error: unknown) => {
    if (error instanceof GitHubApiError) {
      return {
        data: {},
        rateLimit: error.rateLimit,
      };
    }

    throw error;
  });
  const [repository, languages] = await Promise.all([
    repositoryRequest,
    languagesRequest,
  ]);

  return {
    repository: toRepositoryDetail(repository.data, languages.data),
    rateLimit: languages.rateLimit ?? repository.rateLimit,
  };
}
