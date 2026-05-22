import type { RepositorySearchParams } from "./search-params";

export type SearchFilterState = {
  key: string;
  label: string;
  removeSearch: RepositorySearchParams;
};

/**
 * 検索結果に反映される検索条件を、表示ラベルと解除後 state の形へまとめる。
 * filter chip、empty state、検索実行の active 判定で同じ定義を使います。
 */
export function createSearchFilterStates(
  search: RepositorySearchParams,
): SearchFilterState[] {
  const filters: SearchFilterState[] = [];

  if (search.q) {
    filters.push({
      key: "q",
      label: `キーワード: ${search.q}`,
      removeSearch: { ...search, q: "", page: 1 },
    });
  }

  for (const language of search.languages) {
    filters.push({
      key: `language:${language}`,
      label: `言語: ${language}`,
      removeSearch: {
        ...search,
        languages: removeValue(search.languages, language),
        page: 1,
      },
    });
  }

  for (const framework of search.frameworks) {
    filters.push({
      key: `framework:${framework}`,
      label: `FW: ${framework}`,
      removeSearch: {
        ...search,
        frameworks: removeValue(search.frameworks, framework),
        page: 1,
      },
    });
  }

  for (const cloud of search.clouds) {
    filters.push({
      key: `cloud:${cloud}`,
      label: `Cloud: ${cloud}`,
      removeSearch: {
        ...search,
        clouds: removeValue(search.clouds, cloud),
        page: 1,
      },
    });
  }

  if (search.stars !== null) {
    filters.push({
      key: "stars",
      label: `Star ${search.stars}以上`,
      removeSearch: { ...search, stars: null, page: 1 },
    });
  }

  if (search.forks !== null) {
    filters.push({
      key: "forks",
      label: `Fork ${search.forks}以上`,
      removeSearch: { ...search, forks: null, page: 1 },
    });
  }

  if (search.lowIssues) {
    filters.push({
      key: "lowIssues",
      label: "Issueが少ない",
      removeSearch: { ...search, lowIssues: false, page: 1 },
    });
  }

  if (search.recentlyUpdated) {
    filters.push({
      key: "recentlyUpdated",
      label: "最近更新された",
      removeSearch: { ...search, recentlyUpdated: false, page: 1 },
    });
  }

  return filters;
}

export function createSearchFilterChips(
  search: RepositorySearchParams,
): SearchFilterState[] {
  const filters = createSearchFilterStates(search);

  if (search.sort !== "best-match") {
    filters.push({
      key: "sort",
      label: `並び替え: ${search.sort}`,
      removeSearch: {
        ...search,
        sort: "best-match",
        order: "desc",
        page: 1,
      },
    });
  }

  return filters;
}

export function createSearchFilterLabels(
  search: RepositorySearchParams,
): string[] {
  return createSearchFilterStates(search).map((filter) => filter.label);
}

export function hasSearchCriteria(search: RepositorySearchParams): boolean {
  return createSearchFilterStates(search).length > 0;
}

function removeValue(values: readonly string[], value: string): string[] {
  return values.filter((currentValue) => currentValue !== value);
}
