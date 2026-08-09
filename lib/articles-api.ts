import { apiClient } from "@/lib/api-client";
import { toApiError } from "@/lib/api-error";
import type {
  AdminArticle,
  AdminArticleDetail,
  ArticleCreateInput,
  ArticleListParams,
  ArticleUpdateInput,
} from "@/types/article";
import type { Page } from "@/types/pagination";

/**
 * Server-only wrappers around the backend's /articles endpoints. Every
 * endpoint here requires a Bearer token — this is the admin-authenticated
 * client used by the CMS (news list/create/edit/publish). The public site
 * reads articles through the separate, unauthenticated lib/public-articles-
 * api.ts instead (see Phase 3A+), not through this module. Route Handlers/
 * Server Components pass the token in; this module never reads cookies
 * itself.
 */

interface ArticleRefApiShape {
  id: string;
  name: string;
  slug: string;
}

interface ArticleAuthorApiShape {
  id: string;
  name: string;
}

interface ArticleApiShape {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  status: AdminArticle["status"];
  is_breaking: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  category: ArticleRefApiShape | null;
  author: ArticleAuthorApiShape | null;
}

interface PageApiShape<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface TagApiShape {
  id: string;
  name: string;
  slug: string;
}

interface ArticleDetailApiShape extends ArticleApiShape {
  content: string;
  tags: TagApiShape[];
}

function mapArticle(raw: ArticleApiShape): AdminArticle {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    featuredImage: raw.featured_image,
    status: raw.status,
    isBreaking: raw.is_breaking,
    isFeatured: raw.is_featured,
    publishedAt: raw.published_at,
    createdAt: raw.created_at,
    category: raw.category,
    author: raw.author,
  };
}

function mapArticleDetail(raw: ArticleDetailApiShape): AdminArticleDetail {
  return {
    ...mapArticle(raw),
    content: raw.content,
    tags: raw.tags.map((tag) => tag.name),
  };
}

function toArticlePayload(input: ArticleCreateInput | ArticleUpdateInput) {
  return {
    title: input.title,
    slug: input.slug,
    category_id: input.categoryId || undefined,
    excerpt: input.excerpt || undefined,
    featured_image: input.featuredImage || undefined,
    content: input.content,
    tags: input.tags,
    is_breaking: input.isBreaking,
    is_featured: input.isFeatured,
    status: input.status,
  };
}

export async function listArticles(
  token: string,
  params: ArticleListParams = {}
): Promise<Page<AdminArticle>> {
  try {
    const { data } = await apiClient.get<PageApiShape<ArticleApiShape>>("/articles", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: params.search || undefined,
        category_id: params.categoryId || undefined,
        status: params.status || undefined,
        is_breaking: params.isBreaking,
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

export async function createArticle(token: string, input: ArticleCreateInput): Promise<AdminArticle> {
  try {
    const { data } = await apiClient.post<ArticleApiShape>("/articles", toArticlePayload(input), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapArticle(data);
  } catch (error) {
    throw toApiError(error, "खबर सहेजी नहीं जा सकी।");
  }
}

export async function getArticle(token: string, id: string): Promise<AdminArticleDetail> {
  try {
    const { data } = await apiClient.get<ArticleDetailApiShape>(`/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapArticleDetail(data);
  } catch (error) {
    throw toApiError(error, "खबर लोड नहीं हो सकी।");
  }
}

export async function updateArticle(
  token: string,
  id: string,
  input: ArticleUpdateInput
): Promise<AdminArticle> {
  try {
    const { data } = await apiClient.put<ArticleApiShape>(`/articles/${id}`, toArticlePayload(input), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapArticle(data);
  } catch (error) {
    throw toApiError(error, "खबर अपडेट नहीं हो सकी।");
  }
}

export async function deleteArticle(token: string, id: string): Promise<void> {
  try {
    await apiClient.delete(`/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw toApiError(error, "खबर हटाई नहीं जा सकी।");
  }
}

export async function publishArticle(token: string, id: string): Promise<AdminArticle> {
  try {
    const { data } = await apiClient.patch<ArticleApiShape>(`/articles/${id}/publish`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapArticle(data);
  } catch (error) {
    throw toApiError(error, "खबर प्रकाशित नहीं की जा सकी।");
  }
}

export async function unpublishArticle(token: string, id: string): Promise<AdminArticle> {
  try {
    const { data } = await apiClient.patch<ArticleApiShape>(`/articles/${id}/unpublish`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapArticle(data);
  } catch (error) {
    throw toApiError(error, "खबर अप्रकाशित नहीं की जा सकी।");
  }
}

export async function archiveArticle(token: string, id: string): Promise<AdminArticle> {
  try {
    const { data } = await apiClient.patch<ArticleApiShape>(`/articles/${id}/archive`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return mapArticle(data);
  } catch (error) {
    throw toApiError(error, "खबर संग्रहित नहीं की जा सकी।");
  }
}
