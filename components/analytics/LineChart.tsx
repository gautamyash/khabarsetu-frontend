/**
 * A small, dependency-free SVG line/area chart — the spec asked for the
 * existing charting solution to be reused if one exists, and for a
 * lightweight approach (not a new dependency) if none does. This codebase
 * has no chart library (see frontend/package.json), so this is a plain SVG
 * component instead of adding recharts/chart.js/etc.
 *
 * Tooltips are native <title> elements on each point (zero extra JS state,
 * fully accessible, works with keyboard/touch/mouse) rather than a custom
 * hover-tracking overlay. The x-axis shows first/middle/last labels only,
 * to stay legible at any width without overlapping text.
 */

interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
  ariaLabel: string;
}

const VIEWBOX_WIDTH = 600;

export function LineChart({ data, color = "#b91c1c", height = 220, formatValue, ariaLabel }: LineChartProps) {
  const format = formatValue ?? ((value: number) => value.toLocaleString("hi-IN"));

  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const paddingTop = 12;
  const paddingBottom = 8;
  const chartHeight = height - paddingTop - paddingBottom;
  const stepX = data.length > 1 ? VIEWBOX_WIDTH / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: data.length > 1 ? i * stepX : VIEWBOX_WIDTH / 2,
    y: paddingTop + chartHeight - (d.value / max) * chartHeight,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const floorY = height - paddingBottom;
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${floorY} L${points[0].x.toFixed(1)},${floorY} Z`;

  const firstLabel = data[0]?.label;
  const lastLabel = data.length > 1 ? data[data.length - 1]?.label : null;
  const midLabel = data.length > 2 ? data[Math.floor(data.length / 2)]?.label : null;

  return (
    <div role="img" aria-label={ariaLabel} className="w-full">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="analyticsLineChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0}
            x2={VIEWBOX_WIDTH}
            y1={paddingTop + chartHeight * f}
            y2={paddingTop + chartHeight * f}
            stroke="currentColor"
            className="text-ink-100"
            strokeWidth={1}
          />
        ))}

        <path d={areaPath} fill="url(#analyticsLineChartFill)" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color}>
            <title>{`${p.label}: ${format(p.value)}`}</title>
          </circle>
        ))}
      </svg>

      <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-ink-400">
        <span>{firstLabel}</span>
        {midLabel && <span>{midLabel}</span>}
        {lastLabel && <span>{lastLabel}</span>}
      </div>
    </div>
  );
}
