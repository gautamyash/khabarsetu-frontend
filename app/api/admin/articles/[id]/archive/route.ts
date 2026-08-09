import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { archiveArticle } from "@/lib/articles-api";
import { getSessionToken } from "@/lib/session";

/** PATCH /api/admin/articles/[id]/archive — proxies to PATCH /api/v1/articles/{id}/archive. */
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  try {
    const article = await archiveArticle(token, id);
    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
