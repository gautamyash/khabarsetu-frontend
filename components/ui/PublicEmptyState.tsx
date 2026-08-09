import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Empty-state block for the public Stitch-matched pages (homepage, article,
 * category, search) — a primary top edge and a primary-tinted icon circle,
 * built from the same Stitch reference palette (primary/on-surface/
 * surface-container-low) every other public component now uses. Kept
 * separate from components/ui/EmptyState.tsx, which still uses the legacy
 * ink-* / brand-* scale and remains shared with the admin analytics pages
 * (components/analytics/AnalyticsDashboard.tsx, admin/analytics/articles/
 * [id]/page.tsx) — restyling that shared component in place would have
 * changed the admin panel's appearance, which is out of scope. Same props
 * as the original so every public call site only needed its import swapped.
 */
export function PublicEmptyState({
  icon: Icon,
  title,
  message,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const isLarge = size === "lg";
  return (
    <div
      className={cn(
        "flex flex-col items-center border-t-4 border-primary bg-surface-container-low px-8 text-center",
        isLarge ? "py-16" : "py-12",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-primary-container/10",
          isLarge ? "h-16 w-16" : "h-12 w-12"
        )}
      >
        <Icon className={cn(isLarge ? "h-8 w-8" : "h-6 w-6", "text-primary")} aria-hidden />
      </span>
      <p className={cn("font-serif-hi mt-4 font-extrabold text-on-surface", isLarge ? "text-2xl" : "text-lg")}>
        {title}
      </p>
      {message && <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">{message}</p>}
    </div>
  );
}
