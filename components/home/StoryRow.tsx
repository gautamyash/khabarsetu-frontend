import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeHindi } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Text-first compact story row — used for the hero sidebar ("मुख्य खबरें"),
 * "और खबरें", category-section supporting lists, and (with `index` set)
 * the numbered "सर्वाधिक पठित" trending list from 25_mobile_1. No card
 * box; rows are separated by a bottom border, matching the Stitch
 * reference's plain bordered list items.
 */
export function StoryRow({
  article,
  index,
  showImage = false,
  showCategory = true,
  showTime = true,
  className,
}: {
  article: Article;
  index?: number;
  showImage?: boolean;
  /** The hero sidebar shows category only, no timestamp. */
  showCategory?: boolean;
  /** The numbered trending rows show neither category nor timestamp — just
   * the headline, matching 25_mobile_1 exactly. */
  showTime?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("card-hover group flex items-start gap-4 border-b border-outline-variant py-4 last:border-0", className)}>
      {typeof index === "number" && (
        <span className="font-serif-hi w-10 shrink-0 text-[34px] leading-none font-black tabular-nums text-primary/25 transition-colors group-hover:text-primary/45 sm:text-4xl">
          {String(index).padStart(2, "0")}
        </span>
      )}

      <div className="min-w-0 flex-1">
        {showCategory && (
          <span className="mb-1 block text-xs font-bold text-primary uppercase">{article.category.name}</span>
        )}
        <h3 className="font-serif-hi line-clamp-3 text-base leading-snug font-bold text-on-surface transition-colors group-hover:text-primary-container">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
        {showTime && <span className="mt-1.5 block text-xs text-secondary">{formatRelativeHindi(article.publishedAt)}</span>}
      </div>

      {showImage && (
        <Link
          href={`/news/${article.slug}`}
          className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-md bg-surface-container"
        >
          <Image src={article.featuredImage} alt={article.title} fill sizes="96px" className="object-cover" />
        </Link>
      )}
    </article>
  );
}
