import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { deleteArticle, updateArticle } from "@/lib/articles-api";
import { getSessionToken } from "@/lib/session";
import type { ArticleUpdateInput } from "@/types/article";

/** PUT /api/admin/articles/[id] — proxies to PUT /api/v1/articles/{id}. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  let body: Partial<ArticleUpdateInput>;
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
    const article = await updateArticle(token, id, {
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
    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}

/** DELETE /api/admin/articles/[id] — proxies to DELETE /api/v1/articles/{id}. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  try {
    await deleteArticle(token, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
