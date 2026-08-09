"use client";

import { useEffect, useRef } from "react";

/**
 * Fires exactly one page-view-shaped analytics event per page visit (plus a
 * best-effort session_end beacon on tab close/hide), then renders nothing.
 * Placed directly in each public page (homepage/article/category/search —
 * see spec section 29) rather than in a shared layout, so each page can
 * pass the specific event type + slug/query it actually represents instead
 * of a single generic "page_view" for everything.
 *
 * Never throws into the page it's attached to — every failure mode here is
 * caught and silently ignored; analytics tracking must not be able to break
 * the public site.
 */

const ENDPOINT = "/api/analytics/event";

type TrackedEventType = "page_view" | "article_view" | "category_view" | "search";

interface PageViewTrackerProps {
  eventType: TrackedEventType;
  path: string;
  articleSlug?: string;
  categorySlug?: string;
  searchQuery?: string;
  searchResultCount?: number;
}

function sendEvent(payload: Record<string, unknown>) {
  try {
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  } catch {
    // Never let a synchronous failure here reach the page.
  }
}

export function PageViewTracker({
  eventType,
  path,
  articleSlug,
  categorySlug,
  searchQuery,
  searchResultCount,
}: PageViewTrackerProps) {
  // Guards against React 18 dev-mode StrictMode double-invoking effects
  // (which would otherwise double-count every page view in development).
  const sentForPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (sentForPathRef.current === path) return;
    sentForPathRef.current = path;

    sendEvent({
      eventType,
      path,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      articleSlug: articleSlug || null,
      categorySlug: categorySlug || null,
      searchQuery: searchQuery || null,
      searchResultCount: searchResultCount ?? null,
    });

    function handlePageHide() {
      const data = JSON.stringify({ eventType: "session_end", path, referrer: null });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([data], { type: "application/json" }));
      }
    }

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return null;
}
