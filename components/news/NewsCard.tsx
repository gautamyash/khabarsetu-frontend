import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeHindi } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Category-page 2-column editorial grid item — matches the Stitch
 * `category` reference: a fixed-height image, a headline, a short
 * line-clamped excerpt, and a bordered time stamp. The left-hand item in
 * the pair additionally gets a vertical divider on desktop (applied by the
 * parent grid via `md:border-r`, not here). Only used by the category page
 * (app/(public)/category/[slug]/page.tsx).
 */
export function NewsCard({ article, className }: { article: Article; className?: string }) {
  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={`/news/${article.slug}`} className="relative mb-3 block h-[200px] w-full overflow-hidden bg-surface-container">
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>

      <h3 className="font-serif-hi mb-2 text-xl leading-tight font-bold text-on-surface transition-colors group-hover:text-primary">
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h3>

      {article.excerpt && (
        <p className="mb-2 line-clamp-2 text-sm text-on-surface-variant">{article.excerpt}</p>
      )}

      <div className="mt-auto w-fit border-t border-outline-variant pt-2 text-xs text-secondary">
        {formatRelativeHindi(article.publishedAt)}
      </div>
    </article>
  );
}
