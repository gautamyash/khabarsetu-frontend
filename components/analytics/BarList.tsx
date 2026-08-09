/** Horizontal bar-list — the standard "label / value / share" breakdown
 * shape used for devices, browsers, OS, traffic sources, and categories.
 * Bar width is proportional to the largest value in the list (not to
 * 100%), so a dominant item doesn't make everything else invisible. */

interface BarListItem {
  label: string;
  value: number;
  pct?: number;
}

interface BarListProps {
  items: BarListItem[];
  color?: string;
  formatValue?: (value: number) => string;
}

export function BarList({ items, color = "#b91c1c", formatValue }: BarListProps) {
  const format = formatValue ?? ((value: number) => value.toLocaleString("hi-IN"));
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate font-semibold text-ink-800">{item.label}</span>
            <span className="shrink-0 text-xs font-bold text-ink-500">
              {format(item.value)}
              {typeof item.pct === "number" && <span className="ml-1 font-normal text-ink-400">({item.pct}%)</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
