import Image from "next/image";
import Link from "next/link";

import type { RepositoryListItem } from "../model/repository";
import type { RepositorySearchParams } from "../model/search-params";
import { createRepositorySearchUrlParams } from "../model/search-url";

type RepositoryCardProps = {
  repository: RepositoryListItem;
  search: RepositorySearchParams;
};

/**
 * 一覧カードはアプリ内の詳細ページと GitHub 外部リンクを分けて、操作先を明確にする。
 */
export function RepositoryCard({
  repository,
  search,
}: RepositoryCardProps) {
  const detailHref = createDetailHref(repository, search);

  return (
    <article className="repository-card">
      <div className="repository-card__body">
        <header className="repository-card__header">
          <Image
            alt=""
            className="repository-card__avatar"
            height={40}
            src={repository.ownerAvatarUrl}
            unoptimized
            width={40}
          />
          <div>
            <p className="repository-card__owner">{repository.ownerLogin}</p>
            <h3 className="repository-card__title">
              <Link href={detailHref} prefetch={false}>
                {repository.fullName}
              </Link>
            </h3>
          </div>
        </header>
        <p className="repository-card__description">
          {repository.description ?? "説明は登録されていません。"}
        </p>
        <div className="repository-card__actions">
          <Link
            className="repository-card__action repository-card__action--primary"
            href={detailHref}
            prefetch={false}
          >
            <span className="repository-card__action-icon" aria-hidden="true">
              →
            </span>
            詳細を見る
          </Link>
          <a
            className="repository-card__action repository-card__action--secondary"
            href={repository.htmlUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span className="repository-card__action-icon" aria-hidden="true">
              ↗
            </span>
            GitHubで見る
          </a>
        </div>
      </div>
      <dl
        className="repository-card__stats"
        aria-label={`${repository.fullName} の統計`}
      >
        <div className="repository-card__stat repository-card__stat--language">
          <dt>言語</dt>
          <dd>
            <span
              className="repository-card__language-dot"
              aria-hidden="true"
            />
            {repository.language ?? "Unknown"}
          </dd>
        </div>
        <div className="repository-card__stat repository-card__stat--metric repository-card__stat--stars">
          <dt>Star</dt>
          <dd>{repository.stars.toLocaleString()}</dd>
        </div>
        <div className="repository-card__stat repository-card__stat--metric repository-card__stat--forks">
          <dt>Fork</dt>
          <dd>{repository.forks.toLocaleString()}</dd>
        </div>
        <div className="repository-card__stat repository-card__stat--subtle">
          <dt>Issue</dt>
          <dd>{repository.openIssues.toLocaleString()}</dd>
        </div>
        <div className="repository-card__stat repository-card__stat--subtle">
          <dt>更新日</dt>
          <dd>{formatDate(repository.updatedAt)}</dd>
        </div>
      </dl>
    </article>
  );
}

/**
 * 詳細ページから検索結果へ戻れるよう、現在の検索条件をクエリとして引き継ぐ。
 */
function createDetailHref(
  repository: RepositoryListItem,
  search: RepositorySearchParams,
): string {
  const params = createRepositorySearchUrlParams(search);

  return `/repositories/${encodeURIComponent(
    repository.ownerLogin,
  )}/${encodeURIComponent(repository.name)}?${params.toString()}`;
}

/**
 * GitHub API やテスト用モックで日付が欠けてもカード全体を壊さないための表示用整形。
 */
function formatDate(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(date);
}
