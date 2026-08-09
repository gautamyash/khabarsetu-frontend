import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { createCategory } from "@/lib/categories-api";
import { getSessionToken } from "@/lib/session";

/**
 * POST /api/admin/categories
 *
 * Thin server-side proxy in front of POST /api/v1/categories: reads the
 * admin's JWT from the httpOnly session cookie (never exposed to client JS)
 * and attaches it as a Bearer token, mirroring the login/logout BFF pattern
 * from Phase 2A.
 */
export async function POST(request: Request) {
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
    const category = await createCategory(token, { name, slug, description });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
