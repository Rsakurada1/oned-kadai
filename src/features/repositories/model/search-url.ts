import type { RepositorySearchParams } from "./search-params";

export function createRepositorySearchUrl(
  search: RepositorySearchParams,
  page = search.page,
): string {
  const params = createRepositorySearchUrlParams(search, page);
  const query = params.toString();

  return query ? `/?${query}` : "/";
}

export function createRepositorySearchUrlParams(
  search: RepositorySearchParams,
  page = search.page,
): URLSearchParams {
  const params = new URLSearchParams();

  if (search.q) {
    params.set("q", search.q);
  }

  if (search.language) {
    params.set("language", search.language);
  }

  if (search.topic) {
    params.set("topic", search.topic);
  }

  if (search.minStars !== null) {
    params.set("minStars", String(search.minStars));
  }

  if (search.sort !== "best-match") {
    params.set("sort", search.sort);
    params.set("order", search.order);
  }

  if (search.q || search.language || search.topic || search.minStars !== null) {
    params.set("page", String(page));
  }

  return params;
}
