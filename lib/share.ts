import { SITE_URL } from "@/lib/site-url";

/**
 * Shared article-sharing helpers, used by both the public article page's
 * ArticleShareRow and the admin NewsTable's ShareArticleButton so the two
 * surfaces always build/copy/share the exact same public URL rather than
 * duplicating this logic (and risking it drifting) in two places.
 */

/** Canonical public article URL — same `${SITE_URL}/news/${slug}` pattern
 * already used inline by the article detail page (shareUrl/JSON-LD). */
export function buildArticleUrl(slug: string): string {
  return `${SITE_URL}/news/${slug}`;
}

/** Standard wa.me share link: a single URL-encoded text field containing
 * the article title, a blank line, then the public URL. */
export function buildWhatsAppShareUrl(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${url}`)}`;
}

/** Copies a URL to the clipboard, swallowing failures (permissions,
 * insecure context) — copy-link is a non-critical convenience action, not
 * worth surfacing an alarming error for. Returns whether it succeeded so
 * callers can drive their own inline success feedback (this project has no
 * global toast system — every existing action here uses this same
 * swap-the-label-briefly pattern instead). */
export async function copyArticleUrl(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/** Wraps navigator.share with the two fields we ever pass it (title + url,
 * no `text`). Returns false — without throwing — when the API is
 * unsupported, when the user cancels the share sheet (AbortError), or on
 * any other failure, so callers never need their own try/catch and never
 * show an error for a user cancellation. */
export async function shareArticleNative(title: string, url: string): Promise<boolean> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  try {
    await navigator.share({ title, url });
    return true;
  } catch {
    return false;
  }
}
