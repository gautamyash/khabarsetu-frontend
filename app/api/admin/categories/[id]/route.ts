import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { deleteCategory, updateCategory } from "@/lib/categories-api";
import { getSessionToken } from "@/lib/session";

/** PUT /api/admin/categories/[id] — proxies to PUT /api/v1/categories/{id}. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  let body: { name?: unknown; slug?: unknown; description?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const rawDescription = typeof body.description === "string" ? body.description.trim() : "";
  const description = rawDescription || undefined;

  if (!name || !slug) {
    return NextResponse.json({ message: "नाम और स्लग आवश्यक हैं।" }, { status: 400 });
  }

  try {
    const category = await updateCategory(token, id, { name, slug, description });
    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}

/** DELETE /api/admin/categories/[id] — proxies to DELETE /api/v1/categories/{id}. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  try {
    await deleteCategory(token, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
