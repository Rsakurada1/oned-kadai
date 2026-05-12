import Link from "next/link";

type PaginationProps = {
  q: string;
  currentPage: number;
  totalPages: number;
};

export function Pagination({ q, currentPage, totalPages }: PaginationProps) {
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
          href={createPageHref(q, currentPage - 1)}
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
          href={createPageHref(q, currentPage + 1)}
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

function createPageHref(q: string, page: number): string {
  const params = new URLSearchParams({
    q,
    page: String(page),
  });

  return `/?${params.toString()}`;
}

