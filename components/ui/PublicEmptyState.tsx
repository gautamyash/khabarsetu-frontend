import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Empty-state block for the public Stitch-matched pages (homepage, article,
 * category, search) — a compact, centered, bordered card (not a full-bleed
 * colored rectangle) with a maroon accent rule and a primary-tinted icon
 * circle, built from the same Stitch reference palette (primary/on-surface/
 * surface-container-low) every other public component now uses. Sized to
 * its content rather than a fixed large block, so "no articles yet" reads
 * as an intentional small notice, not an oversized empty panel. Kept
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
        "mx-auto flex max-w-md flex-col items-center rounded-xl border border-outline-variant/60 bg-surface-container-low px-6 text-center",
        isLarge ? "py-10" : "py-8",
        className
      )}
    >
      <span className="mb-4 block h-[3px] w-9 bg-primary" aria-hidden />
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10",
          isLarge ? "h-14 w-14" : "h-11 w-11"
        )}
      >
        <Icon className={cn(isLarge ? "h-7 w-7" : "h-5 w-5", "text-primary")} aria-hidden />
      </span>
      <p className={cn("font-serif-hi mt-4 font-black text-on-surface", isLarge ? "text-xl" : "text-base")}>
        {title}
      </p>
      {message && <p className="mt-2 max-w-xs text-sm leading-relaxed text-on-surface-variant">{message}</p>}
    </div>
  );
}
