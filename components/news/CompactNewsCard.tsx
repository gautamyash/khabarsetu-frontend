import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeHindi } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Dense horizontal row — used for "छोटी खबर" hero-sidebar stories, "और
 * खबरें" lists, and (with `showImage={false}`) the text-only "सबसे ज़्यादा
 * पढ़ी गई" ranked list. Sharp-cornered thumbnail, no card box — rows are
 * separated by the parent's divide-y, not by borders/shadows of their own. */
export function CompactNewsCard({
  article,
  index,
  showImage = true,
  className,
}: {
  article: Article;
  index?: number;
  showImage?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("card-hover group flex items-start gap-3 py-3", className)}>
      {typeof index === "number" && (
        <span className="font-serif-hi w-7 shrink-0 text-2xl leading-none font-extrabold text-brand-700/30 tabular-nums group-hover:text-brand-700/50">
          {String(index).padStart(2, "0")}
        </span>
      )}

      {showImage && (
        <Link
          href={`/news/${article.slug}`}
          className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-md bg-ink-100 sm:h-[4.5rem] sm:w-28"
        >
          <Image src={article.featuredImage} alt={article.title} fill sizes="120px" className="object-cover" />
        </Link>
      )}

      <div className="min-w-0">
        <h4 className="line-clamp-2 text-[15px] leading-snug font-bold text-ink-900 group-hover:text-brand-700">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h4>
        <p className="mt-1.5 text-xs font-bold tracking-wide text-ink-500">
          <span className="text-brand-700 uppercase">{article.category.name}</span>
          <span className="mx-1 text-ink-300">·</span>
          {formatRelativeHindi(article.publishedAt)}
        </p>
      </div>
    </article>
  );
}
