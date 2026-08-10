"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { formatFileSize } from "@/lib/utils";
import type { AdminMedia } from "@/types/media";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 200 * 1024;
const INVALID_TYPE_MESSAGE = "कृपया केवल JPG, PNG या WEBP फोटो अपलोड करें।";

type UploadState = "idle" | "uploading" | "error";

/**
 * "मुख्य फोटो" field for NewsForm: preview + remove when an image is
 * selected, otherwise a button that opens a small inline panel to either
 * pick a previously uploaded image or upload a new one on the spot. Both
 * paths go through the same /api/admin/media endpoint the standalone
 * /admin/media page uses — no separate upload logic.
 *
 * Deliberately a simple inline-expanding panel rather than a modal dialog
 * (no focus trapping/portal) — keeps this within "no complex media-library
 * features" scope.
 */
export function FeaturedImagePicker({
  value,
  onChange,
  disabled,
  label = "मुख्य फोटो",
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  /** Alt text for the selected-image thumbnail — defaults to "मुख्य फोटो"
   * (NewsForm's original usage). Pass a different label when this picker is
   * reused for something else, e.g. "साइट लोगो" in SiteSettingsForm. */
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<AdminMedia[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  // Full metadata for the currently selected image, when known — set as
  // soon as it's picked/uploaded in this session. `value` alone (just a
  // URL) isn't enough to show a preview's filename/size/date.
  const [selectedMedia, setSelectedMedia] = useState<AdminMedia | undefined>(undefined);
  const [previewItem, setPreviewItem] = useState<AdminMedia | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When editing an existing article, `value` arrives as a bare URL with no
  // matching AdminMedia in state yet — quietly look it up once so the
  // filename/size can be shown inline under the thumbnail without the user
  // having to click through to the preview modal first.
  useEffect(() => {
    if (!value || (selectedMedia && selectedMedia.url === value)) return;
    let cancelled = false;
    (async () => {
      const list = items ?? (await fetchMediaList());
      if (cancelled) return;
      const match = list?.find((item) => item.url === value);
      if (match) setSelectedMedia(match);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when the selected URL itself changes
  }, [value]);

  async function fetchMediaList(): Promise<AdminMedia[] | null> {
    try {
      const response = await fetch("/api/admin/media");
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setListError(data?.message ?? "फोटो लोड नहीं हो सकीं।");
        return null;
      }
      const fetched = data.items as AdminMedia[];
      setItems(fetched);
      return fetched;
    } catch {
      setListError("फोटो लोड नहीं हो सकीं।");
      return null;
    }
  }

  async function openPicker() {
    setIsOpen(true);
    if (items !== null) return; // already loaded once this session
    await fetchMediaList();
  }

  /** The thumbnail for an already-selected image is clickable — this finds
   * (fetching the list first if needed, e.g. editing an article whose
   * featured image was set in an earlier session) the matching media so
   * the shared preview modal has filename/size/date to show, not just the
   * bare URL already visible in the thumbnail itself. */
  async function handlePreviewSelected() {
    if (!value) return;
    if (selectedMedia && selectedMedia.url === value) {
      setPreviewItem(selectedMedia);
      return;
    }
    const list = items ?? (await fetchMediaList());
    const match = list?.find((item) => item.url === value);
    if (match) {
      setSelectedMedia(match);
      setPreviewItem(match);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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

      const media = data.media as AdminMedia;
      setItems((prev) => (prev ? [media, ...prev] : [media]));
      setUploadState("idle");
      setUploadMessage("फोटो सफलतापूर्वक अपलोड हो गई।");
      setSelectedMedia(media);
      onChange(media.url);
      setIsOpen(false);
    } catch {
      setUploadState("error");
      setUploadMessage("फोटो अपलोड नहीं हो सकी।");
    }
  }

  function renderPanel() {
    return (
      <div className="mt-3 max-w-xl rounded-md border border-ink-200 bg-ink-50 p-3">
        <div className="flex items-center justify-between gap-3">
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
            className="flex items-center gap-2 rounded-sm bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploadState === "uploading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden />
            )}
            नई फोटो अपलोड करें
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-medium text-ink-500 hover:underline"
          >
            बंद करें
          </button>
        </div>

        {uploadMessage && (
          <p className={`mt-2 text-xs ${uploadState === "error" ? "text-brand-700" : "text-ink-600"}`}>
            {uploadMessage}
          </p>
        )}

        {listError && <p className="mt-3 text-xs text-brand-700">{listError}</p>}

        {items === null && !listError && (
          <p className="mt-3 text-xs text-ink-500">फोटो लोड हो रही हैं...</p>
        )}

        {items !== null && items.length === 0 && (
          <p className="mt-3 text-xs text-ink-500">अभी कोई फोटो अपलोड नहीं हुई है।</p>
        )}

        {items !== null && items.length > 0 && (
          <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedMedia(item);
                  onChange(item.url);
                  setIsOpen(false);
                }}
                title={item.filename}
                className="relative aspect-square overflow-hidden rounded-sm border border-ink-200 hover:ring-2 hover:ring-brand-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only picker thumbnail, arbitrary backend-hosted URL */}
                <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (value) {
    return (
      <div>
        <button
          type="button"
          onClick={handlePreviewSelected}
          title="बड़ा देखें"
          className="relative block h-40 w-full max-w-xs overflow-hidden rounded-md border border-ink-200 bg-ink-100 sm:h-48"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary backend-hosted media URL, not a static site asset */}
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </button>
        {selectedMedia && selectedMedia.url === value && (
          <p className="mt-1.5 truncate text-xs text-ink-500" title={selectedMedia.filename}>
            {selectedMedia.filename} · {formatFileSize(selectedMedia.size)}
          </p>
        )}
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            className="text-sm font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            बदलें
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelectedMedia(undefined);
              onChange(undefined);
            }}
            className="flex items-center gap-1 text-sm font-medium text-ink-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            हटाएं
          </button>
        </div>
        {isOpen && renderPanel()}
        <MediaPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className="flex items-center gap-2 rounded-sm border border-dashed border-ink-300 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" aria-hidden />
        फोटो चुनें
      </button>
      {isOpen && renderPanel()}
    </div>
  );
}
