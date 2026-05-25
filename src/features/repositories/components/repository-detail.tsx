import Image from "next/image";
import Link from "next/link";

import type { GitHubRateLimit } from "@/lib/github/rate-limit";
import type { RepositoryDetail as RepositoryDetailModel } from "../model/repository";
import { CloneCommandPanel } from "./clone-command-panel";
import { RateLimitStatus } from "./rate-limit-status";

type RepositoryDetailProps = {
  repository: RepositoryDetailModel;
  rateLimit?: GitHubRateLimit | null;
  backHref: string;
};

/**
 * 詳細ページで再取得した repository 情報を表示し、一覧へ戻るための検索 URL を受け取る。
 */
export function RepositoryDetail({
  repository,
  rateLimit,
  backHref,
}: RepositoryDetailProps) {
  return (
    <article className="repository-detail">
      <Link className="back-link" href={backHref} prefetch={false}>
        検索結果へ戻る
      </Link>

      <header className="repository-detail__header">
        <Image
          alt={`${repository.ownerLogin} icon`}
          className="owner-avatar"
          height={72}
          src={repository.ownerAvatarUrl}
          unoptimized
          width={72}
        />
        <div className="repository-detail__heading">
          <p className="repository-detail__owner">{repository.ownerLogin}</p>
          <div className="repository-detail__title-row">
            <h1>{repository.fullName}</h1>
            <div className="repository-detail__actions">
              <a
                className="button button--secondary"
                href={repository.htmlUrl}
                rel="noreferrer"
                target="_blank"
              >
                GitHubで開く
              </a>
              {repository.homepageUrl ? (
                <a
                  className="button button--secondary"
                  href={repository.homepageUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  公式サイトを開く
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {repository.description ? (
        <p className="repository-detail__description">
          {repository.description}
        </p>
      ) : null}

      <dl className="detail-stats">
        <div>
          <dt>主な言語</dt>
          <dd>{repository.language ?? "Unknown"}</dd>
        </div>
        <div>
          <dt>Star 数</dt>
          <dd>{repository.stars.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Watcher 数</dt>
          <dd>{repository.watchers.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Fork 数</dt>
          <dd>{repository.forks.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Issue 数</dt>
          <dd>{repository.openIssues.toLocaleString()}</dd>
        </div>
      </dl>

      <section
        aria-labelledby="language-breakdown-heading"
        className="detail-section"
      >
        <div className="section-heading">
          <h2 id="language-breakdown-heading">言語構成</h2>
          <p>{repository.languages.length} 言語</p>
        </div>
        {repository.languages.length > 0 ? (
          <div className="language-breakdown">
            <div className="language-bar" aria-hidden="true">
              {repository.languages.map((language) => (
                <span
                  key={language.name}
                  style={{ flexGrow: language.bytes }}
                />
              ))}
            </div>
            <dl className="language-list">
              {repository.languages.map((language) => (
                <div key={language.name}>
                  <dt>{language.name}</dt>
                  <dd>{language.percentage.toFixed(1)}%</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="detail-section__empty">
            言語情報は公開されていません。
          </p>
        )}
      </section>

      <section
        aria-labelledby="repository-meta-heading"
        className="detail-section"
      >
        <div className="section-heading">
          <h2 id="repository-meta-heading">リポジトリ情報</h2>
        </div>
        <dl className="detail-meta">
          <div>
            <dt>ライセンス</dt>
            <dd>{repository.licenseName ?? "未設定"}</dd>
          </div>
          <div>
            <dt>Default branch</dt>
            <dd>{repository.defaultBranch ?? "不明"}</dd>
          </div>
          <div>
            <dt>公開範囲</dt>
            <dd>{formatVisibility(repository.visibility)}</dd>
          </div>
          <div>
            <dt>状態</dt>
            <dd>{repository.isArchived ? "Archived" : "Active"}</dd>
          </div>
          <div>
            <dt>作成日</dt>
            <dd>{formatDate(repository.createdAt)}</dd>
          </div>
          <div>
            <dt>最終 push</dt>
            <dd>{formatDate(repository.pushedAt)}</dd>
          </div>
          <div>
            <dt>更新日</dt>
            <dd>{formatDate(repository.updatedAt)}</dd>
          </div>
          <div>
            <dt>サイズ</dt>
            <dd>{formatSize(repository.sizeKb)}</dd>
          </div>
        </dl>
      </section>

      {repository.topics.length > 0 ? (
        <section
          aria-labelledby="repository-topics-heading"
          className="detail-section"
        >
          <div className="section-heading">
            <h2 id="repository-topics-heading">Topics</h2>
          </div>
          <ul className="topic-list">
            {repository.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {repository.cloneUrl || repository.sshUrl ? (
        <section
          aria-labelledby="repository-clone-heading"
          className="detail-section"
        >
          <div className="section-heading">
            <h2 id="repository-clone-heading">クローン</h2>
          </div>
          <CloneCommandPanel
            httpsUrl={repository.cloneUrl}
            sshUrl={repository.sshUrl}
          />
        </section>
      ) : null}

      <RateLimitStatus rateLimit={rateLimit} />
    </article>
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "不明";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(date);
}

function formatSize(value: number | null): string {
  if (value === null) {
    return "不明";
  }

  if (value >= 1_024) {
    return `${(value / 1_024).toFixed(1)} MB`;
  }

  return `${value.toLocaleString()} KB`;
}

function formatVisibility(value: string | null): string {
  if (value === "public") {
    return "Public";
  }

  if (value === "private") {
    return "Private";
  }

  return value ?? "不明";
}
