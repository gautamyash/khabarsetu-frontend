import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeHindi } from "@/lib/utils";

/**
 * "ताज़ा खबरें" list row on the category page — a small thumbnail beside
 * a headline, a one-line excerpt, and a timestamp, matching the Stitch
 * `category` reference's list section exactly. Page-specific: no existing
 * shared card matched this exact thumbnail+excerpt+time combination
 * without also showing a category label (which this row deliberately
 * omits, since every article here already belongs to the current
 * category page).
 */
export function CategoryListRow({ article }: { article: Article }) {
  return (
    <article className="card-hover group flex gap-4 border-b border-outline-variant pb-4 last:border-0">
      <Link href={`/news/${article.slug}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-surface-container">
        <Image src={article.featuredImage} alt={article.title} fill sizes="128px" className="object-cover transition-transform duration-300 group-hover:scale-110" />
      </Link>
      <div className="flex flex-col justify-center">
        <h4 className="font-serif-hi mb-1 text-base font-bold text-on-surface transition-colors group-hover:text-primary">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h4>
        {article.excerpt && <p className="line-clamp-1 text-sm text-on-surface-variant">{article.excerpt}</p>}
        <span className="mt-1 text-xs text-secondary">{formatRelativeHindi(article.publishedAt)}</span>
      </div>
    </article>
  );
}
