import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { getAnalyticsTraffic, parseDateRangeParams } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";
import type { TrafficGranularity, TrafficMetric } from "@/types/analytics";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const metric = (searchParams.get("metric") as TrafficMetric | null) ?? undefined;
  const granularity = (searchParams.get("granularity") as TrafficGranularity | null) ?? undefined;

  try {
    const traffic = await getAnalyticsTraffic(token, { ...parseDateRangeParams(searchParams), metric, granularity });
    return NextResponse.json(traffic);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
