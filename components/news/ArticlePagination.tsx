import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Builds the compact page-number sequence Stitch's pagination shows:
 * always the first and last page, the current page and its immediate
 * neighbors, and a single "…" gap marker wherever pages were skipped —
 * e.g. [1, "…", 4, 5, 6, "…", 15]. */
function buildPageList(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("gap");
    result.push(p);
    prev = p;
  }
  return result;
}

/**
 * Numbered pagination matching the Stitch `category`/`Search` references
 * — prev/next buttons with page-number buttons in between (current page
 * filled solid, others outlined), rather than the plain "पिछला / पृष्ठ X
 * / अगला" bar the admin panel's shared Pagination component uses. Kept as
 * its own page-specific component (not a modification of
 * components/admin/Pagination.tsx, which the admin news/media list pages
 * still use) so the admin panel is completely unaffected. Used by both
 * the category and search pages, since both need the identical treatment.
 */
export function ArticlePagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const pageList = buildPageList(page, totalPages);

  const navButtonClass =
    "flex items-center gap-1 rounded-md border border-outline px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high";

  return (
    <nav aria-label="पेजिनेशन" className="flex flex-wrap items-center justify-center gap-2">
      {hasPrev ? (
        <Link href={buildHref(page - 1)} className={navButtonClass}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          पिछला
        </Link>
      ) : (
        <span className={cn(navButtonClass, "cursor-not-allowed opacity-50")}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          पिछला
        </span>
      )}

      <div className="hidden items-center gap-1 sm:flex">
        {pageList.map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="flex h-10 w-10 items-center justify-center text-on-surface-variant">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold transition-colors",
                item === page
                  ? "bg-primary text-on-primary"
                  : "border border-transparent text-on-surface hover:bg-surface-container-high"
              )}
            >
              {item}
            </Link>
          )
        )}
      </div>

      {hasNext ? (
        <Link href={buildHref(page + 1)} className={navButtonClass}>
          अगला
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(navButtonClass, "cursor-not-allowed opacity-50")}>
          अगला
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
