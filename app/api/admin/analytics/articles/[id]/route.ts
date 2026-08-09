import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { getArticleAnalyticsDetail } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const detail = await getArticleAnalyticsDetail(token, id);
    if (!detail) {
      return NextResponse.json({ message: "खबर नहीं मिली।" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
