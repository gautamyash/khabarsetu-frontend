"use client";

import type { DateRangePreset } from "@/types/analytics";

/** Spec section 2's date range picker: आज/कल/पिछले 7 दिन/पिछले 30 दिन/
 * पिछले 90 दिन/इस महीने/पिछला महीना/इस साल/कस्टम तारीख. Fully controlled —
 * the parent dashboard owns the actual filter state and refetches on
 * change, so every chart/table on the page reacts to the same selection. */

const PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "आज" },
  { value: "yesterday", label: "कल" },
  { value: "last_7_days", label: "पिछले 7 दिन" },
  { value: "last_30_days", label: "पिछले 30 दिन" },
  { value: "last_90_days", label: "पिछले 90 दिन" },
  { value: "this_month", label: "इस महीने" },
  { value: "last_month", label: "पिछला महीना" },
  { value: "this_year", label: "इस साल" },
  { value: "custom", label: "कस्टम तारीख" },
];

interface DateRangeFilterProps {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  onChange: (next: { preset: DateRangePreset; startDate: string; endDate: string }) => void;
}

export function DateRangeFilter({ preset, startDate, endDate, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={preset}
        onChange={(event) => onChange({ preset: event.target.value as DateRangePreset, startDate, endDate })}
        className="border border-ink-300 bg-white px-3 py-2 text-sm font-semibold text-ink-800 focus:border-brand-700 focus:outline-none"
        aria-label="समय सीमा"
      >
        {PRESET_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {preset === "custom" && (
        <>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => onChange({ preset, startDate: event.target.value, endDate })}
            className="border border-ink-300 bg-white px-3 py-2 text-sm text-ink-800 focus:border-brand-700 focus:outline-none"
            aria-label="शुरुआत की तारीख"
          />
          <span className="text-sm text-ink-400">से</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => onChange({ preset, startDate, endDate: event.target.value })}
            className="border border-ink-300 bg-white px-3 py-2 text-sm text-ink-800 focus:border-brand-700 focus:outline-none"
            aria-label="अंतिम तारीख"
          />
        </>
      )}
    </div>
  );
}
