"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Images, Loader2, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { formatFileSize, formatHindiDate } from "@/lib/utils";
import type { AdminMedia } from "@/types/media";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const INVALID_TYPE_MESSAGE = "कृपया केवल JPG, PNG या WEBP फोटो अपलोड करें।";

type UploadState = "idle" | "uploading" | "success" | "error";

/** Upload button + responsive grid for /admin/media. Client-side because
 * uploading needs a live progress/success/error state, deleting needs a
 * confirm dialog, and both should update the grid immediately without a
 * full page reload. Search and pagination stay server-side (see page.tsx)
 * — this component only ever holds one page's worth of items. */
export function MediaGrid({
  initialItems,
  canDelete,
  limit,
  search,
}: {
  initialItems: AdminMedia[];
  canDelete: boolean;
  limit: number;
  search?: string;
}) {
  const [items, setItems] = useState<AdminMedia[]>(initialItems);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<AdminMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMedia | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setUploadState("error");
      setUploadMessage(INVALID_TYPE_MESSAGE);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadState("error");
      setUploadMessage("फ़ाइल का आकार सीमा से बड़ा है।");
      return;
    }

    setUploadState("uploading");
    setUploadMessage("फोटो अपलोड हो रही है...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setUploadState("error");
        setUploadMessage(data?.message ?? "फोटो अपलोड नहीं हो सकी।");
        return;
      }

      // Keep this view to at most one page's worth — the new item always
      // belongs at the front (newest-first), so the last item drops off
      // rather than letting the grid grow past what the page's pagination
      // math (from the server) expects.
      setItems((prev) => [data.media as AdminMedia, ...prev].slice(0, limit));
      setUploadState("success");
      setUploadMessage("फोटो सफलतापूर्वक अपलोड हो गई।");
    } catch {
      setUploadState("error");
      setUploadMessage("फोटो अपलोड नहीं हो सकी।");
    }
  }

  function requestDelete(item: AdminMedia) {
    setDeleteError(null);
    setDeleteTarget(item);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/media/${deleteTarget.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setDeleteError(data?.message ?? "फोटो हटाई नहीं जा सकी।");
        setDeleteLoading(false);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteLoading(false);
    } catch {
      setDeleteError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploadState === "uploading"}
        className="flex items-center gap-2 rounded-sm bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {uploadState === "uploading" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
        फोटो अपलोड करें
      </button>

      {uploadMessage && (
        <p
          role="status"
          className={`mt-3 text-sm ${
            uploadState === "error"
              ? "text-brand-700"
              : uploadState === "success"
                ? "text-green-700"
                : "text-ink-600"
          }`}
        >
          {uploadMessage}
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-md border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
            <Images className="h-6 w-6 text-ink-300" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-ink-700">
            {search ? `"${search}" के लिए कोई फोटो नहीं मिली` : "अभी कोई फोटो अपलोड नहीं हुई है"}
          </p>
          <p className="mt-1 max-w-xs text-xs text-ink-500">
            {search ? "खोज को बदलकर पुनः प्रयास करें।" : "ऊपर दिए गए बटन से अपनी पहली फोटो अपलोड करें।"}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-md border border-ink-200 bg-white transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => setPreviewItem(item)}
                className="relative block aspect-video w-full overflow-hidden bg-ink-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only tool rendering arbitrary backend-hosted media URLs */}
                <img
                  src={item.url}
                  alt={item.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
              <div className="flex items-start justify-between gap-2 border-t border-ink-100 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink-900" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatHindiDate(item.createdAt)} · {formatFileSize(item.size)}
                  </p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => requestDelete(item)}
                    aria-label="हटाएं"
                    title="हटाएं"
                    className="shrink-0 rounded-sm p-1 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="फोटो हटाएं"
        message={deleteError ? deleteError : "क्या आप इस फोटो को हटाना चाहते हैं?"}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
