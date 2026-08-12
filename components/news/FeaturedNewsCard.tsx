import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeHindi } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Category-page lead story — matches the Stitch `category` reference's
 * featured-story block: a fixed-height bordered image (with an optional
 * "विशेष रिपोर्ट" badge, shown only when the article is actually flagged
 * `isFeatured` or `isBreaking` — never a fabricated label), a headline
 * below the image, and a plain "time • category" meta line. Only used by
 * the category page (app/(public)/category/[slug]/page.tsx).
 */
export function FeaturedNewsCard({
  article,
  className,
  priority = false,
}: {
  article: Article;
  className?: string;
  /** Only the single true above-the-fold hero on a page should set this —
   * multiple priority images per page hurts LCP rather than helping it. */
  priority?: boolean;
}) {
  const showBadge = article.isFeatured || article.isBreaking;

  return (
    <article className={cn("group", className)}>
      <Link
        href={`/news/${article.slug}`}
        className="relative mb-4 block h-[280px] w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container sm:h-[400px]"
      >
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {showBadge && (
          <span className="absolute top-4 left-4 bg-primary px-3 py-1 text-xs font-bold tracking-wide text-on-primary uppercase">
            विशेष रिपोर्ट
          </span>
        )}
      </Link>

      <h2 className="font-serif-hi mb-3 text-[28px] leading-tight font-extrabold text-on-surface transition-colors group-hover:text-primary sm:text-[36px] sm:leading-[1.25]">
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h2>

      {article.excerpt && (
        <p className="mb-3 line-clamp-3 text-base leading-relaxed text-on-surface-variant">{article.excerpt}</p>
      )}

      <div className="flex items-center gap-2 text-sm text-secondary">
        <span>{formatRelativeHindi(article.publishedAt)}</span>
        <span>•</span>
        <span>{article.category.name}</span>
      </div>
    </article>
  );
}
