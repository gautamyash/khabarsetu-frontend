import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Homepage-only section heading matching the Stitch references — a bold
 * top rule in primary, a headline-md label, and a bottom hairline rule
 * (border-t-4 border-primary / border-b border-outline-variant), the same
 * treatment 25_mobile_1 uses for "मुख्य समाचार" and "सर्वाधिक पठित". Kept
 * separate from components/ui/SectionHeading (the red "flag" banner),
 * which article/category/search pages still use and which is out of
 * scope for this pass.
 */
export function HomeSectionHeading({
  title,
  href,
  linkLabel,
  className,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex items-center justify-between gap-3 border-t-4 border-primary border-b border-on-surface py-2",
        className
      )}
    >
      <h2 className="font-serif-hi text-xl font-bold text-on-surface sm:text-2xl">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 text-xs font-bold tracking-wide text-primary uppercase transition-colors hover:opacity-80 sm:text-sm"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
