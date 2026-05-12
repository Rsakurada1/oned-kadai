import { EmptyState } from "@/features/repositories/components/empty-state";
import { ErrorMessage } from "@/features/repositories/components/error-message";
import { Pagination } from "@/features/repositories/components/pagination";
import { RepositoryList } from "@/features/repositories/components/repository-list";
import { SearchForm } from "@/features/repositories/components/search-form";
import {
  parseSearchParams,
  type RawSearchParams,
} from "@/features/repositories/model/search-params";
import { searchRepositories } from "@/features/repositories/services/search-repositories";
import { classifyGitHubError } from "@/lib/github/errors";

type HomePageProps = {
  searchParams: Promise<RawSearchParams>;
};

const PER_PAGE = 20;

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const { q, page } = parseSearchParams(sp);

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>GitHub リポジトリ検索</h1>
      </header>
      <SearchForm q={q} />
      {q ? await renderSearchResult(q, page) : null}
    </div>
  );
}

async function renderSearchResult(q: string, page: number) {
  try {
    const result = await searchRepositories({ q, page, perPage: PER_PAGE });

    if (result.items.length === 0) {
      return <EmptyState q={q} />;
    }

    return (
      <>
        <RepositoryList
          page={result.page}
          q={q}
          repositories={result.items}
          totalCount={result.totalCount}
        />
        <Pagination
          currentPage={result.page}
          q={q}
          totalPages={result.totalPages}
        />
      </>
    );
  } catch (error) {
    const classifiedError = classifyGitHubError(error);

    if (
      classifiedError.kind === "validation" ||
      classifiedError.kind === "rate-limit"
    ) {
      return <ErrorMessage error={classifiedError} />;
    }

    throw error;
  }
}

