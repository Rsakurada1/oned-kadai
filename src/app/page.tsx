import { EmptyState } from "@/features/repositories/components/empty-state";
import { ErrorMessage } from "@/features/repositories/components/error-message";
import { FilterSummary } from "@/features/repositories/components/filter-summary";
import { Pagination } from "@/features/repositories/components/pagination";
import { RateLimitStatus } from "@/features/repositories/components/rate-limit-status";
import { RepositoryList } from "@/features/repositories/components/repository-list";
import { SearchForm } from "@/features/repositories/components/search-form";
import { SearchStatusAnnouncer } from "@/features/repositories/components/search-status-announcer";
import {
  parseSearchParams,
  type RepositorySearchParams,
  type RawSearchParams,
} from "@/features/repositories/model/search-params";
import { searchRepositories } from "@/features/repositories/services/search-repositories";
import { classifyGitHubError } from "@/lib/github/errors";
import { getGitHubSearchRateLimit } from "@/lib/github/get-rate-limit";

type HomePageProps = {
  searchParams: Promise<RawSearchParams>;
};

const PER_PAGE = 20;

/** Top page は URL query を検索状態として読み、form と検索結果を組み立てます。 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const search = parseSearchParams(sp);

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>GitHub リポジトリ検索</h1>
      </header>
      <SearchForm
        language={search.language}
        minStars={search.minStars}
        order={search.order}
        q={search.q}
        sort={search.sort}
        topic={search.topic}
      />
      <FilterSummary search={search} />
      {search.q ? await renderSearchResult(search) : null}
    </div>
  );
}

/**
 * 検索結果と /rate_limit を並行取得します。
 * 結果が cache hit した場合でも API 残量表示はできるだけ新しい値にします。
 */
async function renderSearchResult(search: RepositorySearchParams) {
  try {
    const [result, searchRateLimit] = await Promise.all([
      searchRepositories({
        q: search.q,
        language: search.language,
        topic: search.topic,
        minStars: search.minStars,
        sort: search.sort,
        order: search.order,
        page: search.page,
        perPage: PER_PAGE,
      }),
      getGitHubSearchRateLimit(),
    ]);
    const rateLimit = searchRateLimit ?? result.rateLimit;

    if (result.items.length === 0) {
      return (
        <>
          <SearchStatusAnnouncer
            focusTargetId="empty-state-heading"
            message={`${search.q} の検索結果はありません。`}
          />
          <EmptyState
            language={search.language}
            minStars={search.minStars}
            q={search.q}
            topic={search.topic}
          />
          <RateLimitStatus rateLimit={rateLimit} />
        </>
      );
    }

    return (
      <>
        <SearchStatusAnnouncer
          focusTargetId="search-results-heading"
          message={`${search.q} の検索結果を ${result.totalCount.toLocaleString()} 件表示しました。`}
        />
        <RepositoryList
          repositories={result.items}
          search={{ ...search, page: result.page }}
          totalCount={result.totalCount}
        />
        <RateLimitStatus rateLimit={rateLimit} />
        <Pagination
          currentPage={result.page}
          search={{ ...search, page: result.page }}
          totalPages={result.totalPages}
        />
      </>
    );
  } catch (error) {
    const classifiedError = classifyGitHubError(error);

    // 仕様上、検索条件エラーと rate limit はページ内で回復可能な案内として表示する。
    if (
      classifiedError.kind === "validation" ||
      classifiedError.kind === "rate-limit"
    ) {
      return (
        <>
          <SearchStatusAnnouncer
            focusTargetId="search-error-heading"
            message={classifiedError.title}
          />
          <ErrorMessage error={classifiedError} />
        </>
      );
    }

    throw error;
  }
}
