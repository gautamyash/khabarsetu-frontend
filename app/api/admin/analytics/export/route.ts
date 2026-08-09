import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { exportAnalyticsCsv, parseDateRangeParams } from "@/lib/analytics-api";
import { getSessionToken } from "@/lib/session";
import type { AnalyticsExportType } from "@/types/analytics";

const VALID_TYPES: AnalyticsExportType[] = ["articles", "traffic", "sources", "categories"];

/** Streams a CSV file back to the browser as a download — the actual CSV
 * text comes straight from the backend (see analytics_service.export_csv),
 * this route only attaches the auth header and forwards the response. */
export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const exportType = searchParams.get("exportType") as AnalyticsExportType | null;
  if (!exportType || !VALID_TYPES.includes(exportType)) {
    return NextResponse.json({ message: "अमान्य एक्सपोर्ट प्रकार।" }, { status: 400 });
  }

  try {
    const { csv, filename } = await exportAnalyticsCsv(token, exportType, parseDateRangeParams(searchParams));
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "एक्सपोर्ट नहीं हो सका।" }, { status: 500 });
  }
}
