import Link from "next/link";

import { EmptyState } from "@/features/repositories/components/empty-state";
import { ErrorMessage } from "@/features/repositories/components/error-message";
import { FilterSummary } from "@/features/repositories/components/filter-summary";
import { Pagination } from "@/features/repositories/components/pagination";
import { RateLimitStatus } from "@/features/repositories/components/rate-limit-status";
import { RepositoryList } from "@/features/repositories/components/repository-list";
import { SearchForm } from "@/features/repositories/components/search-form";
import { SearchStatusAnnouncer } from "@/features/repositories/components/search-status-announcer";
import { SortLinks } from "@/features/repositories/components/sort-links";
import { StickySearchSidebar } from "@/features/repositories/components/sticky-search-sidebar";
import {
  parseSearchParams,
  type RepositorySearchParams,
  type RawSearchParams,
} from "@/features/repositories/model/search-params";
import { hasSearchCriteria } from "@/features/repositories/model/search-state";
import { searchRepositories } from "@/features/repositories/services/search-repositories";
import { classifyGitHubError } from "@/lib/github/errors";

type HomePageProps = {
  searchParams: Promise<RawSearchParams>;
};

const PER_PAGE = 20;

/** Top page は URL query を検索状態として読み、左フィルターと右一覧を組み立てます。 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const search = parseSearchParams(sp);
  const hasCriteria = hasSearchCriteria(search);

  return (
    <div className="repository-search-page">
      <header className="page-header">
        <p className="page-header__eyebrow">Repository Finder</p>
        <h1>GitHub リポジトリ検索</h1>
      </header>

      <div className="search-layout">
        <StickySearchSidebar>
          <SearchForm search={search} />
        </StickySearchSidebar>
        <section className="search-layout__results" aria-label="検索結果">
          {hasCriteria ? (
            <>
              <SortLinks search={search} />
              <FilterSummary search={search} />
            </>
          ) : null}
          {hasCriteria ? (
            await renderSearchResult(search)
          ) : (
            <InitialSearchState />
          )}
        </section>
      </div>
    </div>
  );
}

function InitialSearchState() {
  return (
    <section className="empty-state">
      <h2>条件を選んで検索してください</h2>
      <p>
        キーワードや技術スタックを指定すると、公開リポジトリをカード形式で表示します。
      </p>
      <div aria-label="検索例" className="starter-links">
        <Link className="starter-link" href="/?q=next&languages=TypeScript&page=1">
          Next.js
        </Link>
        <Link className="starter-link" href="/?languages=TypeScript&page=1">
          TypeScript
        </Link>
        <Link
          className="starter-link"
          href="/?frameworks=React&stars=100&page=1"
        >
          React / Star 100+
        </Link>
        <Link className="starter-link" href="/?recentlyUpdated=true&page=1">
          最近更新
        </Link>
      </div>
    </section>
  );
}

/**
 * 検索結果を取得し、同じレスポンスの rate limit header を表示にも使います。
 * 詳細ページへの prefetch と合わせて余分な GitHub API 呼び出しを増やさないようにします。
 */
async function renderSearchResult(search: RepositorySearchParams) {
  try {
    const result = await searchRepositories({
      q: search.q,
      languages: search.languages,
      frameworks: search.frameworks,
      clouds: search.clouds,
      stars: search.stars,
      forks: search.forks,
      lowIssues: search.lowIssues,
      recentlyUpdated: search.recentlyUpdated,
      sort: search.sort,
      order: search.order,
      page: search.page,
      perPage: PER_PAGE,
    });
    const rateLimit = result.rateLimit;

    if (result.items.length === 0) {
      return (
        <>
          <SearchStatusAnnouncer
            focusTargetId="empty-state-heading"
            message="検索結果はありません。"
          />
          <EmptyState search={search} />
          <RateLimitStatus rateLimit={rateLimit} />
        </>
      );
    }

    return (
      <>
        <SearchStatusAnnouncer
          focusTargetId="search-results-heading"
          message={`検索結果を ${result.totalCount.toLocaleString()} 件表示しました。`}
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
