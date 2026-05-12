type SearchFormProps = {
  q?: string;
};

export function SearchForm({ q = "" }: SearchFormProps) {
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
          name="q"
          placeholder="nextjs, react, testing..."
          type="search"
        />
      </div>
      <button className="button button--primary" type="submit">
        検索
      </button>
    </form>
  );
}

