import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api-error";
import { updateSiteSettings } from "@/lib/site-settings-api";
import { getSessionToken } from "@/lib/session";
import type { SiteSettingsInput } from "@/types/site-settings";

/**
 * PUT /api/admin/settings
 *
 * Thin server-side proxy in front of PUT /api/v1/settings, same BFF pattern
 * as /api/admin/categories — attaches the admin's JWT from the httpOnly
 * session cookie. The backend is the authoritative check for ADMIN-only
 * access (require_admin); a non-admin token still reaches the backend and
 * gets a 403 back, which this just relays.
 */
function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export async function PUT(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "प्रमाणीकरण आवश्यक है। कृपया पुनः लॉगिन करें।" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "अमान्य अनुरोध।" }, { status: 400 });
  }

  const siteName = optionalString(body.siteName);
  if (!siteName) {
    return NextResponse.json({ message: "साइट का नाम आवश्यक है।" }, { status: 400 });
  }

  const input: SiteSettingsInput = {
    siteName,
    siteDescription: optionalString(body.siteDescription),
    logoUrl: optionalString(body.logoUrl),
    contactEmail: optionalString(body.contactEmail),
    phone: optionalString(body.phone),
    address: optionalString(body.address),
    facebookUrl: optionalString(body.facebookUrl),
    instagramUrl: optionalString(body.instagramUrl),
    youtubeUrl: optionalString(body.youtubeUrl),
    twitterUrl: optionalString(body.twitterUrl),
  };

  try {
    const settings = await updateSiteSettings(token, input);
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status ?? 502 });
    }
    return NextResponse.json({ message: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
