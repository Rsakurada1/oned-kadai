import Link from "next/link";

import {
  CLOUD_FILTERS,
  FRAMEWORK_FILTERS,
  LANGUAGE_FILTERS,
} from "../model/search-filters";
import type { RepositorySearchParams } from "../model/search-params";
import { MetricThresholdRow } from "./metric-threshold-row";

type SearchFormProps = {
  search: RepositorySearchParams;
};

type CheckboxOption = {
  label: string;
  value: string;
  hint?: string;
};

const LANGUAGE_OPTIONS = LANGUAGE_FILTERS.map((language) => ({
  label: language,
  value: language,
}));

const FRAMEWORK_OPTIONS = FRAMEWORK_FILTERS.map(({ label, value }) => ({
  label,
  value,
}));

const CLOUD_OPTIONS = CLOUD_FILTERS.map(({ label, value }) => ({
  label,
  value,
}));

/**
 * 検索状態は URL query を正本にするため、フォームは GET submit だけで遷移します。
 * checkbox の repeated params は parseSearchParams 側で comma-separated params と同じ形へ正規化します。
 */
export function SearchForm({ search }: SearchFormProps) {
  return (
    <form action="/" className="search-panel" method="get" role="search">
      <div className="search-panel__header">
        <h2>検索条件</h2>
        <Link className="search-panel__reset" href="/">
          リセット
        </Link>
      </div>

      <div className="search-form__field">
        <label className="form-label" htmlFor="repository-search">
          キーワード検索
        </label>
        <input
          aria-describedby="repository-search-help"
          autoComplete="off"
          className="text-input"
          defaultValue={search.q}
          id="repository-search"
          name="q"
          placeholder="リポジトリを検索"
          type="search"
        />
        <p className="field-help" id="repository-search-help">
          ライブラリ名、ツール名、設計キーワードなどを入力できます。
        </p>
      </div>

      <CheckboxGroup
        legend="言語フィルター"
        name="languages"
        options={LANGUAGE_OPTIONS}
        selectedValues={search.languages}
      />

      <CheckboxGroup
        legend="フレームワーク・ライブラリ"
        name="frameworks"
        options={FRAMEWORK_OPTIONS}
        selectedValues={search.frameworks}
      />

      <CheckboxGroup
        legend="クラウド・インフラ"
        name="clouds"
        options={CLOUD_OPTIONS}
        selectedValues={search.clouds}
      />

      <fieldset className="filter-group">
        <legend>こだわり条件</legend>
        <div className="checkbox-grid checkbox-grid--single">
          <MetricThresholdRow
            defaultValue={search.stars ?? 100}
            enabled={search.stars !== null}
            key={`stars-${search.stars ?? "off"}`}
            label="Star"
            name="stars"
          />
          <MetricThresholdRow
            defaultValue={search.forks ?? 100}
            enabled={search.forks !== null}
            key={`forks-${search.forks ?? "off"}`}
            label="Fork"
            name="forks"
          />
          <CheckboxRow
            checked={search.lowIssues}
            hint="取得したページ内で Issue 数 10 以下に絞ります"
            label="Issueが少ない"
            name="lowIssues"
            value="true"
          />
          <CheckboxRow
            checked={search.recentlyUpdated}
            hint="直近30日以内に push されたリポジトリ"
            label="最近更新された"
            name="recentlyUpdated"
            value="true"
          />
        </div>
      </fieldset>

      {search.sort !== "best-match" ? (
        <>
          <input name="sort" type="hidden" value={search.sort} />
          <input name="order" type="hidden" value={search.order} />
        </>
      ) : null}

      <div className="search-panel__actions">
        <button className="button button--primary" type="submit">
          検索
        </button>
      </div>
    </form>
  );
}

function CheckboxGroup({
  legend,
  name,
  options,
  selectedValues,
}: {
  legend: string;
  name: string;
  options: readonly CheckboxOption[];
  selectedValues: readonly string[];
}) {
  const selected = new Set(selectedValues);

  return (
    <fieldset className="filter-group">
      <legend>{legend}</legend>
      <div className="checkbox-grid">
        {options.map((option) => (
          <CheckboxRow
            checked={selected.has(option.value)}
            hint={option.hint}
            key={option.value}
            label={option.label}
            name={name}
            value={option.value}
          />
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxRow({
  checked,
  hint,
  label,
  name,
  value,
}: {
  checked: boolean;
  hint?: string;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="checkbox-row">
      <input defaultChecked={checked} name={name} type="checkbox" value={value} />
      <span>
        <span className="checkbox-row__label">{label}</span>
        {hint ? <span className="checkbox-row__hint">{hint}</span> : null}
      </span>
    </label>
  );
}
