import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PublicEmptyState } from "@/components/ui/PublicEmptyState";
import { getSiteSettings } from "@/lib/site-settings-api";
import { SITE_URL } from "@/lib/site-url";

/**
 * Contact page — renders only whatever contact fields the site owner has
 * actually filled in via the existing admin Settings page (site_settings:
 * contact_email/phone/address, same fields the Footer already shows
 * conditionally). Nothing here is invented: if none of these are set yet,
 * the page says so plainly instead of fabricating an address, phone
 * number, or email.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  const url = `${SITE_URL}/contact`;
  const description = `${siteName} से संपर्क करें।`;

  return {
    title: "संपर्क करें",
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title: `संपर्क करें | ${siteName}`, description, url },
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const hasAnyContactDetail = Boolean(settings.contactEmail || settings.phone || settings.address);

  return (
    <Container className="py-8 md:py-12">
      <div className="mb-8 border-b-2 border-on-surface pb-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="h-[3px] w-9 shrink-0 bg-primary" aria-hidden />
          <span className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">जानकारी</span>
        </div>
        <h1 className="font-serif-hi text-[34px] leading-[1.1] font-black tracking-tight text-on-surface sm:text-[44px]">
          संपर्क करें
        </h1>
      </div>

      {hasAnyContactDetail ? (
        <div className="flex max-w-xl flex-col gap-4">
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low/60 p-4 text-on-surface transition-colors hover:border-primary"
            >
              <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="font-bold">{settings.contactEmail}</span>
            </a>
          )}
          {settings.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low/60 p-4 text-on-surface transition-colors hover:border-primary"
            >
              <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="font-bold">{settings.phone}</span>
            </a>
          )}
          {settings.address && (
            <div className="flex items-start gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low/60 p-4 text-on-surface">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>{settings.address}</span>
            </div>
          )}
        </div>
      ) : (
        <PublicEmptyState
          icon={Mail}
          size="lg"
          title="संपर्क विवरण जल्द जोड़े जाएंगे"
          message="इस समय कोई संपर्क विवरण उपलब्ध नहीं है। कृपया बाद में पुनः जाँचें।"
        />
      )}
    </Container>
  );
}
