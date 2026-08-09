/** Mirrors the backend's SiteSettingsRead/SiteSettingsUpdate (app/schemas/site_settings.py). */
export interface SiteSettings {
  siteName: string;
  siteDescription: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  twitterUrl: string | null;
}

/** PUT /settings body — siteName is required, everything else optional. */
export interface SiteSettingsInput {
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
}
