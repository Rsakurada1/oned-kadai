export type RawSearchParams = Record<string, string | string[] | undefined>;

export type RepositorySearchParams = {
  q: string;
  page: number;
};

export function parseSearchParams(
  searchParams: RawSearchParams = {},
): RepositorySearchParams {
  return {
    q: firstValue(searchParams.q).trim(),
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

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

