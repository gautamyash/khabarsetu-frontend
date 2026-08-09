import type { Metadata } from "next";
import "../globals.css";
import { notoSansDevanagari, notoSerifDevanagari } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_TAGLINE } from "@/lib/constants";
import { SITE_URL } from "@/lib/site-url";
import { getSiteSettings } from "@/lib/site-settings-api";

/**
 * Root site metadata — the single place default title/description/OG/
 * Twitter values are defined; article and category pages only add their
 * own `title`/`description`/`alternates`/etc on top via generateMetadata,
 * they never redeclare these defaults (no duplicate metadata config).
 *
 * Site name/description come from getSiteSettings() (backend GET
 * /settings) rather than being hardcoded here, per "Site name should be
 * configurable rather than hardcoded" — falls back to the existing
 * SITE_NAME/SITE_DESCRIPTION constants if no settings row exists yet or
 * the request fails, so this can never break the page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteDescription } = await getSiteSettings();
  const description = siteDescription ?? undefined;
  const defaultTitle = `${siteName} | ${SITE_TAGLINE}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "hi_IN",
      siteName,
      title: defaultTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="hi"
      className={`${notoSansDevanagari.variable} ${notoSerifDevanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface text-on-surface">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
