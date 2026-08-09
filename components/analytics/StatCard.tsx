import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Percent change vs a comparison period. null/undefined = no comparison
   * available (never shown as a fabricated 0%) — see backend
   * compute_growth() for when this happens. */
  changePct?: number | null;
  changeLabel?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, icon: Icon, changePct, changeLabel, highlight }: StatCardProps) {
  const hasChange = typeof changePct === "number";
  const isUp = hasChange && changePct! > 0;
  const isDown = hasChange && changePct! < 0;

  return (
    <div className={cn("border border-ink-200 bg-white p-4", highlight && "border-t-4 border-t-brand-700")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide text-ink-500 uppercase">{label}</span>
        <Icon className="h-4 w-4 text-ink-300" aria-hidden />
      </div>
      <p className="font-serif-hi mt-2 text-2xl font-extrabold text-ink-900">{value}</p>

      {hasChange && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-bold",
            isUp ? "text-emerald-600" : isDown ? "text-brand-700" : "text-ink-400"
          )}
        >
          {isUp && <TrendingUp className="h-3.5 w-3.5" aria-hidden />}
          {isDown && <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
          {!isUp && !isDown && <Minus className="h-3.5 w-3.5" aria-hidden />}
          {Math.abs(changePct!).toFixed(1)}%{changeLabel ? ` ${changeLabel}` : ""}
        </p>
      )}
      {!hasChange && (
        <p className="mt-1 text-xs text-ink-400">{changeLabel ?? "तुलना उपलब्ध नहीं"}</p>
      )}
    </div>
  );
}
