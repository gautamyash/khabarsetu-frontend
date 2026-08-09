import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { createArticle } from "@/lib/articles-api";
import { getSessionToken } from "@/lib/session";
import type { ArticleCreateInput } from "@/types/article";

/**
 * POST /api/admin/articles
 *
 * Thin server-side proxy in front of POST /api/v1/articles: reads the
 * admin's JWT from the httpOnly session cookie and attaches it as a Bearer
 * token, mirroring the category/article mutation proxies from Phase 2B.
 */
export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  let body: Partial<ArticleCreateInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const status = body.status === "published" ? "published" : "draft";

  if (!title || !slug || !content) {
    return NextResponse.json(
      { message: "शीर्षक, स्लग और समाचार सामग्री आवश्यक हैं।" },
      { status: 400 }
    );
  }

  try {
    const article = await createArticle(token, {
      title,
      slug,
      categoryId: typeof body.categoryId === "string" ? body.categoryId : null,
      excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
      featuredImage: typeof body.featuredImage === "string" ? body.featuredImage : undefined,
      content,
      tags: Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [],
      isBreaking: Boolean(body.isBreaking),
      isFeatured: Boolean(body.isFeatured),
      status,
    });
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
