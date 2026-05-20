import {
  CLOUD_FILTERS,
  FRAMEWORK_FILTERS,
  RECENTLY_UPDATED_DAYS,
} from "./search-filters";
import type {
  ForkThreshold,
  StarThreshold,
} from "./search-params";

type BuildRepositorySearchQueryInput = {
  q: string;
  languages: string[];
  frameworks: string[];
  clouds: string[];
  stars: StarThreshold | null;
  forks: ForkThreshold | null;
  lowIssues: boolean;
  recentlyUpdated: boolean;
  referenceDate?: Date;
};

/**
 * UI の filter 状態を GitHub Search API の q 文字列へ変換します。
 * framework/cloud は GitHub API の構造化条件ではないため、keyword と topic の OR group として扱います。
 */
export function buildRepositorySearchQuery({
  q,
  languages,
  frameworks,
  clouds,
  stars,
  forks,
  lowIssues,
  recentlyUpdated,
  referenceDate = new Date(),
}: BuildRepositorySearchQueryInput): string {
  const parts = [q.trim()].filter(Boolean);

  const languageQuery = buildOrGroup(
    languages.map((language) => `language:${formatQualifierValue(language)}`),
  );
  if (languageQuery) {
    parts.push(languageQuery);
  }

  const frameworkQuery = buildKeywordFilterQuery(
    frameworks,
    FRAMEWORK_FILTERS,
  );
  if (frameworkQuery) {
    parts.push(frameworkQuery);
  }

  const cloudQuery = buildKeywordFilterQuery(clouds, CLOUD_FILTERS);
  if (cloudQuery) {
    parts.push(cloudQuery);
  }

  if (stars !== null) {
    parts.push(`stars:>=${stars}`);
  }

  if (forks !== null) {
    parts.push(`forks:>=${forks}`);
  }

  if (recentlyUpdated) {
    parts.push(`pushed:>${formatDate(subtractDays(referenceDate, RECENTLY_UPDATED_DAYS))}`);
  }

  // lowIssues は REST Search に open issue 数 qualifier がないため、取得ページの後処理で絞ります。
  // それ単独で検索された場合だけ、API に渡せる最小の qualifier を補います。
  if (lowIssues && parts.length === 0) {
    parts.push("stars:>=0");
  }

  return parts.join(" ");
}

function buildKeywordFilterQuery(
  selectedValues: string[],
  filters: readonly { value: string; queryTerms: readonly string[] }[],
): string {
  const selected = new Set(selectedValues);
  const terms = filters
    .filter((filter) => selected.has(filter.value))
    .flatMap((filter) => filter.queryTerms);

  return buildOrGroup(terms);
}

function buildOrGroup(terms: string[]): string {
  const uniqueTerms = Array.from(new Set(terms.filter(Boolean)));

  if (uniqueTerms.length <= 1) {
    return uniqueTerms[0] ?? "";
  }

  return `(${uniqueTerms.join(" OR ")})`;
}

/** 空白を含む qualifier 値は GitHub Search syntax に合わせて quote します。 */
function formatQualifierValue(value: string): string {
  if (!/\s/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}

function subtractDays(value: Date, days: number): Date {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() - days);
  return nextDate;
}

function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
