import Link from "next/link";
import type { Article } from "@/types/news";
import { UI_TEXT } from "@/lib/constants";

/**
 * Two-tone breaking ticker matching the Stitch Homepage reference: a solid
 * dark "ताज़ा खबर" chip with a pulsing dot, followed by a maroon
 * (primary-container) strip with continuously scrolling real headlines.
 * The scroll mechanism itself (duplicated article list + animate-marquee)
 * is unchanged from before — only the colors/shape were restyled.
 */
export function BreakingNewsBar({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="flex h-11 w-full items-center overflow-hidden bg-primary-container sm:h-12">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center sm:px-6 lg:px-8">
        <span className="flex h-full shrink-0 items-center gap-2 bg-on-surface px-4 text-xs font-bold whitespace-nowrap text-surface-container-lowest uppercase sm:text-sm">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
          </span>
          {UI_TEXT.breakingNews}
        </span>

        <div className="marquee-mask h-full flex-1 overflow-hidden">
          <ul className="animate-marquee flex h-full shrink-0 items-center gap-10 px-4 whitespace-nowrap">
            {[...articles, ...articles].map((article, i) => (
              <li key={`${article.id}-${i}`}>
                <Link
                  href={`/news/${article.slug}`}
                  className="text-sm font-medium text-white transition-opacity hover:opacity-80"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
