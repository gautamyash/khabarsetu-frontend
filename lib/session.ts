import { cache } from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-api";
import type { AuthUser } from "@/types/auth";

/**
 * Session storage for the admin area.
 *
 * The JWT lives only in an httpOnly cookie set by the Next.js server (see
 * app/api/auth/login/route.ts) — it is never exposed to client-side
 * JavaScript, so it can't be read or exfiltrated by a browser-side script.
 * `proxy.ts` does a cheap "cookie present?" check for redirects; the actual
 * token is verified authoritatively by the backend via getAuthenticatedUser()
 * below (called from the admin dashboard layout).
 */

export const AUTH_COOKIE_NAME = "admin_token";

/** Best-effort read of the JWT `exp` claim, without verifying the signature —
 * used only to size the cookie's Max-Age. The backend remains the source of
 * truth for whether the token is actually still valid. */
function readExpiryMs(token: string): number | null {
  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) return null;
    const json = Buffer.from(payloadSegment, "base64url").toString("utf8");
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(accessToken: string): Promise<void> {
  const store = await cookies();
  const expiryMs = readExpiryMs(accessToken);
  const maxAgeSeconds = expiryMs
    ? Math.max(60, Math.floor((expiryMs - Date.now()) / 1000))
    : 60 * 30; // fallback: 30 minutes

  store.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value;
}

/**
 * The authoritative "who's logged in" check: reads the cookie, then asks the
 * backend to resolve it. Returns null if there's no cookie, or the token is
 * invalid/expired — callers (admin layouts/pages) redirect accordingly.
 *
 * Wrapped in React's `cache()` so the admin layout (auth guard) and a page
 * that also wants the current user (e.g. to greet them by name) share a
 * single backend call per request instead of two.
 */
export const getAuthenticatedUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  return getCurrentUser(token);
});
