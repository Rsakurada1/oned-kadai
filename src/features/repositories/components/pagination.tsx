import Link from "next/link";

import type { RepositorySearchParams } from "../model/search-params";
import { createRepositorySearchUrl } from "../model/search-url";

type PaginationProps = {
  search: RepositorySearchParams;
  currentPage: number;
  totalPages: number;
};

export function Pagination({
  search,
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="検索結果ページ" className="pagination">
      {hasPrevious ? (
        <Link
          aria-label={`前のページ ${currentPage - 1} へ`}
          className="pagination__link"
          href={createRepositorySearchUrl(search, currentPage - 1)}
        >
          前へ
        </Link>
      ) : (
        <span aria-disabled="true" className="pagination__link is-disabled">
          前へ
        </span>
      )}

      <span className="pagination__status" aria-current="page">
        {currentPage} / {totalPages}
      </span>

      {hasNext ? (
        <Link
          aria-label={`次のページ ${currentPage + 1} へ`}
          className="pagination__link"
          href={createRepositorySearchUrl(search, currentPage + 1)}
        >
          次へ
        </Link>
      ) : (
        <span aria-disabled="true" className="pagination__link is-disabled">
          次へ
        </span>
      )}
    </nav>
  );
}
