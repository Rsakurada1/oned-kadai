import Link from "next/link";

import type { RepositoryListItem } from "../model/repository";

type RepositoryCardProps = {
  repository: RepositoryListItem;
  q: string;
  page: number;
};

export function RepositoryCard({ repository, q, page }: RepositoryCardProps) {
  const detailHref = createDetailHref(repository, q, page);

  return (
    <article className="repository-card">
      <div className="repository-card__body">
        <h3 className="repository-card__title">
          <Link href={detailHref}>{repository.fullName}</Link>
        </h3>
        <p className="repository-card__description">
          {repository.description ?? "説明は登録されていません。"}
        </p>
      </div>
      <dl className="repository-card__stats" aria-label={`${repository.fullName} の統計`}>
        <div>
          <dt>Language</dt>
          <dd>{repository.language ?? "Unknown"}</dd>
        </div>
        <div>
          <dt>Stars</dt>
          <dd>{repository.stars.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Forks</dt>
          <dd>{repository.forks.toLocaleString()}</dd>
        </div>
      </dl>
    </article>
  );
}

function createDetailHref(
  repository: RepositoryListItem,
  q: string,
  page: number,
): string {
  const params = new URLSearchParams({
    q,
    page: String(page),
  });

  return `/repositories/${encodeURIComponent(
    repository.ownerLogin,
  )}/${encodeURIComponent(repository.name)}?${params.toString()}`;
}

