import type { RepositoryListItem } from "../model/repository";
import type { RepositorySearchParams } from "../model/search-params";
import { RepositoryCard } from "./repository-card";

type RepositoryListProps = {
  repositories: RepositoryListItem[];
  search: RepositorySearchParams;
  totalCount: number;
};

export function RepositoryList({
  repositories,
  search,
  totalCount,
}: RepositoryListProps) {
  return (
    <section aria-labelledby="search-results-heading" className="results">
      <div className="section-heading">
        <h2 id="search-results-heading" tabIndex={-1}>
          検索結果
        </h2>
        <p>{totalCount.toLocaleString()} 件</p>
      </div>
      <ul className="repository-list">
        {repositories.map((repository) => (
          <li key={repository.id}>
            <RepositoryCard repository={repository} search={search} />
          </li>
        ))}
      </ul>
    </section>
  );
}
