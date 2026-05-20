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
    <section aria-label="適用中の検索条件" className="filter-summary">
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
      label: `キーワード: ${search.q}`,
      removeHref: createRepositorySearchUrl({ ...search, q: "", page: 1 }),
    });
  }

  for (const language of search.languages) {
    chips.push({
      key: `language:${language}`,
      label: `言語: ${language}`,
      removeHref: createRepositorySearchUrl({
        ...search,
        languages: removeValue(search.languages, language),
        page: 1,
      }),
    });
  }

  for (const framework of search.frameworks) {
    chips.push({
      key: `framework:${framework}`,
      label: `FW: ${framework}`,
      removeHref: createRepositorySearchUrl({
        ...search,
        frameworks: removeValue(search.frameworks, framework),
        page: 1,
      }),
    });
  }

  for (const cloud of search.clouds) {
    chips.push({
      key: `cloud:${cloud}`,
      label: `Cloud: ${cloud}`,
      removeHref: createRepositorySearchUrl({
        ...search,
        clouds: removeValue(search.clouds, cloud),
        page: 1,
      }),
    });
  }

  if (search.stars !== null) {
    chips.push({
      key: "stars",
      label: `Star ${search.stars}以上`,
      removeHref: createRepositorySearchUrl({
        ...search,
        stars: null,
        page: 1,
      }),
    });
  }

  if (search.forks !== null) {
    chips.push({
      key: "forks",
      label: `Fork ${search.forks}以上`,
      removeHref: createRepositorySearchUrl({
        ...search,
        forks: null,
        page: 1,
      }),
    });
  }

  if (search.lowIssues) {
    chips.push({
      key: "lowIssues",
      label: "Issueが少ない",
      removeHref: createRepositorySearchUrl({
        ...search,
        lowIssues: false,
        page: 1,
      }),
    });
  }

  if (search.recentlyUpdated) {
    chips.push({
      key: "recentlyUpdated",
      label: "最近更新された",
      removeHref: createRepositorySearchUrl({
        ...search,
        recentlyUpdated: false,
        page: 1,
      }),
    });
  }

  if (search.readme) {
    chips.push({
      key: "readme",
      label: "READMEあり",
      removeHref: createRepositorySearchUrl({
        ...search,
        readme: false,
        page: 1,
      }),
    });
  }

  if (search.sort !== "best-match") {
    chips.push({
      key: "sort",
      label: `並び替え: ${search.sort}`,
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

function removeValue(values: readonly string[], value: string): string[] {
  return values.filter((currentValue) => currentValue !== value);
}
