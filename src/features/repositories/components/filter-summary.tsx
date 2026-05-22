import Link from "next/link";

import type { RepositorySearchParams } from "../model/search-params";
import { createSearchFilterChips } from "../model/search-state";
import { createRepositorySearchUrl } from "../model/search-url";

type FilterSummaryProps = {
  search: RepositorySearchParams;
};

/**
 * 現在の検索条件をチップとして表示し、URL を正本にしたまま解除操作を提供する。
 */
export function FilterSummary({ search }: FilterSummaryProps) {
  const chips = createSearchFilterChips(search);

  if (chips.length === 0) {
    return null;
  }

  return (
    <section aria-label="適用中の検索条件" className="filter-summary">
      <div className="filter-summary__chips">
        {chips.map((chip) => (
          <span className="filter-chip" key={chip.key}>
            <span>{chip.label}</span>
            <Link
              aria-label={`${chip.label} を解除`}
              href={createRepositorySearchUrl(chip.removeSearch)}
            >
              解除
            </Link>
          </span>
        ))}
      </div>
      <Link className="filter-summary__reset" href="/">
        すべてリセット
      </Link>
    </section>
  );
}
