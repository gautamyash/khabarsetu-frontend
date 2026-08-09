import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { getAnalyticsOverview } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";

/**
 * GET /api/admin/analytics/overview
 *
 * Thin BFF proxy in front of GET /api/v1/analytics/overview — same pattern
 * as every other app/api/admin/* route (see settings/route.ts). The
 * backend is the authoritative ADMIN-only check (require_admin); a
 * non-admin token still reaches it and gets a 403 back, relayed as-is.
 */
export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  try {
    const overview = await getAnalyticsOverview(token);
    return NextResponse.json(overview);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
