import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Homepage-only editorial section header — a short maroon kicker rule +
 * small uppercase label above a bold serif heading, sitting on a heavier
 * bottom rule. Deliberately more "front page section flag" than a plain
 * heading: the kicker line names what kind of section this is (top
 * stories / most-read / etc.) independent of the literal title text, so
 * "और खबरें" and "सबसे ज़्यादा पढ़ी गई" read as distinct editorial
 * modules rather than two identical-looking headings. Kept separate from
 * components/ui/SectionHeading (the red "flag" banner), which article/
 * category/search pages still use and which is out of scope for this
 * pass.
 */
export function HomeSectionHeading({
  title,
  kicker,
  href,
  linkLabel,
  className,
}: {
  title: string;
  /** Small uppercase label above the heading, e.g. "प्रमुख कवरेज". Purely
   * decorative page chrome — optional, defaults to none so existing call
   * sites are unaffected unless they opt in. */
  kicker?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      {kicker && (
        <div className="mb-2 flex items-center gap-2.5">
          <span className="h-[3px] w-9 shrink-0 bg-primary" aria-hidden />
          <span className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">{kicker}</span>
        </div>
      )}
      <div className="flex items-end justify-between gap-3 border-b-2 border-on-surface pb-3">
        <h2 className="font-serif-hi text-2xl leading-tight font-black text-on-surface sm:text-[28px]">{title}</h2>
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
    </div>
  );
}
