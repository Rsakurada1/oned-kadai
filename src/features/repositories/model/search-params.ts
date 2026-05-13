export type RawSearchParams = Record<string, string | string[] | undefined>;

export type RepositorySearchParams = {
  q: string;
  language: string;
  topic: string;
  minStars: number | null;
  sort: RepositorySearchSort;
  order: RepositorySearchOrder;
  page: number;
};

export type RepositorySearchSort = "best-match" | "stars" | "forks" | "updated";
export type RepositorySearchOrder = "desc" | "asc";

/**
 * URL query を画面の検索状態に正規化します。
 * App Router の searchParams は string/string[] を取り得るため、ここで単一値に揃えます。
 */
export function parseSearchParams(
  searchParams: RawSearchParams = {},
): RepositorySearchParams {
  return {
    q: firstValue(searchParams.q).trim(),
    language: firstValue(searchParams.language).trim(),
    topic: firstValue(searchParams.topic).trim(),
    minStars: normalizeMinStars(firstValue(searchParams.minStars)),
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

/** Star 下限は空値を filter 未指定として扱い、負数や非数値を落とします。 */
export function normalizeMinStars(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  if (String(value).trim() === "") {
    return null;
  }

  const minStars = Math.floor(Number(value));
  if (!Number.isFinite(minStars) || minStars < 0) {
    return null;
  }

  return minStars;
}

/** GitHub Search API が受け付ける sort だけを通し、それ以外は best match に戻します。 */
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

/** 同名 query が複数ある場合でも、URL の先頭値だけを正本として扱います。 */
function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
