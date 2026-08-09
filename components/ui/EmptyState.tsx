import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared empty-state block used across the homepage, category, and search
 * pages — a crimson top edge and a brand-tinted icon circle give it real
 * color presence instead of a plain gray dashed box, so "there's nothing
 * here yet" still reads as an intentional, on-brand part of the page.
 */
export function EmptyState({
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
        "flex flex-col items-center border-t-4 border-brand-700 bg-ink-50/70 px-8 text-center",
        isLarge ? "py-16" : "py-12",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-brand-50",
          isLarge ? "h-16 w-16" : "h-12 w-12"
        )}
      >
        <Icon className={cn(isLarge ? "h-8 w-8" : "h-6 w-6", "text-brand-700")} aria-hidden />
      </span>
      <p className={cn("font-serif-hi mt-4 font-extrabold text-ink-900", isLarge ? "text-2xl" : "text-lg")}>
        {title}
      </p>
      {message && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-600">{message}</p>}
    </div>
  );
}
