import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";

/**
 * A single item in the homepage's second editorial row (3-col grid with
 * vertical `.editorial-divider` rules between columns, matching the
 * Stitch Homepage reference). `showImage` picks the text/image/text
 * rhythm the reference shows — only one of the three columns carries a
 * photo, the other two lean on the excerpt instead. All three still show
 * real article data; this only controls which real field is displayed.
 */
export function SecondRowStory({ article, showImage = false }: { article: Article; showImage?: boolean }) {
  return (
    <article className="card-hover group editorial-divider pr-0 pb-8 last:border-0 lg:pr-6 lg:pb-0">
      {showImage && (
        <Link href={`/news/${article.slug}`} className="relative mb-4 block aspect-[3/2] w-full overflow-hidden rounded-lg bg-surface-container">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>
      )}

      <h3 className="font-serif-hi mb-3 text-xl leading-tight font-bold text-on-surface transition-colors group-hover:text-primary-container sm:text-2xl">
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h3>

      {!showImage && article.excerpt && (
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">{article.excerpt}</p>
      )}

      <span className="text-xs font-bold tracking-wider text-secondary uppercase">{article.category.name}</span>
    </article>
  );
}
