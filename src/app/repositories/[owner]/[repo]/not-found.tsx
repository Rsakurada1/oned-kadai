import Link from "next/link";

export default function RepositoryNotFound() {
  return (
    <div className="empty-state">
      <h1>リポジトリが見つかりません</h1>
      <p>指定されたリポジトリは存在しないか、公開されていません。</p>
      <Link className="button button--secondary" href="/">
        検索へ戻る
      </Link>
    </div>
  );
}

