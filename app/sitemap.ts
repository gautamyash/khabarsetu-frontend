import type { MetadataRoute } from "next";
import { listCategories } from "@/lib/categories-api";
import { getAllPublishedArticles } from "@/lib/public-articles-api";
import { SITE_URL } from "@/lib/site-url";

/**
 * Real sitemap — replaces the Phase 1 mock-data placeholder. Only ever
 * includes public, published content: the homepage, every published
 * article (draft/archived articles are never returned by the public
 * articles API in the first place — see get_optional_current_user in
 * backend/app/core/deps.py), and every category. No admin/login URLs.
 *
 * If either fetch fails, this falls back to just the static routes rather
 * than throwing (a broken sitemap request shouldn't 500).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await listCategories();
    categoryRoutes = categories.map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "hourly",
      priority: 0.7,
    }));
  } catch {
    categoryRoutes = [];
  }

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getAllPublishedArticles();
    articleRoutes = articles.map((article) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: article.publishedAt,
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch {
    articleRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
