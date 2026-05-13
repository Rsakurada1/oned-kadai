import type {
  RepositorySearchOrder,
  RepositorySearchSort,
} from "../model/search-params";

type SearchFormProps = {
  q?: string;
  language?: string;
  topic?: string;
  minStars?: number | null;
  sort?: RepositorySearchSort;
  order?: RepositorySearchOrder;
};

const QUERY_SUGGESTIONS = [
  "nextjs",
  "react",
  "typescript",
  "testing-library",
  "playwright",
];

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

export function SearchForm({
  q = "",
  language = "",
  topic = "",
  minStars = null,
  sort = "best-match",
  order = "desc",
}: SearchFormProps) {
  return (
    <form action="/" className="search-form" method="get" role="search">
      <div className="search-form__field">
        <label className="form-label" htmlFor="repository-search">
          検索キーワード
        </label>
        <input
          className="text-input"
          defaultValue={q}
          id="repository-search"
          list="repository-search-suggestions"
          name="q"
          placeholder="nextjs, react, testing..."
          type="search"
        />
        <datalist id="repository-search-suggestions">
          {QUERY_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>
      <div className="search-form__field">
        <label className="form-label" htmlFor="repository-language">
          Language
        </label>
        <input
          className="text-input"
          defaultValue={language}
          id="repository-language"
          list="repository-language-suggestions"
          name="language"
          placeholder="TypeScript"
          type="text"
        />
        <datalist id="repository-language-suggestions">
          {LANGUAGE_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>
      <div className="search-form__field">
        <label className="form-label" htmlFor="repository-topic">
          Topic
        </label>
        <input
          className="text-input"
          defaultValue={topic}
          id="repository-topic"
          list="repository-topic-suggestions"
          name="topic"
          placeholder="frontend"
          type="text"
        />
        <datalist id="repository-topic-suggestions">
          {TOPIC_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>
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
      <button className="button button--primary" type="submit">
        検索
      </button>
    </form>
  );
}
