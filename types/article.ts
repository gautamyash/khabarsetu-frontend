import type { ArticleStatus } from "@/types/news";

export type { ArticleStatus };

export interface AdminArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AdminArticleAuthor {
  id: string;
  name: string;
}

/**
 * Admin-facing article type (real API data, snake_case backend fields
 * mapped to camelCase). Kept separate from the public `Article` type in
 * types/news.ts, which stays tied to the Phase 1 mock data.
 */
export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  category: AdminArticleCategory | null;
  author: AdminArticleAuthor | null;
}

export interface ArticleListParams {
  search?: string;
  categoryId?: string;
  status?: ArticleStatus;
  isBreaking?: boolean;
  page?: number;
  limit?: number;
}

/** Only "draft" and "published" are valid statuses to create/update an
 * article with — "archived" is not a create/edit-form state. */
export type CreatableArticleStatus = Extract<ArticleStatus, "draft" | "published">;

export interface ArticleCreateInput {
  title: string;
  slug: string;
  categoryId: string | null;
  excerpt?: string;
  /** URL of a previously uploaded Media item (see lib/media-api.ts), or
   * undefined/empty to leave the article without a featured image. */
  featuredImage?: string;
  content: string;
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  status: CreatableArticleStatus;
}

/** Same shape as ArticleCreateInput — PUT /articles/{id} is a full
 * replacement, matching the edit form's "Save Draft"/"Publish" actions. */
export type ArticleUpdateInput = ArticleCreateInput;

/** Single-article read shape (list rows don't carry content/tags — see
 * AdminArticle above, which mirrors the backend's ArticleListItem). */
export interface AdminArticleDetail extends AdminArticle {
  content: string;
  tags: string[];
}
