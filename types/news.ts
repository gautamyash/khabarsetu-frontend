/**
 * Shared frontend types for news content.
 *
 * These mirror the backend's future API shape closely so swapping mock data
 * for real API responses later (Phase 3+) is a low-friction change.
 */

export type ArticleStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage: string;
  category: Category;
  author: Author;
  tags?: string[];
  isBreaking?: boolean;
  isFeatured?: boolean;
  publishedAt: string;
  /** Only populated by the article detail fetch (public-articles-api.ts) —
   * used to show an "updated" date distinct from publishedAt. */
  createdAt?: string;
  updatedAt?: string;
}
