import { apiClient } from "@/lib/api-client";
import { toApiError } from "@/lib/api-error";
import type { Article, Author, Category } from "@/types/news";
import type { Page } from "@/types/pagination";

/**
 * Public, unauthenticated wrappers around the backend's /articles endpoint,
 * used by the public website (homepage as of Phase 3A). No token is ever
 * attached — the backend enforces "published only" for anonymous callers
 * on its own (see backend/app/routers/articles.py), but every call here
 * also passes status=published explicitly so intent stays obvious at the
 * call site.
 *
 * Maps the backend's snake_case ArticleListItem shape onto the existing
 * public `Article` type (types/news.ts) that FeaturedNewsCard/NewsCard/
 * CompactNewsCard/CategoryNewsSection/BreakingNewsBar already render —
 * those components are reused unchanged, so every field they assume is
 * present (featuredImage, excerpt, category, author as non-null) gets a
 * sensible fallback here instead of a redesign there.
 */

const FALLBACK_IMAGE = "/images/placeholders/default.jpg";
const FALLBACK_CATEGORY: Category = { id: "general", name: "सामान्य", slug: "general" };
const FALLBACK_AUTHOR: Author = { id: "news-desk", name: "समाचार डेस्क" };

interface PublicCategoryRefShape {
  id: string;
  name: string;
  slug: string;
}

interface PublicAuthorRefShape {
  id: string;
  name: string;
}

interface PublicArticleShape {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  is_breaking: boolean;
  is_featured: boolean;
  published_at: string | null;
  category: PublicCategoryRefShape | null;
  author: PublicAuthorRefShape | null;
}

interface PublicArticlesPageShape {
  items: PublicArticleShape[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface PublicTagRefShape {
  id: string;
  name: string;
  slug: string;
}

interface PublicArticleDetailShape extends PublicArticleShape {
  content: string;
  tags: PublicTagRefShape[];
  created_at: string;
  updated_at: string;
}

function mapArticle(raw: PublicArticleShape): Article {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt ?? "",
    featuredImage: raw.featured_image ?? FALLBACK_IMAGE,
    category: raw.category ?? FALLBACK_CATEGORY,
    author: raw.author ?? FALLBACK_AUTHOR,
    isBreaking: raw.is_breaking,
    isFeatured: raw.is_featured,
    // Published articles always have published_at set (the backend sets it
    // the first time an article is published) — this fallback is just
    // defensive, not an expected path.
    publishedAt: raw.published_at ?? new Date().toISOString(),
  };
}

function mapArticleDetail(raw: PublicArticleDetailShape): Article {
  return {
    ...mapArticle(raw),
    content: raw.content,
    tags: raw.tags.map((tag) => tag.name),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Full paginated shape — used wherever a caller needs page/total/totalPages
 * (category and search pages), not just the items array.
 */
async function fetchPublishedArticlesPage(params: {
  categoryId?: string;
  search?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}): Promise<Page<Article>> {
  try {
    const { data } = await apiClient.get<PublicArticlesPageShape>("/articles", {
      params: {
        status: "published",
        category_id: params.categoryId,
        search: params.search || undefined,
        is_breaking: params.isBreaking,
        is_featured: params.isFeatured,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return {
      items: data.items.map(mapArticle),
      page: data.page,
      limit: data.limit,
      total: data.total,
      totalPages: data.total_pages,
    };
  } catch (error) {
    throw toApiError(error, "खबरें लोड नहीं हो सकीं।");
  }
}

/** Items-only convenience wrapper over fetchPublishedArticlesPage — used by
 * the homepage/breaking/featured/related callers below, none of which need
 * pagination metadata. */
async function fetchPublishedArticles(params: {
  categoryId?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  limit?: number;
}): Promise<Article[]> {
  const result = await fetchPublishedArticlesPage(params);
  return result.items;
}

/** Published articles flagged as breaking news. */
export function getBreakingArticles(limit = 8): Promise<Article[]> {
  return fetchPublishedArticles({ isBreaking: true, limit });
}

/** Published articles flagged as featured — homepage hero area. */
export function getFeaturedArticles(limit = 6): Promise<Article[]> {
  return fetchPublishedArticles({ isFeatured: true, limit });
}

/** Most recently published articles overall. */
export function getLatestArticles(limit = 8): Promise<Article[]> {
  return fetchPublishedArticles({ limit });
}

/** Published articles within a single category. */
export function getArticlesByCategoryId(categoryId: string, limit = 4): Promise<Article[]> {
  return fetchPublishedArticles({ categoryId, limit });
}

/**
 * Full article detail by slug, for the public article page. Backed by the
 * same GET /articles/slug/{slug} endpoint the admin panel uses — no token
 * is attached, so the backend enforces "published only" and 404s for
 * drafts/archived articles on its own.
 *
 * Returns null on a 404 (article missing OR not published — the backend
 * deliberately doesn't distinguish the two to an anonymous caller, so
 * neither does this function). The caller should treat null as "call
 * notFound()". Any other failure (network, 5xx) still throws ApiError so
 * the caller can show a real error state instead of a false 404.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data } = await apiClient.get<PublicArticleDetailShape>(
      `/articles/slug/${encodeURIComponent(slug)}`
    );
    return mapArticleDetail(data);
  } catch (error) {
    const apiError = toApiError(error, "खबर लोड नहीं हो सकी।");
    if (apiError.status === 404) return null;
    throw apiError;
  }
}

/**
 * A small "संबंधित खबरें" set: other published articles in the same
 * category, excluding the current one. Deliberately simple — no scoring,
 * no fallback to other categories. Returns [] when the article has no real
 * category (i.e. it mapped to the fallback category), since fetching "more
 * like this" for the fallback bucket isn't meaningful.
 */
export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  if (article.category.slug === FALLBACK_CATEGORY.slug) return [];

  const items = await getArticlesByCategoryId(article.category.id, limit + 1);
  return items.filter((a) => a.id !== article.id).slice(0, limit);
}

/**
 * Paginated published articles within a single category — for the
 * /category/[slug] page. Unlike getArticlesByCategoryId, this returns full
 * pagination metadata (page/total/totalPages) instead of just the items.
 */
export function getArticlesByCategoryPage(
  categoryId: string,
  page = 1,
  limit = 12
): Promise<Page<Article>> {
  return fetchPublishedArticlesPage({ categoryId, page, limit });
}

/**
 * Server-side search over published articles' title/excerpt/content — for
 * the /search page. Matches the backend's existing `search` query param on
 * GET /articles (article_service.list_articles already ILIKEs across all
 * three fields); this never fetches everything and filters client-side.
 */
export function searchArticles(query: string, page = 1, limit = 12): Promise<Page<Article>> {
  return fetchPublishedArticlesPage({ search: query, page, limit });
}

/**
 * Every published article, across all pages — used only by app/sitemap.ts
 * (a build/request-time job, not a user-facing page load), which needs the
 * full set of public article URLs rather than a single page of results.
 * Walks pages with a large page size until totalPages is reached.
 */
export async function getAllPublishedArticles(): Promise<Article[]> {
  const pageSize = 100;
  const first = await fetchPublishedArticlesPage({ page: 1, limit: pageSize });
  const all = [...first.items];

  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchPublishedArticlesPage({ page, limit: pageSize });
    all.push(...next.items);
  }

  return all;
}
