import { Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";

/**
 * Devanagari font strategy:
 * - Noto Sans Devanagari for UI chrome and body copy — highly legible at
 *   small sizes, wide language support, pairs cleanly with Latin numerals.
 * - Noto Serif Devanagari for headlines — gives the editorial, "newspaper of
 *   record" feel we want instead of a generic SaaS look.
 */
export const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-hi",
  display: "swap",
});

export const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["600", "700"],
  variable: "--font-serif-hi",
  display: "swap",
});
