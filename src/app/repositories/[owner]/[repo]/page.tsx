import { notFound } from "next/navigation";

import { ErrorMessage } from "@/features/repositories/components/error-message";
import { RepositoryDetail } from "@/features/repositories/components/repository-detail";
import {
  parseSearchParams,
  type RawSearchParams,
} from "@/features/repositories/model/search-params";
import { createRepositorySearchUrl } from "@/features/repositories/model/search-url";
import type { RepositoryDetailResult as RepositoryDetailResultModel } from "@/features/repositories/model/repository";
import { getRepositoryDetail } from "@/features/repositories/services/get-repository-detail";
import {
  classifyGitHubError,
  type ClassifiedGitHubError,
} from "@/lib/github/errors";

type RepositoryDetailPageProps = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
  searchParams: Promise<RawSearchParams>;
};

type LoadRepositoryDetailResult =
  | {
      data: RepositoryDetailResultModel;
    }
  | {
      error: ClassifiedGitHubError;
    };

export default async function RepositoryDetailPage({
  params,
  searchParams,
}: RepositoryDetailPageProps) {
  const { owner, repo } = await params;
  const sp = await searchParams;
  const search = parseSearchParams(sp);
  const backHref = createRepositorySearchUrl(search);
  const repository = await loadRepositoryDetail(owner, repo);

  if ("error" in repository) {
    return <ErrorMessage error={repository.error} />;
  }

  return (
    <RepositoryDetail
      backHref={backHref}
      rateLimit={repository.data.rateLimit}
      repository={repository.data.repository}
    />
  );
}

async function loadRepositoryDetail(
  owner: string,
  repo: string,
): Promise<LoadRepositoryDetailResult> {
  try {
    return {
      data: await getRepositoryDetail({ owner, repo }),
    };
  } catch (error) {
    const classifiedError = classifyGitHubError(error);

    if (classifiedError.kind === "not-found") {
      notFound();
    }

    if (classifiedError.kind === "rate-limit") {
      return {
        error: classifiedError,
      };
    }

    throw error;
  }
}
