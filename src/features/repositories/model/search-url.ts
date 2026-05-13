import type { RepositorySearchParams } from "./search-params";

/** 検索状態から共有可能な URL を作ります。filter chip と pagination で共通利用します。 */
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

  // 未検索状態では page だけが URL に残らないよう、条件がある時だけ付与する。
  if (search.q || search.language || search.topic || search.minStars !== null) {
    params.set("page", String(page));
  }

  return params;
}
