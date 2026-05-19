"use client";

import { useMemo, useState } from "react";

type SearchFilterComboProps = {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  value?: string;
};

export function SearchFilterCombo({
  label,
  name,
  options,
  placeholder,
  value = "",
}: SearchFilterComboProps) {
  const normalizedValue = value.trim();
  const initialPreset = options.includes(normalizedValue)
    ? normalizedValue
    : "";
  const initialCustom = initialPreset ? "" : normalizedValue;
  const [preset, setPreset] = useState(initialPreset);
  const [custom, setCustom] = useState(initialCustom);
  const submittedValue = useMemo(
    () => custom.trim() || preset,
    [custom, preset],
  );

  return (
    <fieldset className="search-form__field search-form__field--combo">
      <legend className="form-label">{label}</legend>
      <input name={name} type="hidden" value={submittedValue} />
      <div className="search-form__choice-row">
        <select
          aria-label={`${label} 候補`}
          className="text-input"
          onChange={(event) => {
            setPreset(event.target.value);
            setCustom("");
          }}
          value={preset}
        >
          <option value="">指定なし</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          aria-label={`${label} 自由入力`}
          className="text-input"
          onChange={(event) => setCustom(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={custom}
        />
      </div>
    </fieldset>
  );
}
