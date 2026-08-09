import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";
import { notoSansDevanagari, notoSerifDevanagari } from "@/lib/fonts";
import { SITE_NAME } from "@/lib/constants";

/**
 * Root layout for the entire /admin subtree.
 *
 * This is a *separate* root layout from app/(public)/layout.tsx (see Next's
 * "multiple root layouts" pattern) — the admin area intentionally does not
 * get the public site's Header/Footer/BreakingNewsBar. It defines its own
 * <html>/<body> and reuses the same Devanagari font setup so admin pages
 * stay visually consistent with the public site's typography.
 */
export const metadata: Metadata = {
  title: {
    default: `व्यवस्थापक | ${SITE_NAME}`,
    template: `%s | व्यवस्थापक | ${SITE_NAME}`,
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="hi"
      className={`${notoSansDevanagari.variable} ${notoSerifDevanagari.variable} h-full antialiased`}
    >
      <body className="h-full bg-ink-50 text-ink-900">{children}</body>
    </html>
  );
}
