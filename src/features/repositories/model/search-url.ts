import type { RepositorySearchParams } from "./search-params";

/** 検索状態から共有可能な URL を作ります。filter chip、sort link、pagination で共通利用します。 */
export function createRepositorySearchUrl(
  search: RepositorySearchParams,
  page = search.page,
): string {
  const params = createRepositorySearchUrlParams(search, page);
  const query = params.toString();

  return query ? `/?${query}` : "/";
}

/**
 * URLSearchParams を返す版です。
 * 詳細ページへのリンクでは pathname にこの query だけを付けたいので分けています。
 */
export function createRepositorySearchUrlParams(
  search: RepositorySearchParams,
  page = search.page,
): URLSearchParams {
  const params = new URLSearchParams();

  if (search.q) {
    params.set("q", search.q);
  }

  setCsvParam(params, "languages", search.languages);
  setCsvParam(params, "frameworks", search.frameworks);
  setCsvParam(params, "clouds", search.clouds);

  if (search.stars !== null) {
    params.set("stars", String(search.stars));
  }

  if (search.forks !== null) {
    params.set("forks", String(search.forks));
  }

  if (search.lowIssues) {
    params.set("lowIssues", "true");
  }

  if (search.recentlyUpdated) {
    params.set("recentlyUpdated", "true");
  }

  if (search.readme) {
    params.set("readme", "true");
  }

  if (search.sort !== "best-match") {
    params.set("sort", search.sort);
    params.set("order", search.order);
  }

  if (hasAnySearchState(search)) {
    params.set("page", String(page));
  }

  return params;
}

function setCsvParam(
  params: URLSearchParams,
  name: string,
  values: readonly string[],
) {
  if (values.length > 0) {
    params.set(name, values.join(","));
  }
}

function hasAnySearchState(search: RepositorySearchParams): boolean {
  return Boolean(
    search.q ||
      search.languages.length > 0 ||
      search.frameworks.length > 0 ||
      search.clouds.length > 0 ||
      search.stars !== null ||
      search.forks !== null ||
      search.lowIssues ||
      search.recentlyUpdated ||
      search.readme,
  );
}
