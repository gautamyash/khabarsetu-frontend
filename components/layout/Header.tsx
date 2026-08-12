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
 *
 * Split into two independent elements — the tall masthead (date, logo,
 * tagline) and a slim navigation bar below it — because only the nav bar
 * is meant to stay pinned while scrolling. Making the ~260px-tall masthead
 * itself `sticky` was the earlier bug: it stayed pinned across the whole
 * page and buried article/card content underneath it. Now only the second
 * element (`sticky top-0 z-40`, opaque background, same border/z-index the
 * old single header used) stays fixed; the masthead is a normal block that
 * scrolls away like any other content. `MobileMenuToggle` moved down into
 * this nav bar too, since on mobile it *is* "the navigation" — this is the
 * "mobile navigation/header control" that must stay reachable without
 * scrolling back up. `HeaderNav` (desktop categories) and `MobileMenuToggle`
 * already self-hide on the other breakpoint (`hidden lg:block` /
 * `lg:hidden`), so both can sit in the same bar with no changes to either
 * component.
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
    <>
      <header className="border-b border-on-surface bg-surface-container-low">
        {/* Masthead flag rule — a thin solid maroon band across the very top
            of the page, the same "front page" cue newspapers use above the
            nameplate. */}
        <div className="h-[3px] bg-primary" aria-hidden />
        <Container className="flex flex-col py-5">
          <div className="relative flex items-center justify-between gap-4">
            {/* Left slot: dateline (sm and up) — the mobile menu control now
                lives in the sticky nav bar below, not here. */}
            <div className="flex flex-1 items-center gap-3">
              <div className="hidden min-w-0 items-center gap-3 text-sm font-medium text-secondary sm:flex">
                <span className="whitespace-nowrap">{today}</span>
                {settings.address && (
                  <>
                    <span className="h-4 w-px shrink-0 bg-outline" aria-hidden />
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
                  className="mb-2 h-11 w-11 rounded-full border-2 border-primary-container/20 object-cover"
                />
              )}
              <span className="font-serif-hi text-[36px] leading-[1.2] font-black tracking-tighter text-primary uppercase sm:text-[44px] md:text-[48px]">
                {settings.siteName}
              </span>
              <span className="mt-1.5 flex items-center gap-2 text-xs text-on-surface-variant sm:text-sm">
                <span className="h-px w-4 bg-outline" aria-hidden />
                {SITE_TAGLINE}
                <span className="h-px w-4 bg-outline" aria-hidden />
              </span>
            </Link>

            <div className="flex flex-1 items-center justify-end gap-4">
              <Link
                href="/search"
                aria-label={UI_TEXT.search}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-on-surface transition-colors hover:border-outline-variant hover:bg-surface-container-lowest hover:text-primary"
              >
                <Search className="h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Sticky navigation bar — the only part of the header that stays
          pinned on scroll. Opaque background + z-40 match what the old
          single sticky header used, so content never shows through and
          nothing renders above it. */}
      <div className="sticky top-0 z-40 border-b border-on-surface bg-surface-container-low">
        <Container className="flex items-center py-2.5 lg:py-0">
          <MobileMenuToggle categories={categories} />
          <HeaderNav categories={categories} />
        </Container>
      </div>
    </>
  );
}
