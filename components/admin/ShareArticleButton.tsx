"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { buildArticleUrl, buildWhatsAppShareUrl, copyArticleUrl, shareArticleNative } from "@/lib/share";

/**
 * Row-level "शेयर करें" action for NewsTable. This admin UI has no existing
 * action-menu/dropdown component to plug into (the row's other actions —
 * Edit / Publish toggle / Delete — are flat inline buttons), so this adds
 * one small anchored dropdown rather than a new UI pattern elsewhere in the
 * app; the open/close/click-outside/Escape behavior mirrors the one
 * precedent that does exist (HeaderNav's category overflow menu).
 *
 * Only enabled for published articles — a draft/archived article has no
 * working public URL (the backend only serves published articles to
 * anonymous visitors), so sharing one would hand out a dead link.
 */
export function ShareArticleButton({
  slug,
  title,
  published,
}: {
  slug: string;
  title: string;
  published: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!published) {
    return (
      <span
        title="शेयर करने के लिए पहले खबर प्रकाशित करें"
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-300"
      >
        <Share2 className="h-3.5 w-3.5" />
        शेयर करें
      </span>
    );
  }

  const url = buildArticleUrl(slug);

  async function handleCopy() {
    const ok = await copyArticleUrl(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleNativeShare() {
    const didShare = await shareArticleNative(title, url);
    if (didShare) setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
      >
        <Share2 className="h-3.5 w-3.5" />
        शेयर करें
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-52 rounded-md border border-ink-200 bg-white py-1.5 shadow-lg"
        >
          <li role="none">
            <a
              role="menuitem"
              href={buildWhatsAppShareUrl(title, url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              WhatsApp
            </a>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={handleCopy}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
              {copied ? "लिंक कॉपी हुआ" : "कॉपी लिंक"}
            </button>
          </li>
          {canNativeShare && (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={handleNativeShare}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                अन्य ऐप्स से शेयर करें
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
