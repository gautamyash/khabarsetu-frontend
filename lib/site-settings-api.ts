import { cache } from "react";
import { apiClient } from "@/lib/api-client";
import { toApiError } from "@/lib/api-error";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import type { SiteSettings, SiteSettingsInput } from "@/types/site-settings";

/**
 * Server-only wrapper around the backend's GET/PUT /settings (see
 * backend/app/routers/settings.py). GET is public — used both by SEO
 * metadata/branding (getSiteSettings, which never throws) and by the admin
 * settings page (getSiteSettingsForAdmin, which does, so the page can show
 * a real error state like every other admin list page). PUT is ADMIN-only
 * (updateSiteSettings) and requires a Bearer token, same shape as
 * categories-api.ts's mutations.
 */

export type { SiteSettings, SiteSettingsInput };

interface SiteSettingsApiShape {
  site_name: string;
  site_description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
}

const FALLBACK_SETTINGS: SiteSettings = {
  siteName: SITE_NAME,
  siteDescription: SITE_DESCRIPTION,
  logoUrl: null,
  contactEmail: null,
  phone: null,
  address: null,
  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  twitterUrl: null,
};

function mapSettings(raw: SiteSettingsApiShape): SiteSettings {
  return {
    siteName: raw.site_name,
    siteDescription: raw.site_description,
    logoUrl: raw.logo_url,
    contactEmail: raw.contact_email,
    phone: raw.phone,
    address: raw.address,
    facebookUrl: raw.facebook_url,
    instagramUrl: raw.instagram_url,
    youtubeUrl: raw.youtube_url,
    twitterUrl: raw.twitter_url,
  };
}

/**
 * Cached per-request (same pattern as listCategories/getAuthenticatedUser).
 * Unlike other *-api.ts modules, this deliberately never throws — metadata
 * generation and public branding must never crash a page, so any failure
 * just falls back to the existing frontend constants instead of surfacing
 * an error.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const { data } = await apiClient.get<SiteSettingsApiShape>("/settings");
    return mapSettings(data);
  } catch {
    return FALLBACK_SETTINGS;
  }
});

/**
 * Same GET /settings, but for the admin settings page — throws ApiError on
 * failure so the page can render a real "लोड नहीं हो सके" error state
 * instead of silently showing fallback values as if they were saved data.
 */
export async function getSiteSettingsForAdmin(): Promise<SiteSettings> {
  try {
    const { data } = await apiClient.get<SiteSettingsApiShape>("/settings");
    return mapSettings(data);
  } catch (error) {
    throw toApiError(error, "सेटिंग्स लोड नहीं हो सकीं।");
  }
}

export async function updateSiteSettings(
  token: string,
  input: SiteSettingsInput
): Promise<SiteSettings> {
  try {
    const { data } = await apiClient.put<SiteSettingsApiShape>(
      "/settings",
      {
        site_name: input.siteName,
        site_description: input.siteDescription,
        logo_url: input.logoUrl,
        contact_email: input.contactEmail,
        phone: input.phone,
        address: input.address,
        facebook_url: input.facebookUrl,
        instagram_url: input.instagramUrl,
        youtube_url: input.youtubeUrl,
        twitter_url: input.twitterUrl,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return mapSettings(data);
  } catch (error) {
    throw toApiError(error, "सेटिंग्स सहेजी नहीं जा सकीं।");
  }
}
