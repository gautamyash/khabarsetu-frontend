import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  VISITOR_COOKIE_MAX_AGE_SECONDS,
  VISITOR_COOKIE_NAME,
  classifyReferrer,
  generateId,
  parseUserAgent,
} from "@/lib/analytics-tracking";

/**
 * Public analytics event collection proxy — the ONLY thing the browser
 * talks to for tracking. It never requires auth (matches spec section 25:
 * "public event collection must NOT require admin authentication"), and it
 * is the sole place visitor/session cookies are minted or refreshed (see
 * lib/analytics-tracking.ts for why cookies live at this layer rather than
 * on the FastAPI backend).
 *
 * A tracking failure here must never break the page it was called from —
 * every backend call is wrapped so a network/backend error is logged and
 * swallowed, not surfaced to the caller.
 */

type TrackedEventType = "page_view" | "article_view" | "category_view" | "search" | "session_start" | "session_end";

interface EventRequestBody {
  eventType: TrackedEventType;
  path: string;
  // document.referrer, read once client-side. Only actually used by the
  // backend when this call starts a brand-new session (see
  // analytics_service.get_or_create_session) — sending it on every call is
  // harmless, not incorrect.
  referrer?: string | null;
  articleSlug?: string | null;
  categorySlug?: string | null;
  searchQuery?: string | null;
  searchResultCount?: number | null;
}

const EVENT_TYPES: readonly TrackedEventType[] = [
  "page_view",
  "article_view",
  "category_view",
  "search",
  "session_start",
  "session_end",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: EventRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  if (!body?.path || !EVENT_TYPES.includes(body.eventType)) {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const existingVisitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  const visitorId = existingVisitorId ?? generateId();

  const existingSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isNewSession = !existingSessionId;
  const sessionId = existingSessionId ?? generateId();

  const { deviceType, browser, operatingSystem } = parseUserAgent(request.headers.get("user-agent"));
  const host = request.headers.get("host") ?? "";
  const { trafficSource, referrerDomain } = classifyReferrer(body.referrer, host);

  let resolvedSessionId = sessionId;
  try {
    const { data } = await apiClient.post<{ recorded: boolean; session_id: string }>("/analytics/events", {
      visitor_id: visitorId,
      session_id: sessionId,
      is_new_session: isNewSession,
      event_type: body.eventType,
      path: body.path,
      article_slug: body.articleSlug || null,
      category_slug: body.categorySlug || null,
      referrer: body.referrer || null,
      referrer_domain: referrerDomain,
      traffic_source: trafficSource,
      device_type: deviceType,
      browser,
      operating_system: operatingSystem,
      search_query: body.searchQuery || null,
      search_result_count: body.searchResultCount ?? null,
    });
    resolvedSessionId = data.session_id;
  } catch (error) {
    // Tracking must be best-effort: never let a backend/network hiccup
    // surface as an error on the page that triggered it.
    console.error("analytics event forward failed", error);
  }

  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
  });
  response.cookies.set(SESSION_COOKIE_NAME, resolvedSessionId, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
