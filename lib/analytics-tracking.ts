/**
 * Pure, server-only helpers for the analytics pipeline's visitor/session
 * identity and request classification. No backend calls here — this module
 * only decides cookie names/lifetimes and parses request metadata
 * (User-Agent, Referer) that the Next.js analytics proxy
 * (app/api/analytics/event/route.ts) then sends on to FastAPI.
 *
 * Why cookies are managed at this layer instead of FastAPI: the public
 * site and the API can run on different hosts/ports in development
 * (localhost:3000 vs localhost:8000), which makes first-party cookie
 * semantics awkward across an API boundary. Minting/reading the visitor
 * and session cookies here, on the same origin the browser is actually
 * talking to, sidesteps that entirely — FastAPI only ever receives
 * already-resolved ids, never sets cookies itself.
 *
 * No PII is stored in either cookie: both are opaque, randomly generated
 * ids with no relationship to the admin auth cookie (admin_token) or to
 * any user account.
 */

export const VISITOR_COOKIE_NAME = "news25_vid";
export const SESSION_COOKIE_NAME = "news25_sid";

/** ~2 years — long-lived so returning-visitor detection actually works. */
export const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 730;

/**
 * Sliding inactivity window. Every tracked event refreshes this cookie's
 * expiry; once a visitor goes quiet for longer than this, the cookie
 * lapses and the next event mints a fresh session id — which is the
 * entire "session timeout" implementation (see
 * backend/app/services/analytics_service.py's module docstring for the
 * matching server-side note). Kept as a single named constant so the
 * frontend and backend documentation can point at the same number without
 * either side having to actually enforce a timer.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 30;

export type DeviceType = "desktop" | "mobile" | "tablet";
export type TrafficSource = "direct" | "search" | "social" | "referral" | "other";

export function generateId(): string {
  return crypto.randomUUID();
}

interface UserAgentInfo {
  deviceType: DeviceType | null;
  browser: string | null;
  operatingSystem: string | null;
}

/**
 * Small, dependency-free User-Agent classifier — deliberately not
 * exhaustive (no new npm dependency was added for this per the spec).
 * Order matters: more specific patterns (Edge, Opera, CriOS) are checked
 * before the generic ones they'd otherwise also match (Chrome, Safari).
 */
export function parseUserAgent(userAgent: string | null | undefined): UserAgentInfo {
  if (!userAgent) {
    return { deviceType: null, browser: null, operatingSystem: null };
  }

  const isTablet = /iPad|Tablet|(?:Android(?!.*Mobile))/i.test(userAgent);
  const isMobile = !isTablet && /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const deviceType: DeviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let browser: string | null = null;
  if (/Edg\//i.test(userAgent)) browser = "Edge";
  else if (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent)) browser = "Opera";
  else if (/CriOS/i.test(userAgent)) browser = "Chrome";
  else if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) browser = "Chrome";
  else if (/FxiOS/i.test(userAgent) || /Firefox\//i.test(userAgent)) browser = "Firefox";
  else if (/Version\//i.test(userAgent) && /Safari\//i.test(userAgent)) browser = "Safari";
  else if (/Safari\//i.test(userAgent)) browser = "Safari";

  let operatingSystem: string | null = null;
  if (/Windows/i.test(userAgent)) operatingSystem = "Windows";
  else if (/Android/i.test(userAgent)) operatingSystem = "Android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) operatingSystem = "iOS";
  else if (/Mac OS X/i.test(userAgent)) operatingSystem = "macOS";
  else if (/Linux/i.test(userAgent)) operatingSystem = "Linux";

  return { deviceType, browser, operatingSystem };
}

interface ReferrerInfo {
  trafficSource: TrafficSource;
  referrerDomain: string | null;
}

const SEARCH_ENGINE_DOMAINS = ["google.", "bing.com", "yahoo.", "duckduckgo.com", "baidu.com", "yandex."];
const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "t.co",
  "linkedin.com",
  "whatsapp.com",
  "telegram.org",
  "t.me",
  "reddit.com",
  "youtube.com",
  "pinterest.com",
];

function stripWww(hostname: string): string {
  return hostname.replace(/^www\./i, "");
}

/**
 * Classifies a Referer header into direct/search/social/referral/other.
 * `siteHost` is the current request's own host — a referrer pointing back
 * at the site itself (internal navigation) is treated as direct, not as a
 * self-referral.
 */
export function classifyReferrer(referrerUrl: string | null | undefined, siteHost: string): ReferrerInfo {
  if (!referrerUrl) {
    return { trafficSource: "direct", referrerDomain: null };
  }

  let domain: string;
  try {
    domain = stripWww(new URL(referrerUrl).hostname.toLowerCase());
  } catch {
    return { trafficSource: "other", referrerDomain: null };
  }

  if (!domain || domain === stripWww(siteHost.toLowerCase())) {
    return { trafficSource: "direct", referrerDomain: null };
  }

  if (SEARCH_ENGINE_DOMAINS.some((d) => domain.includes(d))) {
    return { trafficSource: "search", referrerDomain: domain };
  }
  if (SOCIAL_DOMAINS.some((d) => domain.includes(d))) {
    return { trafficSource: "social", referrerDomain: domain };
  }
  return { trafficSource: "referral", referrerDomain: domain };
}
