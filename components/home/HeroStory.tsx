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
      <span className="mb-3 block h-1 w-16 bg-primary" aria-hidden />

      <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] w-full overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container">
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

      <h1 className="font-serif-hi mt-3 text-[34px] leading-[1.15] font-black tracking-tight text-on-surface transition-colors group-hover:text-primary-container sm:mt-5 sm:text-[42px] lg:text-[46px]">
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h1>

      {article.excerpt && (
        <p className="mt-3 max-w-2xl text-[19px] leading-[1.6] font-medium text-on-surface-variant sm:mt-4 sm:text-[21px]">
          {article.excerpt}
        </p>
      )}

      <div className="mt-4 hidden items-center gap-3 text-xs font-bold tracking-wider text-secondary uppercase sm:flex">
        <span className="text-primary">{article.category.name}</span>
        <span className="h-1 w-1 rounded-full bg-outline" aria-hidden />
        <span className="font-medium normal-case">{formatRelativeHindi(article.publishedAt)}</span>
      </div>
    </article>
  );
}
