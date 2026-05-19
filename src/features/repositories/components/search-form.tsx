import type {
  RepositorySearchOrder,
  RepositorySearchSort,
} from "../model/search-params";
import { SearchFilterCombo } from "./search-filter-combo";

type SearchFormProps = {
  q?: string;
  language?: string;
  topic?: string;
  minStars?: number | null;
  sort?: RepositorySearchSort;
  order?: RepositorySearchOrder;
};

const LANGUAGE_SUGGESTIONS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Ruby",
  "PHP",
  "C#",
  "C++",
  "Swift",
  "Kotlin",
  "Jupyter Notebook",
];

const TOPIC_SUGGESTIONS = [
  "nextjs",
  "react",
  "typescript",
  "frontend",
  "testing",
  "cli",
  "api",
  "machine-learning",
  "devtools",
];

/**
 * 検索状態を URL クエリに残すため、JavaScript 依存の submit 処理を持たない native form にする。
 */
export function SearchForm({
  q = "",
  language = "",
  topic = "",
  minStars = null,
  sort = "best-match",
  order = "desc",
}: SearchFormProps) {
  return (
    <form action="/" className="search-panel" method="get" role="search">
      <div className="search-panel__primary">
        <div className="search-form__field">
          <label className="form-label" htmlFor="repository-search">
            検索キーワード
          </label>
          <input
            aria-describedby="repository-search-help"
            autoComplete="off"
            className="text-input"
            defaultValue={q}
            id="repository-search"
            name="q"
            placeholder="nextjs, react, testing..."
            type="search"
          />
          <p className="field-help" id="repository-search-help">
            リポジトリ名、説明、関連語で検索できます。
          </p>
        </div>
        <button className="button button--primary" type="submit">
          検索
        </button>
      </div>

      <details className="filter-details" open>
        <summary>詳細フィルター</summary>
        <div className="search-form">
          <SearchFilterCombo
            label="Language"
            name="language"
            options={LANGUAGE_SUGGESTIONS}
            placeholder="自由入力"
            value={language}
          />
          <SearchFilterCombo
            label="Topic"
            name="topic"
            options={TOPIC_SUGGESTIONS}
            placeholder="自由入力"
            value={topic}
          />
          <div className="search-form__field">
            <label className="form-label" htmlFor="repository-min-stars">
              Star 下限
            </label>
            <input
              className="text-input"
              defaultValue={minStars ?? ""}
              id="repository-min-stars"
              min={0}
              name="minStars"
              placeholder="100"
              type="number"
            />
          </div>
          <div className="search-form__field">
            <label className="form-label" htmlFor="repository-sort">
              並び替え
            </label>
            <select
              className="text-input"
              defaultValue={sort}
              id="repository-sort"
              name="sort"
            >
              <option value="best-match">Best match</option>
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Updated</option>
            </select>
          </div>
          <div className="search-form__field">
            <label className="form-label" htmlFor="repository-order">
              順序
            </label>
            <select
              className="text-input"
              defaultValue={order}
              id="repository-order"
              name="order"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>
        </div>
      </details>
    </form>
  );
}
