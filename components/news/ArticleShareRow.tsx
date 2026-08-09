"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Send, Share2 } from "lucide-react";

/**
 * Lightweight share controls for the article detail page. Deliberately built
 * on plain intent-URL anchors (wa.me / facebook.com/sharer / x.com/intent)
 * rather than a share-button npm package — no new dependency, no SDK script
 * to load, and each link works the same whether JS is enabled or not. Only
 * "copy link" needs client interactivity (clipboard + a brief confirmation),
 * which is why this whole row is a small client component.
 */
export function ArticleShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — silently
      // no-op rather than showing an alarming error for a non-critical action.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: MessageCircle,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Share2,
    },
    {
      key: "x",
      label: "X",
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: Send,
    },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ key, label, href, icon: Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          <Icon className="h-4 w-4" aria-hidden />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? "लिंक कॉपी हुआ" : "कॉपी लिंक"}
      </button>
    </div>
  );
}
