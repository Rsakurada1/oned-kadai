import Image from "next/image";
import Link from "next/link";

import type { RepositoryDetail as RepositoryDetailModel } from "../model/repository";

type RepositoryDetailProps = {
  repository: RepositoryDetailModel;
  backHref: string;
};

export function RepositoryDetail({
  repository,
  backHref,
}: RepositoryDetailProps) {
  return (
    <article className="repository-detail">
      <Link className="back-link" href={backHref}>
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
        <div>
          <p className="repository-detail__owner">{repository.ownerLogin}</p>
          <h1>{repository.fullName}</h1>
        </div>
      </header>

      {repository.description ? (
        <p className="repository-detail__description">
          {repository.description}
        </p>
      ) : null}

      <dl className="detail-stats">
        <div>
          <dt>Language</dt>
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

      <a
        className="button button--secondary"
        href={repository.htmlUrl}
        rel="noreferrer"
        target="_blank"
      >
        GitHub で開く
      </a>
    </article>
  );
}

