type EmptyStateProps = {
  q: string;
};

export function EmptyState({ q }: EmptyStateProps) {
  return (
    <section aria-labelledby="empty-state-heading" className="empty-state">
      <h2 id="empty-state-heading">検索結果はありません</h2>
      <p>
        「{q}」に一致する公開リポジトリは見つかりませんでした。別のキーワードで検索してください。
      </p>
    </section>
  );
}

