import Link from "next/link";

import type { RepositorySearchParams } from "../model/search-params";
import { createRepositorySearchUrl } from "../model/search-url";

type FilterSummaryProps = {
  search: RepositorySearchParams;
};

type FilterChip = {
  key: string;
  label: string;
  removeHref: string;
};

/**
 * 現在の検索条件をチップとして表示し、URL を正本にしたまま解除操作を提供する。
 */
export function FilterSummary({ search }: FilterSummaryProps) {
  const chips = createFilterChips(search);

  if (chips.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="適用中の検索条件"
      className="filter-summary"
    >
      <div className="filter-summary__chips">
        {chips.map((chip) => (
          <span className="filter-chip" key={chip.key}>
            <span>{chip.label}</span>
            <Link aria-label={`${chip.label} を解除`} href={chip.removeHref}>
              解除
            </Link>
          </span>
        ))}
      </div>
      <Link className="filter-summary__reset" href="/">
        すべてリセット
      </Link>
    </section>
  );
}

/**
 * 各チップの解除リンクは該当条件だけを外し、結果の取り違えを避けるため page を 1 に戻す。
 */
function createFilterChips(search: RepositorySearchParams): FilterChip[] {
  const chips: FilterChip[] = [];

  if (search.q) {
    chips.push({
      key: "q",
      label: `Keyword: ${search.q}`,
      removeHref: createRepositorySearchUrl({ ...search, q: "", page: 1 }),
    });
  }

  if (search.language) {
    chips.push({
      key: "language",
      label: `Language: ${search.language}`,
      removeHref: createRepositorySearchUrl({
        ...search,
        language: "",
        page: 1,
      }),
    });
  }

  if (search.topic) {
    chips.push({
      key: "topic",
      label: `Topic: ${search.topic}`,
      removeHref: createRepositorySearchUrl({ ...search, topic: "", page: 1 }),
    });
  }

  if (search.minStars !== null) {
    chips.push({
      key: "minStars",
      label: `Stars: ${search.minStars}+`,
      removeHref: createRepositorySearchUrl({
        ...search,
        minStars: null,
        page: 1,
      }),
    });
  }

  if (search.sort !== "best-match") {
    chips.push({
      key: "sort",
      label: `Sort: ${search.sort} / ${search.order}`,
      removeHref: createRepositorySearchUrl({
        ...search,
        sort: "best-match",
        order: "desc",
        page: 1,
      }),
    });
  }

  return chips;
}
