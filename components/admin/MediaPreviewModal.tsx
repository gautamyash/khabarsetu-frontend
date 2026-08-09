"use client";

import { useEffect } from "react";
import { formatFileSize, formatHindiDate } from "@/lib/utils";
import type { AdminMedia } from "@/types/media";

/**
 * Simple preview overlay — larger image, filename, size, upload date, and a
 * close button. Deliberately not a full lightbox (no keyboard nav, no
 * zoom/pan, no gallery stepping) — just enough to check an image before
 * picking or deleting it. Shared by /admin/media's grid and
 * FeaturedImagePicker so there's only one preview implementation.
 */
export function MediaPreviewModal({ item, onClose }: { item: AdminMedia | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.filename}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-md border border-ink-200 bg-white shadow-lg"
      >
        <div className="relative aspect-video w-full bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview, arbitrary backend-hosted URL */}
          <img src={item.url} alt={item.filename} className="h-full w-full object-contain" />
        </div>

        <div className="p-4">
          <p className="truncate text-sm font-semibold text-ink-900" title={item.filename}>
            {item.filename}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {formatFileSize(item.size)} · {formatHindiDate(item.createdAt)}
          </p>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              बंद करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
