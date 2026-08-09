import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection for the admin area.
 *
 * NOTE: this file is intentionally named `proxy.ts`, not `middleware.ts` —
 * this Next.js version renamed the middleware file convention to Proxy
 * (`middleware.ts` is deprecated). See node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/proxy.md.
 *
 * This only checks whether the session cookie is *present* — it does not
 * verify the JWT's signature/expiry (Proxy is meant for fast, optimistic
 * redirects, not authoritative checks; see the Next.js authentication
 * guide). The real, authoritative check happens server-side in
 * app/admin/(dashboard)/layout.tsx, which asks the backend to resolve the
 * token via GET /api/v1/auth/me and redirects to /admin/login if that
 * fails (e.g. expired token). Keep this constant in sync with
 * lib/session.ts's AUTH_COOKIE_NAME.
 */
const AUTH_COOKIE_NAME = "admin_token";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  const isLoginPage = pathname === "/admin/login";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminArea && !isLoginPage && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginPage && hasSessionCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
