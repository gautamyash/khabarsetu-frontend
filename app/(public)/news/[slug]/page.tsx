import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, ChevronRight, RefreshCw, TriangleAlert, User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PublicEmptyState } from "@/components/ui/PublicEmptyState";
import { ArticleShareRow } from "@/components/news/ArticleShareRow";
import { BreakingNewsBar } from "@/components/layout/BreakingNewsBar";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import {
  getArticleBySlug,
  getRelatedArticles,
  getLatestArticles,
  getBreakingArticles,
} from "@/lib/public-articles-api";
import { formatHindiDate, formatRelativeHindi } from "@/lib/utils";
import { SITE_URL } from "@/lib/site-url";
import { UI_TEXT } from "@/lib/constants";
import type { Article } from "@/types/news";

const ERROR_MESSAGE = "खबर उपलब्ध नहीं है।";

/**
 * Basic NewsArticle structured data — only the fields the article API
 * actually provides (headline, description, image, dates, author,
 * mainEntityOfPage). No ratings/reviews/publisher/statistics are invented.
 * `<` is escaped so the JSON can never be interpreted as closing the
 * surrounding <script> tag.
 */
function articleJsonLd(article: Article) {
  const url = `${SITE_URL}/news/${article.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.title,
    image: [article.featuredImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Article detail page — restyled to match the Stitch `article-detail`
 * reference (see stitch_25/article-detail/code.html + screen.png) and its
 * mobile counterpart (25_mobile_2): a centered-masthead header + breaking
 * ticker (both shared with the rest of the site), a breadcrumb, a category
 * chip + headline + bordered meta/share row, a 12-col grid (article with a
 * subtle divider beside a sidebar), and a full-width related-articles row
 * below. All content is still fetched from GET /articles/slug/{slug}
 * (public, published-only for anonymous callers — enforced backend-side)
 * exactly as before; only the markup/styling changed. A missing or
 * non-published slug and a genuinely non-existent slug both resolve to
 * null from the API client and render the same not-found page here, so an
 * anonymous visitor can never tell a draft/archived article apart from one
 * that doesn't exist.
 */
export default async function ArticlePage(props: PageProps<"/news/[slug]">) {
  const { slug } = await props.params;

  let article: Article | null;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    return (
      <Container className="py-16">
        <PublicEmptyState icon={TriangleAlert} size="lg" title={ERROR_MESSAGE} />
      </Container>
    );
  }

  if (!article) notFound();

  // Breaking ticker, related articles, and the most-read sidebar list are
  // secondary, best-effort sections — a failure here shouldn't take down
  // the whole article page.
  let breaking: Article[] = [];
  let related: Article[] = [];
  let latest: Article[] = [];
  try {
    [breaking, related, latest] = await Promise.all([
      getBreakingArticles(),
      getRelatedArticles(article, 3),
      getLatestArticles(6),
    ]);
  } catch {
    breaking = [];
    related = [];
    latest = [];
  }
  const mostRead = latest.filter((a) => a.id !== article.id).slice(0, 3);

  // updated_at and created_at are set by the same DB now() call at insert
  // time, so they're identical until the article is actually edited later
  // — a reliable "was this updated after publishing" signal without
  // depending on published_at (set separately, by application code).
  const wasUpdated =
    article.updatedAt !== undefined &&
    article.createdAt !== undefined &&
    article.updatedAt !== article.createdAt;

  const shareUrl = `${SITE_URL}/news/${article.slug}`;

  return (
    <article>
      <PageViewTracker eventType="article_view" path={`/news/${article.slug}`} articleSlug={article.slug} />
      {/* Public article pages only — never rendered on admin pages. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: articleJsonLd(article) }}
      />

      <BreakingNewsBar articles={breaking} />

      <Container className="py-8">
        {/* Breadcrumb */}
        <nav aria-label="ब्रेडक्रम्ब" className="mb-4 flex items-center gap-2 text-sm font-bold text-on-surface-variant">
          <Link href="/" className="transition-colors hover:text-primary">
            {UI_TEXT.home}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <Link href={`/category/${article.category.slug}`} className="transition-colors hover:text-primary">
            {article.category.name}
          </Link>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          <Link
            href={`/category/${article.category.slug}`}
            className="mb-4 inline-block bg-primary-container px-3 py-1 text-xs font-bold tracking-wider text-white uppercase hover:opacity-90"
          >
            {article.category.name}
          </Link>

          <h1 className="font-serif-hi mb-6 text-[32px] leading-tight font-extrabold text-on-surface sm:text-[40px] sm:leading-[1.25]">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-b border-outline-variant py-3 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden />
              प्रकाशित: {formatHindiDate(article.publishedAt)}
            </span>
            {wasUpdated && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" aria-hidden />
                अपडेट: {formatHindiDate(article.updatedAt as string)}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-bold text-on-surface">
              <User className="h-4 w-4" aria-hidden />
              लेखक: {article.author.name}
            </span>

            <div className="ml-auto">
              <ArticleShareRow url={shareUrl} title={article.title} />
            </div>
          </div>
        </header>

        {/* 12-col grid: article + sidebar */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="article-divider pr-0 md:col-span-8 md:pr-6">
            <div className="relative mb-8 aspect-video w-full overflow-hidden bg-surface-container-highest">
              <Image src={article.featuredImage} alt={article.title} fill priority className="object-cover" />
            </div>

            {article.excerpt && (
              <p className="mb-6 border-l-4 border-primary pl-4 text-[20px] leading-[1.6] font-medium text-on-surface md:border-l-0 md:pl-0">
                {article.excerpt}
              </p>
            )}

            {/* Article content is HTML produced by the admin TipTap editor
                (ArticleEditor.tsx calls editor.getHTML()) — only ADMIN/EDITOR
                users can create or edit it (require_editor_or_admin), so this
                is trusted, site-authored markup, not arbitrary public input.
                Styled by .article-content (globals.css), a page-specific
                ruleset kept separate from .tiptap-content (the admin
                editor's own preview styling) so the admin panel is
                unaffected. */}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content ?? "" }} />

            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-outline-variant pt-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="cursor-pointer bg-surface-container px-3 py-1 text-xs font-bold tracking-wide text-on-surface-variant uppercase hover:bg-surface-container-highest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8 md:col-span-4">
            <div className="border-t-4 border-primary-container bg-surface-container-low p-6">
              <h3 className="font-serif-hi mb-4 text-xl font-bold text-on-surface">इस खबर के बारे में</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                यह खबर {article.category.name} डेस्क द्वारा तैयार की गई है और {article.author.name} द्वारा रिपोर्ट
                की गई है। प्रकाशित: {formatHindiDate(article.publishedAt)}।
              </p>
            </div>

            {mostRead.length > 0 && (
              <div>
                <h3 className="mb-4 border-b border-on-surface pb-2 text-xl font-bold text-on-surface">
                  सबसे ज्यादा पढ़ी गई
                </h3>
                <ul className="mt-4 space-y-6">
                  {mostRead.map((item, i) => (
                    <li key={item.id} className="group flex gap-4">
                      <Link href={`/news/${item.slug}`} className="contents">
                        <span className="font-serif-hi text-[40px] leading-none font-bold text-secondary-container transition-colors group-hover:text-primary-container">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h4 className="mb-1 line-clamp-2 text-base leading-tight font-bold text-on-surface transition-colors group-hover:text-primary-container">
                            {item.title}
                          </h4>
                          <span className="text-xs text-on-surface-variant">
                            {item.category.name} • {formatRelativeHindi(item.publishedAt)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Related news — full-width, below the main grid */}
        {related.length > 0 && (
          <section className="mt-16 border-t-2 border-on-surface pt-8">
            <h2 className="font-serif-hi mb-6 flex items-center gap-2 text-2xl font-bold text-on-surface">
              <span className="h-4 w-4 shrink-0 bg-primary-container" aria-hidden />
              संबंधित खबरें
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {related.map((item, i) => (
                <article key={item.id} className={i > 0 ? "group md:border-l md:border-outline-variant md:pl-6" : "group"}>
                  <Link href={`/news/${item.slug}`} className="relative mb-3 block aspect-[3/2] overflow-hidden bg-surface-container">
                    <Image
                      src={item.featuredImage}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </Link>
                  <span className="mb-2 block text-xs font-bold tracking-wider text-primary-container uppercase">
                    {item.category.name}
                  </span>
                  <h3 className="font-serif-hi text-xl leading-tight text-on-surface transition-colors group-hover:text-primary-container">
                    <Link href={`/news/${item.slug}`}>{item.title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </section>
        )}
      </Container>
    </article>
  );
}

export async function generateMetadata(props: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;

  let article: Article | null;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    return {};
  }

  if (!article) return {};

  const description = article.excerpt || article.title;
  const url = `${SITE_URL}/news/${article.slug}`;

  return {
    title: article.title,
    description,
    alternates: {
      canonical: url,
    },
    authors: [{ name: article.author.name }],
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url,
      images: [article.featuredImage],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author.name],
    },
  };
}
