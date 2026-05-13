import "server-only";

import { githubFetch } from "@/lib/github/client";
import type { GitHubRepository } from "@/lib/github/types";
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
  const repository = await githubFetch<GitHubRepository>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      revalidate: GITHUB_REPOSITORY_DETAIL_CACHE_SECONDS,
      staleWhileRevalidate: 1_800,
      tags: [`github:repository:${owner}/${repo}`],
    },
  );

  return {
    repository: toRepositoryDetail(repository.data),
    rateLimit: repository.rateLimit,
  };
}
