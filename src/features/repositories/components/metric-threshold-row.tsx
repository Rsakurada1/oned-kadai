"use client";

import { useId, useState } from "react";

type MetricThresholdRowProps = {
  defaultValue: number;
  enabled: boolean;
  label: string;
  name: string;
};

export function MetricThresholdRow({
  defaultValue,
  enabled,
  label,
  name,
}: MetricThresholdRowProps) {
  const inputId = useId();
  const checkboxId = useId();
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="threshold-row">
      <label className="threshold-row__checkbox" htmlFor={checkboxId}>
        <input
          checked={isEnabled}
          id={checkboxId}
          onChange={(event) => setIsEnabled(event.target.checked)}
          type="checkbox"
        />
        <span>{label} 条件を使う</span>
      </label>
      <label className="threshold-row__input" htmlFor={inputId}>
        <span className="threshold-row__metric">{label}</span>
        <input
          aria-label={`${label} 下限`}
          className="text-input threshold-row__number"
          defaultValue={defaultValue}
          disabled={!isEnabled}
          id={inputId}
          min={0}
          name={isEnabled ? name : undefined}
          step={1}
          type="number"
        />
        <span className="threshold-row__suffix">以上</span>
      </label>
    </div>
  );
}
