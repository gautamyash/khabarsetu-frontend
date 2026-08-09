import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { getAnalyticsDevices, parseDateRangeParams } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  try {
    const devices = await getAnalyticsDevices(token, parseDateRangeParams(request.nextUrl.searchParams));
    return NextResponse.json(devices);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
