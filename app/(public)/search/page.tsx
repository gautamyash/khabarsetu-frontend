import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SearchPageForm } from "@/components/news/SearchPageForm";
import { ArticlePagination } from "@/components/news/ArticlePagination";
import { PublicEmptyState } from "@/components/ui/PublicEmptyState";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { searchArticles, getLatestArticles } from "@/lib/public-articles-api";
import { listCategories } from "@/lib/categories-api";
import { formatRelativeHindi } from "@/lib/utils";
import { UI_TEXT } from "@/lib/constants";
import type { Page } from "@/types/pagination";
import type { Article } from "@/types/news";
import type { AdminCategory } from "@/types/category";

export const metadata: Metadata = {
  title: UI_TEXT.search,
};

const ERROR_MESSAGE = "खबरें लोड नहीं हो सकीं।";
const PAGE_SIZE = 12;

function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/** A search result row — thumbnail, category + time meta, headline, and a
 * line-clamped excerpt — matching the Stitch `Search` reference's result
 * layout exactly (a 1/3-width image beside 2/3-width content, not a
 * generic card grid). */
function SearchResultRow({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col gap-4 border-b border-surface-variant pb-6 last:border-0 sm:flex-row">
      <Link href={`/news/${article.slug}`} className="relative shrink-0 overflow-hidden bg-surface-container sm:w-1/3">
        <span className="relative block aspect-video">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </span>
      </Link>
      <div className="flex flex-col justify-between sm:w-2/3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">{article.category.name}</span>
            <span className="h-1 w-1 rounded-full bg-secondary" aria-hidden />
            <span className="text-xs text-secondary">{formatRelativeHindi(article.publishedAt)}</span>
          </div>
          <h2 className="font-serif-hi mb-2 text-xl leading-tight text-on-surface transition-colors group-hover:text-primary">
            <Link href={`/news/${article.slug}`}>{article.title}</Link>
          </h2>
          {article.excerpt && (
            <p className="line-clamp-3 text-sm text-on-surface-variant">{article.excerpt}</p>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Search — restyled to match the Stitch `Search` reference (see
 * stitch_25/Search/code.html + screen.png): a "खबर खोजें" header with a
 * large bordered query field, an exact (not approximated) real result
 * count, result rows in an 8/4 grid, numbered pagination, and a sidebar
 * (real site categories as "संबंधित विषय" browse pills, plus a "ताज़ा
 * रुझान" list — the same site-wide-latest proxy the homepage/article/
 * category pages already use). Search still runs server-side via
 * GET /articles?search=... (title/excerpt/content ILIKE, unchanged); this
 * never fetches the full article set and filters it in React.
 */
export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const rawQuery = searchParams?.q;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  const page = parsePage(searchParams?.page);

  let results: Page<Article> | null = null;
  let errorMessage: string | null = null;

  if (query) {
    try {
      results = await searchArticles(query, page, PAGE_SIZE);
    } catch {
      errorMessage = ERROR_MESSAGE;
    }
  }

  // Sidebar content is secondary/best-effort — a failure here shouldn't
  // take down the search results themselves.
  let categories: AdminCategory[] = [];
  let trending: Article[] = [];
  try {
    [categories, trending] = await Promise.all([listCategories(), getLatestArticles(3)]);
  } catch {
    categories = [];
    trending = [];
  }

  return (
    <>
      {query && !errorMessage && results && (
        <PageViewTracker
          eventType="search"
          path="/search"
          searchQuery={query}
          searchResultCount={results.total}
        />
      )}

      <Container className="py-8 md:py-12">
        <section className="mb-8 border-b border-on-surface pb-8">
          <h1 className="font-serif-hi mb-4 text-[32px] font-extrabold text-on-surface sm:text-[40px]">
            खबर खोजें
          </h1>
          <SearchPageForm defaultValue={query} />
          {query && !errorMessage && results && (
            <p className="mt-2 text-sm text-secondary">
              &lsquo;<span className="font-semibold">{query}</span>&rsquo; के लिए {results.total} परिणाम मिले
            </p>
          )}
        </section>

        {!query && (
          <PublicEmptyState icon={SearchIcon} size="lg" title="खबर खोजें" message="खोजने के लिए ऊपर कोई शब्द लिखें।" />
        )}

        {query && errorMessage && (
          <PublicEmptyState icon={SearchIcon} size="lg" title="कुछ गलत हो गया" message={errorMessage} />
        )}

        {query && !errorMessage && results && results.items.length === 0 && (
          <PublicEmptyState
            icon={SearchIcon}
            size="lg"
            title="कोई खबर नहीं मिली"
            message="आपके द्वारा खोजे गए शब्द से मेल खाती कोई खबर नहीं मिली। कृपया दूसरा शब्द या विषय खोजें।"
          />
        )}

        {query && !errorMessage && results && results.items.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="flex flex-col gap-6 md:col-span-8 md:border-r md:border-on-surface md:pr-6">
              {results.items.map((article) => (
                <SearchResultRow key={article.id} article={article} />
              ))}

              {results.totalPages > 1 && (
                <div className="mt-2 pt-4">
                  <ArticlePagination
                    page={results.page}
                    totalPages={results.totalPages}
                    buildHref={(p) => `/search?q=${encodeURIComponent(query)}&page=${p}`}
                  />
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-8 md:col-span-4">
              {categories.length > 0 && (
                <div className="border border-outline-variant bg-surface-container-low p-4">
                  <h3 className="font-serif-hi mb-3 border-l-4 border-primary pl-3 text-xl font-bold text-on-surface">
                    श्रेणियाँ
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="border border-outline px-3 py-1 text-sm font-bold text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {trending.length > 0 && (
                <div>
                  <h3 className="font-serif-hi mb-4 border-l-4 border-primary pl-3 text-xl font-bold text-on-surface">
                    ताज़ा रुझान
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {trending.map((item, i) => (
                      <li
                        key={item.id}
                        className={i > 0 ? "group mt-2 border-b border-surface-variant pb-2" : "group border-b border-surface-variant pb-2"}
                      >
                        <Link href={`/news/${item.slug}`}>
                          <span className="mb-1 block text-sm font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                          <h4 className="line-clamp-2 text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
                            {item.title}
                          </h4>
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
