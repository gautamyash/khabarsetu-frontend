import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Newspaper, TriangleAlert } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PublicEmptyState } from "@/components/ui/PublicEmptyState";
import { NewsCard } from "@/components/news/NewsCard";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { CategoryListRow } from "@/components/news/CategoryListRow";
import { ArticlePagination } from "@/components/news/ArticlePagination";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { listCategories } from "@/lib/categories-api";
import { getArticlesByCategoryPage, getBreakingArticles, getLatestArticles } from "@/lib/public-articles-api";
import { formatRelativeHindi } from "@/lib/utils";
import { SITE_URL } from "@/lib/site-url";
import type { Article } from "@/types/news";

const CATEGORY_ERROR_MESSAGE = "श्रेणी उपलब्ध नहीं है।";
const ARTICLES_ERROR_MESSAGE = "खबरें लोड नहीं हो सकीं।";
const PAGE_SIZE = 12;

function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/**
 * Category listing — restyled to match the Stitch `category` reference
 * (see stitch_25/category/code.html + screen.png): a title/description
 * header, a lead story, a 2-column editorial grid, a "ताज़ा खबरें" list,
 * numbered pagination, and a sidebar (a real breaking-news alert when one
 * exists, plus a "most read" list — the same site-wide-latest proxy the
 * homepage and article page already use, since there's no view-count
 * ranking endpoint). Data fetching, pagination math, and SEO metadata are
 * unchanged from before; only the markup/styling changed. The backend has
 * no get-category-by-slug endpoint, so this still reuses the existing
 * public `listCategories()` rather than adding a new one.
 */
export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const page = parsePage(searchParams?.page);

  let categories;
  try {
    categories = await listCategories();
  } catch {
    return (
      <Container className="py-16">
        <PublicEmptyState icon={TriangleAlert} size="lg" title={CATEGORY_ERROR_MESSAGE} />
      </Container>
    );
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  let articlesPage;
  try {
    articlesPage = await getArticlesByCategoryPage(category.id, page, PAGE_SIZE);
  } catch {
    return (
      <Container className="py-16">
        <PublicEmptyState icon={TriangleAlert} size="lg" title={ARTICLES_ERROR_MESSAGE} />
      </Container>
    );
  }

  // Sidebar content is secondary/best-effort — a failure here shouldn't
  // take down the category listing itself.
  let breaking: Article[] = [];
  let mostRead: Article[] = [];
  try {
    [breaking, mostRead] = await Promise.all([getBreakingArticles(1), getLatestArticles(4)]);
  } catch {
    breaking = [];
    mostRead = [];
  }
  const alertArticle = breaking[0] ?? null;

  // On the first page, the top story gets the lead-story treatment; the
  // next two form the 2-column editorial grid; the rest render as the
  // "ताज़ा खबरें" list. Every subsequent page is the list only.
  const showFeatured = page === 1 && articlesPage.items.length > 0;
  const featuredArticle = showFeatured ? articlesPage.items[0] : null;
  const afterFeatured = showFeatured ? articlesPage.items.slice(1) : articlesPage.items;
  const gridArticles = showFeatured ? afterFeatured.slice(0, 2) : [];
  const listArticles = showFeatured ? afterFeatured.slice(2) : afterFeatured;

  return (
    <>
      <PageViewTracker eventType="category_view" path={`/category/${category.slug}`} categorySlug={category.slug} />

      <Container className="py-8 md:py-12">
        <div className="mb-6 border-b border-on-surface pb-4">
          <h1 className="font-serif-hi relative mb-2 inline-block text-[32px] font-extrabold text-primary sm:text-[40px]">
            {category.name}
          </h1>
          {category.description && (
            <p className="max-w-3xl text-lg leading-relaxed text-secondary">{category.description}</p>
          )}
        </div>

        {articlesPage.items.length === 0 ? (
          <PublicEmptyState icon={Newspaper} size="lg" title="इस श्रेणी में अभी कोई खबर उपलब्ध नहीं है" />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main content (8 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              {featuredArticle && (
                <>
                  <FeaturedNewsCard article={featuredArticle} priority />
                  <hr className="border-t border-outline-variant" />
                </>
              )}

              {gridArticles.length > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {gridArticles.map((article, i) => (
                      <NewsCard key={article.id} article={article} className={i === 0 ? "md:border-r md:border-outline-variant md:pr-6" : undefined} />
                    ))}
                  </div>
                  <hr className="border-t border-outline-variant" />
                </>
              )}

              {listArticles.length > 0 && (
                <div>
                  <h3 className="font-serif-hi mb-4 flex items-center gap-2 text-xl font-bold text-on-surface">
                    <span className="h-6 w-2 shrink-0 bg-primary" aria-hidden />
                    ताज़ा खबरें
                  </h3>
                  <div className="flex flex-col gap-4">
                    {listArticles.map((article) => (
                      <CategoryListRow key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )}

              {articlesPage.totalPages > 1 && (
                <div className="mt-4 border-t border-on-surface pt-4">
                  <ArticlePagination
                    page={articlesPage.page}
                    totalPages={articlesPage.totalPages}
                    buildHref={(p) => `/category/${slug}?page=${p}`}
                  />
                </div>
              )}
            </div>

            {/* Sidebar (4 cols) */}
            <aside className="flex flex-col gap-8 lg:col-span-4">
              {alertArticle && (
                <div className="border-l-4 border-primary bg-primary-container p-4 text-on-primary-container">
                  <span className="mb-2 inline-block bg-on-surface px-2 py-1 text-xs font-bold text-surface uppercase">
                    अलर्ट
                  </span>
                  <p className="font-serif-hi text-base font-bold">
                    <Link href={`/news/${alertArticle.slug}`} className="hover:underline">
                      {alertArticle.title}
                    </Link>
                  </p>
                </div>
              )}

              {mostRead.length > 0 && (
                <div>
                  <h3 className="mb-4 border-t-4 border-primary pt-2 text-xl font-bold text-on-surface">
                    सबसे ज्यादा पढ़ी गई
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {mostRead.map((item, i) => (
                      <li
                        key={item.id}
                        className={i > 0 ? "group flex gap-4 border-t border-outline-variant pt-4" : "group flex gap-4"}
                      >
                        <Link href={`/news/${item.slug}`} className="contents">
                          <span className="font-serif-hi text-[32px] leading-none font-bold text-surface-variant">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-serif-hi mb-1 line-clamp-2 text-base font-bold text-on-surface transition-colors group-hover:text-primary">
                              {item.title}
                            </h4>
                            <span className="text-xs text-secondary">
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
        )}
      </Container>
    </>
  );
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;

  let categories;
  try {
    categories = await listCategories();
  } catch {
    return {};
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};

  const title = `${category.name} की ताज़ा खबरें`;
  const description = category.description || `${category.name} से जुड़ी ताज़ा खबरें हिंदी में।`;
  const url = `${SITE_URL}/category/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
    },
  };
}
