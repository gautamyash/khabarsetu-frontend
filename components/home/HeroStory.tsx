import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeHindi } from "@/lib/utils";

/**
 * The homepage lead story — image on top, headline + lead paragraph set
 * below in dark text, matching the Stitch Homepage reference's left hero
 * column (no dark-gradient image overlay, no badge pinned on the image).
 * On mobile, a category eyebrow appears above the headline instead of the
 * full meta line, matching 25_mobile_1's hero block.
 */
export function HeroStory({ article, priority = false }: { article: Article; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] w-full overflow-hidden bg-surface-container">
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </Link>

      <span className="mt-4 block text-xs font-bold tracking-wider text-primary uppercase sm:hidden">
        {article.category.name}
      </span>

      <h1 className="font-serif-hi mt-3 text-[32px] leading-[1.25] font-extrabold text-on-surface transition-colors group-hover:text-primary-container sm:mt-4 sm:text-[40px]">
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h1>

      {article.excerpt && (
        <p className="mt-3 max-w-2xl text-[20px] leading-[1.6] font-medium text-on-surface-variant sm:mt-4 sm:text-[22px]">
          {article.excerpt}
        </p>
      )}

      <div className="mt-3 hidden items-center gap-3 text-xs font-medium tracking-wider text-secondary uppercase sm:flex sm:mt-4">
        <span>{article.category.name}</span>
        <span className="h-1 w-1 rounded-full bg-outline" aria-hidden />
        <span>{formatRelativeHindi(article.publishedAt)}</span>
      </div>
    </article>
  );
}
