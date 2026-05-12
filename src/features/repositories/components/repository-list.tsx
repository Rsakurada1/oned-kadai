import type { RepositoryListItem } from "../model/repository";
import { RepositoryCard } from "./repository-card";

type RepositoryListProps = {
  repositories: RepositoryListItem[];
  q: string;
  page: number;
  totalCount: number;
};

export function RepositoryList({
  repositories,
  q,
  page,
  totalCount,
}: RepositoryListProps) {
  return (
    <section aria-labelledby="search-results-heading" className="results">
      <div className="section-heading">
        <h2 id="search-results-heading">検索結果</h2>
        <p>{totalCount.toLocaleString()} 件</p>
      </div>
      <ul className="repository-list">
        {repositories.map((repository) => (
          <li key={repository.id}>
            <RepositoryCard page={page} q={q} repository={repository} />
          </li>
        ))}
      </ul>
    </section>
  );
}

