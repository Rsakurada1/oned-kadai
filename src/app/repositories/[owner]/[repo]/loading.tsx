export default function RepositoryDetailLoading() {
  return (
    <div className="loading-state" role="status">
      <span className="sr-only">リポジトリを読み込み中...</span>
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton-grid">
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
      </div>
    </div>
  );
}
