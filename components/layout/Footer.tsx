import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { listCategories } from "@/lib/categories-api";
import { getSiteSettings } from "@/lib/site-settings-api";
import { UI_TEXT } from "@/lib/constants";
import type { AdminCategory } from "@/types/category";

const SOCIAL_LINKS = [
  { key: "facebookUrl", label: "Facebook" },
  { key: "instagramUrl", label: "Instagram" },
  { key: "youtubeUrl", label: "YouTube" },
  { key: "twitterUrl", label: "Twitter/X" },
] as const;

const LINK_CLASS = "text-sm font-bold text-tertiary-fixed-dim transition-colors hover:text-white";

/**
 * Dark 4-column footer matching the Stitch Homepage/25_mobile_1
 * reference — a tertiary (near-black) band, a masthead + description
 * column, then link columns, closing with a centered copyright line.
 * Structurally reshaped to match the reference, but every link still
 * points at real data: categories from categories-api.ts, contact/social
 * from site-settings-api.ts — nothing here is a fabricated placeholder
 * page. On mobile it stacks and centers, mirroring 25_mobile_1's footer.
 */
export async function Footer() {
  const year = new Date().getFullYear();

  let categories: AdminCategory[] = [];
  try {
    categories = await listCategories();
  } catch {
    categories = [];
  }

  const settings = await getSiteSettings();
  const topCategories = categories.slice(0, 6);
  const socialLinks = SOCIAL_LINKS.filter((item) => Boolean(settings[item.key]));

  return (
    <footer className="mt-12 border-t-2 border-primary bg-tertiary">
      <Container className="py-12 text-center md:text-left">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="font-serif-hi text-2xl font-black text-surface-container-lowest uppercase">
              {settings.siteName}
            </span>
            {settings.siteDescription && (
              <p className="mt-3 text-sm leading-relaxed text-tertiary-fixed-dim">{settings.siteDescription}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2.5 md:items-start">
            <Link href="/" className={LINK_CLASS}>
              {UI_TEXT.home}
            </Link>
            <Link href="/search" className={LINK_CLASS}>
              {UI_TEXT.search}
            </Link>
          </div>

          {topCategories.length > 0 && (
            <div className="flex flex-col items-center gap-2.5 md:items-start">
              {topCategories.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className={LINK_CLASS}>
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-2.5 md:items-start">
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className={`flex items-center gap-1.5 ${LINK_CLASS}`}>
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {settings.contactEmail}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className={`flex items-center gap-1.5 ${LINK_CLASS}`}>
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {settings.phone}
              </a>
            )}
            {settings.address && (
              <span className="flex items-start gap-1.5 text-sm text-tertiary-fixed-dim">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {settings.address}
              </span>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={settings[item.key] ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 ${LINK_CLASS}`}
                  >
                    {item.label}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-tertiary-container pt-6 text-center">
          <p className="text-xs text-tertiary-fixed-dim">
            © {year} {settings.siteName}. सर्वाधिकार सुरक्षित।
          </p>
        </div>
      </Container>
    </footer>
  );
}
