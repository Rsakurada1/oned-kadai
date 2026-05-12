import "server-only";

import { githubFetch } from "@/lib/github/client";
import type { GitHubRepository } from "@/lib/github/types";
import type { RepositoryDetail } from "../model/repository";
import { toRepositoryDetail } from "../model/repository-mapper";

type GetRepositoryDetailInput = {
  owner: string;
  repo: string;
};

const GITHUB_REPOSITORY_DETAIL_CACHE_SECONDS = 300;

export async function getRepositoryDetail({
  owner,
  repo,
}: GetRepositoryDetailInput): Promise<RepositoryDetail> {
  const repository = await githubFetch<GitHubRepository>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      revalidate: GITHUB_REPOSITORY_DETAIL_CACHE_SECONDS,
    },
  );

  return toRepositoryDetail(repository);
}

