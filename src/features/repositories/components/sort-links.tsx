import Link from "next/link";

import type {
  RepositorySearchParams,
  RepositorySearchSort,
} from "../model/search-params";
import { createRepositorySearchUrl } from "../model/search-url";

type SortLinksProps = {
  search: RepositorySearchParams;
};

const SORT_OPTIONS: ReadonlyArray<{
  label: string;
  sort: RepositorySearchSort;
}> = [
  { label: "関連度順", sort: "best-match" },
  { label: "Star順", sort: "stars" },
  { label: "Fork順", sort: "forks" },
  { label: "更新日順", sort: "updated" },
];

export function SortLinks({ search }: SortLinksProps) {
  return (
    <nav aria-label="検索結果の並び替え" className="sort-links">
      <span className="sort-links__label">並び替え</span>
      <div className="sort-links__items">
        {SORT_OPTIONS.map((option) => {
          const isActive = search.sort === option.sort;
          const href = createRepositorySearchUrl(
            {
              ...search,
              sort: option.sort,
              order: "desc",
              page: 1,
            },
            1,
          );

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "sort-link is-active" : "sort-link"}
              href={href}
              key={option.sort}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
