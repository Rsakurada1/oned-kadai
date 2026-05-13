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

export function normalizeSort(value: unknown): RepositorySearchSort {
  if (value === "stars" || value === "forks" || value === "updated") {
    return value;
  }

  return "best-match";
}

export function normalizeOrder(value: unknown): RepositorySearchOrder {
  if (value === "asc") {
    return "asc";
  }

  return "desc";
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
