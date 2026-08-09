import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * Allows all public pages (/, /news/*, /category/*, /search); disallows
 * the admin CMS and the backend API surface.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/api", "/api/*"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
