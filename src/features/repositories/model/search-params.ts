import {
  CLOUD_FILTERS,
  FRAMEWORK_FILTERS,
  LANGUAGE_FILTERS,
} from "./search-filters";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type RepositorySearchParams = {
  q: string;
  languages: string[];
  frameworks: string[];
  clouds: string[];
  stars: StarThreshold | null;
  forks: ForkThreshold | null;
  lowIssues: boolean;
  recentlyUpdated: boolean;
  sort: RepositorySearchSort;
  order: RepositorySearchOrder;
  page: number;
};

export type RepositorySearchSort = "best-match" | "stars" | "forks" | "updated";
export type RepositorySearchOrder = "desc" | "asc";
export type StarThreshold = number;
export type ForkThreshold = number;

/**
 * URL query を画面の検索状態へ正規化します。
 * checkbox submit の repeated params と、内部リンクの comma-separated params の両方を受け付けます。
 */
export function parseSearchParams(
  searchParams: RawSearchParams = {},
): RepositorySearchParams {
  return {
    q: firstValue(searchParams.q).trim(),
    languages: normalizeKnownValues(searchParams.languages, LANGUAGE_FILTERS),
    frameworks: normalizeKnownValues(
      searchParams.frameworks,
      FRAMEWORK_FILTERS.map((filter) => filter.value),
    ),
    clouds: normalizeKnownValues(
      searchParams.clouds,
      CLOUD_FILTERS.map((filter) => filter.value),
    ),
    stars: normalizeStarThreshold(searchParams.stars),
    forks: normalizeForkThreshold(searchParams.forks),
    lowIssues: normalizeBooleanParam(searchParams.lowIssues),
    recentlyUpdated: normalizeBooleanParam(searchParams.recentlyUpdated),
    sort: normalizeSort(firstValue(searchParams.sort)),
    order: normalizeOrder(firstValue(searchParams.order)),
    page: normalizePage(firstValue(searchParams.page)),
  };
}

/** page は 1 始まりに固定し、不正値や小数は安全な値へ丸めます。 */
export function normalizePage(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") {
    return 1;
  }

  const page = Math.floor(Number(value));
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

export function normalizeStarThreshold(
  value: string | string[] | undefined,
): StarThreshold | null {
  return normalizeThreshold(value);
}

export function normalizeForkThreshold(
  value: string | string[] | undefined,
): ForkThreshold | null {
  return normalizeThreshold(value);
}

/** GitHub Search API が受け付ける sort だけを通し、それ以外は関連度順へ戻します。 */
export function normalizeSort(value: unknown): RepositorySearchSort {
  if (value === "stars" || value === "forks" || value === "updated") {
    return value;
  }

  return "best-match";
}

/** order は UI の初期表示と GitHub の既定に合わせて desc を fallback にします。 */
export function normalizeOrder(value: unknown): RepositorySearchOrder {
  if (value === "asc") {
    return "asc";
  }

  return "desc";
}

function normalizeThreshold(
  value: string | string[] | undefined,
): number | null {
  const selected = valuesFromParam(value)
    .map((rawValue) => Number(rawValue))
    .map((rawValue) => Math.floor(rawValue))
    .filter((rawValue) => Number.isFinite(rawValue) && rawValue >= 0);

  if (selected.length === 0) {
    return null;
  }

  return selected.sort((a, b) => b - a)[0] ?? null;
}

function normalizeKnownValues(
  value: string | string[] | undefined,
  allowedValues: readonly string[],
): string[] {
  const allowed = new Set(allowedValues);
  const selected = valuesFromParam(value).filter((rawValue) =>
    allowed.has(rawValue),
  );

  return Array.from(new Set(selected));
}

function normalizeBooleanParam(value: string | string[] | undefined): boolean {
  return valuesFromParam(value).some((rawValue) =>
    ["true", "1", "on", "yes"].includes(rawValue.toLowerCase()),
  );
}

function valuesFromParam(value: string | string[] | undefined): string[] {
  const values = Array.isArray(value) ? value : [value ?? ""];

  return values
    .flatMap((rawValue) => rawValue.split(","))
    .map((rawValue) => rawValue.trim())
    .filter(Boolean);
}

/** 同名 query が複数ある場合でも、単一値の項目は先頭値だけを正本として扱います。 */
function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
