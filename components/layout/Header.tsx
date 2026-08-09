import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MobileMenuToggle } from "@/components/layout/MobileMenuToggle";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { listCategories } from "@/lib/categories-api";
import { getSiteSettings } from "@/lib/site-settings-api";
import { SITE_TAGLINE, UI_TEXT } from "@/lib/constants";
import { formatHindiDate } from "@/lib/utils";
import type { AdminCategory } from "@/types/category";

/**
 * Masthead-style header matching the Stitch Homepage reference's
 * TopAppBar: a dateline on the left (hidden on mobile), a large centered
 * serif masthead + tagline, and icon-only search/menu controls on the
 * right — followed by a centered, rule-bordered category strip. Async
 * Server Component so the masthead text and nav use real database-backed
 * site settings / categories, exactly like the previous header.
 *
 * The dateline's second half ("· <city>") only renders when a real
 * address is set in the admin site settings — unlike the Stitch mock
 * (which hardcodes "नई दिल्ली"), this never fabricates a location.
 */
export async function Header() {
  let categories: AdminCategory[] = [];
  try {
    categories = await listCategories();
  } catch {
    categories = [];
  }

  const settings = await getSiteSettings();
  const today = formatHindiDate(new Date().toISOString());

  return (
    <header className="sticky top-0 z-40 border-b border-on-surface bg-surface">
      <Container className="flex flex-col py-4">
        <div className="relative mb-6 flex items-center justify-between gap-4">
          {/* Left slot: hamburger (mobile/tablet, self-hides at lg via its
              own internal breakpoint) + dateline (sm and up), matching the
              Stitch TopAppBar's menu-icon-on-the-left mobile layout. */}
          <div className="flex flex-1 items-center gap-3">
            <MobileMenuToggle categories={categories} />
            <div className="hidden min-w-0 items-center gap-3 text-sm text-secondary sm:flex">
              <span className="whitespace-nowrap">{today}</span>
              {settings.address && (
                <>
                  <span className="h-4 w-px shrink-0 bg-outline-variant" aria-hidden />
                  <span className="truncate">{settings.address}</span>
                </>
              )}
            </div>
          </div>

          <Link href="/" className="flex flex-col items-center text-center leading-none">
            {settings.logoUrl && (
              <Image
                src={settings.logoUrl}
                alt={settings.siteName}
                width={44}
                height={44}
                className="mb-1.5 h-11 w-11 rounded-full object-cover"
              />
            )}
            <span className="font-serif-hi text-[36px] leading-[1.2] font-black tracking-tighter text-primary uppercase sm:text-[44px] md:text-[48px]">
              {settings.siteName}
            </span>
            <span className="mt-1 text-xs text-on-surface-variant sm:text-sm">{SITE_TAGLINE}</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4">
            <Link
              href="/search"
              aria-label={UI_TEXT.search}
              className="flex h-9 w-9 items-center justify-center text-on-surface transition-colors hover:text-primary"
            >
              <Search className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>

        <HeaderNav categories={categories} />
      </Container>
    </header>
  );
}
