import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { getArticleAnalyticsList, parseDateRangeParams } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";
import type { ArticleAnalyticsSort } from "@/types/analytics";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = Number(searchParams.get("limit") ?? "20") || 20;
  const sort = (searchParams.get("sort") as ArticleAnalyticsSort | null) ?? undefined;
  const breakingOnly = searchParams.get("breakingOnly") === "true";

  try {
    const result = await getArticleAnalyticsList(token, {
      ...parseDateRangeParams(searchParams),
      page,
      limit,
      sort,
      breakingOnly,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
