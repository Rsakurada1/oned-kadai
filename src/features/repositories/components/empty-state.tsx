type EmptyStateProps = {
  q: string;
  language?: string;
  topic?: string;
  minStars?: number | null;
};

export function EmptyState({
  q,
  language = "",
  topic = "",
  minStars = null,
}: EmptyStateProps) {
  const filters = [
    language ? `Language: ${language}` : null,
    topic ? `Topic: ${topic}` : null,
    minStars !== null ? `Stars: ${minStars} 以上` : null,
  ].filter(Boolean);

  return (
    <section aria-labelledby="empty-state-heading" className="empty-state">
      <h2 id="empty-state-heading" tabIndex={-1}>
        検索結果はありません
      </h2>
      <p>
        「{q}」
        {filters.length > 0 ? `（${filters.join(" / ")}）` : ""}
        に一致する公開リポジトリは見つかりませんでした。別のキーワードで検索してください。
      </p>
      <ul className="state-suggestions">
        <li>Star 下限を下げる</li>
        <li>Topic や Language を外す</li>
        <li>より短いキーワードで検索する</li>
      </ul>
    </section>
  );
}
