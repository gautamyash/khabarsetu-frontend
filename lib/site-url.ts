/**
 * Single source of truth for the site's canonical base URL — used by root
 * metadata (app/(public)/layout.tsx), article/category page canonical
 * links, app/sitemap.ts, and app/robots.ts. Reading NEXT_PUBLIC_SITE_URL in
 * one place avoids the same `?? "http://localhost:3000"` fallback being
 * duplicated across every SEO-related file.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
