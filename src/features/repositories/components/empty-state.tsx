import type { RepositorySearchParams } from "../model/search-params";

type EmptyStateProps = {
  search: RepositorySearchParams;
};

/**
 * 0 件時に現在の条件を明示し、次に試せる調整案を同じ画面内で提示する。
 */
export function EmptyState({ search }: EmptyStateProps) {
  const filters = createFilterLabels(search);

  return (
    <section aria-labelledby="empty-state-heading" className="empty-state">
      <h2 id="empty-state-heading" tabIndex={-1}>
        検索結果はありません
      </h2>
      <p>
        {filters.length > 0
          ? `「${filters.join(" / ")}」に一致する公開リポジトリは見つかりませんでした。`
          : "条件に一致する公開リポジトリは見つかりませんでした。"}
        別の条件で検索してください。
      </p>
      <ul className="state-suggestions">
        <li>キーワードを短くする</li>
        <li>言語やフレームワークの選択数を減らす</li>
        <li>Star や Fork の下限を外す</li>
      </ul>
    </section>
  );
}

function createFilterLabels(search: RepositorySearchParams): string[] {
  return [
    search.q ? `キーワード: ${search.q}` : null,
    ...search.languages.map((language) => `言語: ${language}`),
    ...search.frameworks.map((framework) => `FW: ${framework}`),
    ...search.clouds.map((cloud) => `Cloud: ${cloud}`),
    search.stars !== null ? `Star ${search.stars}以上` : null,
    search.forks !== null ? `Fork ${search.forks}以上` : null,
    search.lowIssues ? "Issueが少ない" : null,
    search.recentlyUpdated ? "最近更新された" : null,
    search.readme ? "READMEあり" : null,
  ].filter((label): label is string => Boolean(label));
}
